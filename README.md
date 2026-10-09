# Návrh webu Janak instalatérství (lokální prototyp)

Návrh vychází z původního webu janak-instalaterstvi.cz a z rešerše pro Google Ads (2026-10-05). Design, fonty, barvy a ikony jsou převzaté z původního webu.

## Spuštění

```bash
cd outputs/janak-web-navrh-local
python3 -m http.server 8000
```

Pak otevřete http://localhost:8000. Stránky lze otevřít i přímo v prohlížeči (`index.html`), ale některé části fungují až přes server.

## Stránky

| Soubor | Obsah |
|---|---|
| `index.html` | Hlavní stránka: hero, služby, oblast, o nás, reference, kontakt |
| `topeni.html` | Landing pro topení a servis kotle |
| `kanalizace.html` | Landing pro kanalizaci a čištění |
| `rekonstrukce.html` | Landing pro instalatérské práce při rekonstrukci |
| `svj-bytove-domy.html` | Samostatná, vizuálně odlišená (premium) stránka pro SVJ a bytové domy – vlastní formulář |
| `developeri.html` | Samostatná, vizuálně odlišená (premium) stránka pro developery a novostavby – vlastní formulář |
| `MERENI.md` | Co a jak se měří, co je potřeba doplnit |

## Co se změnilo oproti původnímu webu

Podle bodů z rešerše (kapitola 5):

- **Telefon jako hlavní CTA** v hero a plovoucí lišta na mobilu (P1).
- **Samostatné landing stránky** pro topení, kanalizaci a rekonstrukci (P1).
- **Havárie odstraněna jako marketingový cíl** (2026-10-07): zrušena dedikovaná landing stránka, červené tlačítko „Havárie" v hlavičce i zmínky v hero/meta. Firma havárie stále řeší, ale web už je nenabízí jako hlavní kanál.
- **Nové premium stránky pro SVJ a developery** (2026-10-07): `svj-bytove-domy.html` a `developeri.html` mají vlastní, výrazně odlišený vizuální styl (tmavé pozadí, serifový nadpisový font, měděný akcent – viz `assets/css/premium.css`) a samostatný formulář, který může chodit na jiný e-mail/kanál než hlavní poptávka (`JANAK_LEAD_ENDPOINT_SVJ` / `JANAK_LEAD_ENDPOINT_DEVELOPERI` v `assets/js/mereni.js`). Cílová adresa zatím **[ověřit]**.
- **Nové `<title>` a popisy** se službou a lokalitou (P1).
- **Sekce Kde působíme** (P1): cílení na Královéhradecký a Pardubický kraj, bez zdůrazňování Vamberku. Adresa zůstává v kontaktu a v patičce.
- **Zkrácený formulář**: jméno, telefon, popis. Souhlas se zpracováním osobních údajů (původní formulář ho neměl).
- **Nadpis hero** srozumitelný s lokalitou, původní poetická věta zůstala jako podtext (P2).
- **Humor ztlumen** na jednu větu na stránku (P2).
- **Odstraněna nepodložená tvrzení**: „500+ projektů“, „100 % spokojenost“, „3+ roky“, „partneři velkých firem“, „stovky zakázek po celé republice“, „největší festival ve střední Evropě“ a „Vždy přijedeme“ (nahrazeno ověřitelnou formulací z recenzí).
- **Recenze** ponechány všechny pět včetně negativní (jako na původním webu). Hvězdičky jsou ale dekorativní, na původním webu je každá recenze pět hvězd, a to nevypovídá o skutečném hodnocení.
- **Podle auditu (duben 2026)**: červené tlačítko „Havárie – volejte hned“ v hlavičce (od 640 px), položka SVJ v menu, sekce Oblast s odkazem na mapu, rozšířený JSON-LD (logo, profily Facebook a Instagram).
- **Měření**: události do `dataLayer` (viz `MERENI.md`).

