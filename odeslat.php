<?php
// Příjem poptávek z formulářů na webu: pošle e-mail na info@ a vrátí JSON, který čeká assets/js/mereni.js.
const TO = 'info@instalaterstvi-janak.cz';
const FROM = 'info@instalaterstvi-janak.cz'; // odesílatel musí být z domény hostingu, jinak zprávu zahodí spam filtr
const MAX_PHOTO = 8 * 1024 * 1024;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(bool $ok, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => $ok]);
    exit;
}

// Hlavičky a pole bez zalomení řádků, aby se nedaly vložit další hlavičky e-mailu
function clean(string $v, int $max = 2000): string {
    $v = trim(preg_replace('/[\r\n]+/', ' ', $v));
    return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(false, 405);
if (!empty($_POST['_honey'])) reply(true); // robot: tvářit se, že se povedlo

$name = clean($_POST['name'] ?? '', 120);
$phone = clean($_POST['phone'] ?? '', 40);
$email = clean($_POST['email'] ?? '', 160);
$address = clean($_POST['address'] ?? '', 200);
$service = clean($_POST['service'] ?? '', 60);
$message = mb_substr(trim(str_replace("\r", '', $_POST['message'] ?? '')), 0, 4000);

if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) < 9 || empty($_POST['gdpr'])) reply(false, 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(false, 422);

// Jednoduchá ochrana proti zahlcení: max. 5 odeslání za hodinu z jedné IP
$ipFile = sys_get_temp_dir() . '/janak_lead_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
$hits = array_filter(array_map('intval', @file($ipFile, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 3600);
if (count($hits) >= 5) reply(false, 429);
$hits[] = time();
@file_put_contents($ipFile, implode("\n", $hits));

$subject = 'Nová poptávka z webu' . ($service !== '' ? ' (' . $service . ')' : '');
$lines = ['Jméno: ' . $name, 'Telefon: ' . $phone];
if ($email !== '') $lines[] = 'E-mail: ' . $email;
if ($address !== '') $lines[] = 'Adresa / SVJ: ' . $address;
if ($service !== '') $lines[] = 'Služba: ' . $service;
$lines[] = 'Stránka: ' . clean($_SERVER['HTTP_REFERER'] ?? '', 200);
$body = implode("\n", $lines) . "\n\nZpráva:\n" . ($message !== '' ? $message : '(bez zprávy)') . "\n";

$headers = ['From: Web Janák <' . FROM . '>', 'MIME-Version: 1.0'];
if ($email !== '') $headers[] = 'Reply-To: ' . $email;

// Fotka je nepovinná, přiloží se jen skutečný obrázek do 8 MB
$photo = $_FILES['photo'] ?? null;
$attach = null;
if ($photo && $photo['error'] === UPLOAD_ERR_OK && $photo['size'] > 0 && $photo['size'] <= MAX_PHOTO) {
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/heic' => 'heic'][$mime] ?? null;
    if ($ext) $attach = [$mime, 'foto.' . $ext, chunk_split(base64_encode(file_get_contents($photo['tmp_name'])))];
}

if ($attach) {
    $b = 'b' . bin2hex(random_bytes(8));
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $b . '"';
    $payload = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($body))
        . "--$b\r\nContent-Type: {$attach[0]}; name=\"{$attach[1]}\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$attach[1]}\"\r\n\r\n"
        . $attach[2] . "--$b--";
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: base64';
    $payload = chunk_split(base64_encode($body));
}

$ok = mail(TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $payload, implode("\r\n", $headers), '-f' . FROM);
reply($ok, $ok ? 200 : 500);
