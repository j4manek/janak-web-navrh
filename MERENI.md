# Měření webu: co lze sledovat

Tento dokument popisuje, co na novém webu uvidíte o návštěvnících a poptávkách, jak se to měří a co je potřeba doplnit před spuštěním reklam.

## 1. Co se měří dnes

Na současném webu je jen **Google Analytics 4** (ID G-E4GBFEEDG0). Ukáže návštěvy, odkud lidé přicházejí a jak dlouho zůstávají. **Neukáže**, kolik lidí klikne na telefon, kolik odešle formulář, ani nepřipojuje reklamy. Google Ads tag na webu chybí.

**Update 10. 10. 2026 (tento návrh):** GA4 tag (gtag.js) je teď na všech stránkách návrhu zapojený přímo, s Google Consent Mode v2 (viz bod 3). Produkční web ho zatím nemá – tahle část popisuje stav v `outputs/janak-web-navrh-local/`, ne na janak-instalaterstvi.cz.

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
2. **Souhlas návštěvníků s cookies**: analytické a reklamní měření v ČR vyžaduje souhlas návštěvníka. Banner s volbou „Přijmout měření“ / „Odmítnout“ je hotový a napojený na **Google Consent Mode v2** – `gtag('consent', 'default', ...)` nastaví vše na „denied“ při načtení stránky, `gtag('consent', 'update', ...)` se zavolá až po kliknutí v banneru. Bez souhlasu GA4 neukládá cookies ani neidentifikuje návštěvníka. Volbu lze změnit v patičce.
3. ~~Google Tag Manager kontejner~~ – **vyřešeno jinak: GA4 (gtag.js, ID G-E4GBFEEDG0) je zapojený přímo přes `assets/js/mereni.js`, bez GTM kontejneru.** Jednodušší na údržbu u statického webu bez vlastního backendu. **Zbývá** (v Google účtech, ne na webu):
   - V GA4 admin konzoli označit `generate_lead` a `phone_click` jako **klíčové události** (key events) – bez toho je Google Ads neumí importovat jako konverze.
   - ~~Ověřit propojení GA4 s Google Ads~~ – **potvrzeno 10. 10. 2026**: v účtu 257-552-2698 existuje konverzní akce typu `GOOGLE_ANALYTICS_4_PURCHASE`, což propojení dokazuje (bez něj by nemohla existovat).
   - Po propojení v Google Ads **importovat** `generate_lead` a `phone_click` jako konverzní akce (primary), ostatní (`form_start`, `cta_click`, `email_click`) jako sekundární/needefinovat pro bidding.
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
4. Všechny události jsou v `window.dataLayer` jako skutečná `gtag('event', ...)` volání.
5. Na nasazeném webu (ne localhost) lze ověřit reálné doručení do GA4 přes **Realtime report** nebo **DebugView** (GA4 admin → Debug View, nutné přidat `?debug_mode=true` do adresy nebo rozšíření Google Analytics Debugger).

Lokální běh nic neposílá do Google – `gtag.js` se na `localhost`/`127.0.0.1` vůbec nenačítá (viz `mereni.js`), aby testovací návštěvy nepsaly do ostrých dat. Na GitHub Pages i na ostrém webu se `gtag.js` načítá vždy (kvůli Consent Mode v2), ale bez souhlasu neidentifikuje návštěvníka ani neukládá cookie.

## 7. Co sledovat každý týden

| Ukazatel | Odkud | Poznámka |
|---|---|---|
| Počet poptávek (`generate_lead`) | Web / GA4 | Hlavní výsledek |
| Počet hovorů z reklamy | Google Ads | Až po zapojení rozšíření volání |
| Počet kliků na telefon (`phone_click`) | Web / GA4 | Ukazuje zájem, ne skutečné hovory |
| Podíl poptávek na návštěvách | GA4 | Konverzní poměr webu |
| Cena za poptávku | Náklady z Ads / počet poptávek | Počítá se až po rozjetí kampaní |