Z auditu jsem nepřevzal: „Příjezd do 2 hodin“, „Dostupní 24/7“, banner „4.9 · 47 recenzí na Google“ a Review schema s hodnocením. Ta čísla rešerše označila za nepodložená. Fotogalerie „Před & Po“ zůstává na původním webu.
- **JSON-LD** (typ Plumber) s údaji, které jsou ověřené (P3).
- **Přístupnost**: alternativní texty u loga, popisky odkazů na sociální sítě, opravený popis odkazu v hlavičce (původně „Nuxt UI“).

## Otevřené body

Všechny nepotvrzené údaje jsou v textu označené žlutě, např. **[ověřit]**. Před spuštěním je potřeba je potvrdit s majitelem a odstranit:

1. **Oblast**: cílení je Královéhradecký a Pardubický kraj (podle majitele), větší projekty i mimo ně. Potvrdit okresy a maximální vzdálenost.
2. ~~Hodnocení na firmy.cz~~ – **ověřeno 9. 10. 2026 přímo na [firmy.cz](https://en.firmy.cz/company/13757941-instalater-kevin-janak-vamberk.html): 5.0 z 11 recenzí.**
3. **Google profil**: nepodařilo se dohledat přes web search. Pokud existuje, doplní majitel odkaz a počet hodnocení.
4. **Zásady ochrany osobních údajů**: odkaz v souhlasu zatím nevede na existující stránku, je to placeholder.
5. **Texty služeb na landing stránkách** jsou návrhy vycházející z nabídky na původním webu. Majitel musí potvrdit, že je firma všechny nabízí.
6. **Transparentní ceny**: web to tvrdí, ale žádnou cenu neuvádí. Rozhodnutí je na majiteli.
7. **Cílový e-mail/kanál pro poptávky ze stránek SVJ a Developeři**: zatím nerozhodnuto (jen připravené proměnné `JANAK_LEAD_ENDPOINT_SVJ` a `JANAK_LEAD_ENDPOINT_DEVELOPERI`), teď šlo jen o grafický návrh.
8. ~~Pracovní doba~~ – **ověřeno 9. 10. 2026 na vlastním webu i firmy.cz: Po–Pá 08:00–18:00, mimo to dle domluvy.** Havárie/24/7 na původním webu zmíněné, ale v rozporu s uvedenou dobou – záměrně nepřevzato (viz redesign bez havárie jako hlavního CTA).

## Technické poznámky

- Stránky mají `noindex`. Před nasazením odstranit (`<meta name="robots">`).
- Formulář zatím neodesílá nic, pouze ukáže potvrzení - **do doby, než se nastaví
  `window.JANAK_LEAD_ENDPOINT`** (viz `assets/js/mereni.js`). Napojení na Telegram
  (s tagem urgence/velikosti zakázky) je hotové jako samostatný balíček v
  `outputs/lead-telegram-automation/` - chybí jen nasazení (Cloudflare Worker + Telegram
  bot, viz README tam). Po nasazení stačí nastavit `JANAK_LEAD_ENDPOINT` na URL Workeru.
  Formuláře na `svj-bytove-domy.html` a `developeri.html` mají `data-lead-endpoint-var`
  a čtou místo toho `JANAK_LEAD_ENDPOINT_SVJ` / `JANAK_LEAD_ENDPOINT_DEVELOPERI` – takže
  mohou chodit jinam (jiný Worker, jiný e-mail) než hlavní poptávka.
- Měření běží jen po souhlasu v banneru (volba se pamatuje v prohlížeči). Štítky u tlačítek ukazují, co se měří a proč (viz `MERENI.md`).
- Obrázky, fonty a CSS jsou stažené z původního webu (2026-10-06) pro lokální běh.
- `index.html` a landing stránky mají společné části (hlavička, patička, lišta volání) napevno v HTML. Při větších změnách doporučuji přejít na šablonu.
