# Měření webu: co lze sledovat

Tento dokument popisuje, co na novém webu uvidíte o návštěvnících a poptávkách, jak se to měří a co je potřeba doplnit před spuštěním reklam.

## 1. Co se měří dnes

Na současném webu je jen **Google Analytics 4** (ID G-E4GBFEEDG0). Ukáže návštěvy, odkud lidé přicházejí a jak dlouho zůstávají. **Neukáže**, kolik lidí klikne na telefon, kolik odešle formulář, ani nepřipojuje reklamy. Google Ads tag na webu chybí.

## 2. Co návrh přidává

Návrh posílá na každou důležitou akci jednu událost. Události jsou popsané níže a v prototypu je uvidíte v konzoli prohlížeče.

| Událost | Kdy se spustí | Kde na webu | Co z toho zjistíte | Použití v Google Ads |
|---|---|---|---|---|
| `phone_click` | Kliknutí na telefonní číslo | Hlavička, hero, plovoucí lišta na mobilu, kontakt, landing stránky | Kolik lidí chce zavolat a z které části stránky | Konverze (primární) |
| `generate_lead` | Odeslání formuláře | Všechny formuláře | Počet poptávek, z které stránky a pro jakou službu | Konverze (primární) |
| `form_start` | První kliknutí do formuláře | Všechny formuláře | Kolik lidí formulář otevře, a které pole jako první | Sekundární |
| `form_field` | První vyplnění každého pole | Formuláře | Kde lidé ztrácejí zájem a jak dlouho | Jen pro diagnostiku |
| `form_error` | Odeslání s neplatným nebo prázdným polem | Formuláře | Které pole dělá potíže | Jen pro diagnostiku |
| `form_abandon` | Odchod ze stránky nebo přepnutí karty bez odeslání | Formuláře | Poslední pole, na kterém lidé odešli | Jen pro diagnostiku |
| `cta_click` | Klik na tlačítko nebo kartu služby | Hero, karty služeb, další služby | Které služby lidé vybírají | Sekundární |
| `email_click` | Klik na e-mail | Kontakt | Zájem o psaní e-mailem | Sekundární |

Poznámka k `phone_click`: měří **klik** na číslo, ne **skutečný hovor**. Hovor se musí měřit zvlášť (viz bod 3).

## 3. Co se měří v Google Ads (ne na webu)

- **Hovory z reklamy**: rozšíření volání ukáže, kolik lidí zavolalo přímo z reklamy. Musí se nastavit minimální délka hovoru, od které se počítá jako konverze. Výchozí hodnotu ověříme v účtu.
- **Zobrazení, kliky, cena za klik**: běžné výkonnostní údaje po kampaních.
- **Kdy přicházejí poptávky a hovory**: podle hodiny a dne v týdnu. Pomůže to nastavit pohotovost.
- **Hledané dotazy**: co lidé psali do vyhledávání před kliknutím na reklamu. Podle nich se vyřazují nevhodné dotazy.

## 4. Co je potřeba doplnit před spuštěním

1. **Sledování hovorů z webu**: buď dynamické telefonní číslo (každý zdroj má jiné číslo, takže víte, odkud hovor přišel), nebo jen rozšíření volání v reklamě. Rozhodnutí je na majiteli, protože ovlivní, jaké číslo je na webu.
2. **Souhlas návštěvníků s cookies**: analytické a reklamní měření v ČR vyžaduje souhlas návštěvníka. Prototyp už má banner s volbou „Přijmout měření“ / „Odmítnout“. Bez souhlasu se žádná událost neodešle. Volbu lze změnit v patičce. Na ostrém webu musí banner schválit správce a napojit ho na Google Consent Mode v2.
3. **Google Tag Manager kontejner** a **konverzní akce v Google Ads** (ID a popisek konverze). Založí se v účtu klienta, zatím je neznáme.
4. **Kam chodí poptávky**: vyřešeno automatizací do Telegramu s automatickým tagem urgence/velikosti zakázky (`outputs/lead-telegram-automation/`), čeká se jen na nasazení (Cloudflare Worker + Telegram bot) a nastavení endpointu ve `assets/js/mereni.js`. Formuláře na `svj-bytove-domy.html` a `developeri.html` mají vlastní proměnné (`JANAK_LEAD_ENDPOINT_SVJ`, `JANAK_LEAD_ENDPOINT_DEVELOPERI`), takže mohou chodit na jiný e-mail/kanál než hlavní formulář – cílová adresa zatím **[ověřit]**, čeká na rozhodnutí majitele.
5. **Hodnota zakázky**: průměrná částka za topení, rekonstrukci, SVJ a developerskou zakázku. Bez ní nejde spočítat návratnost reklamy, jen cena za poptávku.

## 5. Co se realisticky změřit nedá

- **Zda poptávka skončí zakázkou.** Měření končí u formuláře. Výsledek zakázky je potřeba zapisovat do evidence (CRM nebo tabulka) a párovat s poptávkou.
- **Hovory bez sledovacího čísla** se nedají přiřadit ke konkrétní reklamě. Hovor z reklamy zachytí rozšíření volání, hovor z webu bez dynamického čísla ne.
- **Lidé, kteří si číslo zapamatují** a zavolají později z jiného zařízení.

U každého klíčového tlačítka je štítek: co se spustí (např. `phone_click`), kam to jde v Google Ads, proč to měříme a zda se právě měří. Štítek je hned vedle tlačítka a jeho stav se mění podle volby v banneru.

## 6. Jak si návrh vyzkoušet

1. Spustit web podle [README.md](README.md).
2. Otevřít vývojářské nástroje prohlížeče (konzole).
3. Přijmout měření v banneru a kliknout na telefonní číslo nebo odeslat formulář. V konzoli se objeví řádek `[měření]` s danou událostí. Bez souhlasu se nic neodešle.
4. Všechny události jsou v `window.dataLayer`.

Lokální běh nic neposílá do Google. Analytika se na localhostu záměrně nenačítá, aby testovací návštěvy nepsaly do ostrých dat.

## 7. Co sledovat každý týden

| Ukazatel | Odkud | Poznámka |
|---|---|---|
| Počet poptávek (`generate_lead`) | Web / GA4 | Hlavní výsledek |
| Počet hovorů z reklamy | Google Ads | Až po zapojení rozšíření volání |
| Počet kliků na telefon (`phone_click`) | Web / GA4 | Ukazuje zájem, ne skutečné hovory |
| Podíl poptávek na návštěvách | GA4 | Konverzní poměr webu |
| Cena za poptávku | Náklady z Ads / počet poptávek | Počítá se až po rozjetí kampaní |
