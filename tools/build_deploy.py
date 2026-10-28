"""Sestaví složku pro nahrání na ostrý hosting: jen publikované stránky, bez noindex, s canonical, sitemap a robots.
Použití: python3 tools/build_deploy.py [cílová_složka]  (výchozí: ../janak-deploy)"""
import re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'janak-deploy'
DOMAIN = 'https://instalaterstvi-janak.cz'
PAGES = ['index', 'topeni', 'kanalizace', 'rekonstrukce', 'svj-developeri', 'fotogalerie', 'ochrana-soukromi', 'zasady-cookies']

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
shutil.copytree(ROOT / 'assets', OUT / 'assets')
shutil.copy(ROOT / 'odeslat.php', OUT / 'odeslat.php')

for p in PAGES:
    html = (ROOT / f'{p}.html').read_text(encoding='utf-8')
    url = DOMAIN + '/' + ('' if p == 'index' else f'{p}.html')
    html, n = re.subn(r'<meta name="robots" content="noindex, nofollow">', f'<link rel="canonical" href="{url}">', html)
    assert n == 1, p
    # náhledový web na GitHub Pages a www varianta -> ostrá doména bez www (sjednocení s canonical)
    html = html.replace('https://j4manek.github.io/janak-web-navrh/index.html', DOMAIN + '/')
    html = html.replace('https://j4manek.github.io/janak-web-navrh/', DOMAIN + '/')
    html = html.replace('https://www.instalaterstvi-janak.cz', DOMAIN)
    assert 'github.io' not in html, p
    (OUT / f'{p}.html').write_text(html, encoding='utf-8')

urls = [DOMAIN + '/' + ('' if p == 'index' else f'{p}.html') for p in PAGES]
(OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n', encoding='utf-8')
(OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /odeslat.php\nSitemap: {DOMAIN}/sitemap.xml\n', encoding='utf-8')
print('hotovo:', OUT, len(PAGES), 'stránek')
