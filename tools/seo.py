#!/usr/bin/env python3
"""SEO před spuštěním: sitemap.xml, robots.txt, canonical, og:url, og:image.

Použití (až bude známá ostrá doména):
  python3 tools/seo.py https://www.priklad.cz            # doplní canonical, og:*, sitemap
  python3 tools/seo.py https://www.priklad.cz --launch   # navíc odstraní noindex (ostré spuštění)
Skript lze spustit opakovaně, nic se nezdvojuje."""
import re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
if len(sys.argv) < 2 or not sys.argv[1].startswith('http'):
    sys.exit(__doc__)
base = sys.argv[1].rstrip('/'); launch = '--launch' in sys.argv
SKIP = {'ochrana-soukromi.html', 'zasady-cookies.html', 'svj-bytove-domy.html', 'developeri.html'}
urls = []
for f in sorted(ROOT.glob('*.html')):
    s = f.read_text(); url = base + ('/' if f.name == 'index.html' else '/' + f.name)
    s = re.sub(r'\s*<link rel="canonical"[^>]*>', '', s)
    s = re.sub(r'<meta property="og:url"[^>]*>', f'<meta property="og:url" content="{url}">', s)
    s = re.sub(r'<meta property="og:image"[^>]*>', f'<meta property="og:image" content="{base}/assets/img/og-image.jpg">', s)
    s = s.replace('</title>', f'</title>\n<link rel="canonical" href="{url}">', 1)
    if launch:
        s = re.sub(r'<meta name="robots" content="noindex, nofollow">\s*', '', s)
    f.write_text(s)
    if f.name not in SKIP: urls.append(url)
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n'
(ROOT / 'sitemap.xml').write_text(sm)
(ROOT / 'robots.txt').write_text(('User-agent: *\nAllow: /\n' if launch else 'User-agent: *\nDisallow: /\n') + f'Sitemap: {base}/sitemap.xml\n')
print('Hotovo:', len(urls), 'stránek v sitemap.xml', '(ostrý režim, noindex odstraněn)' if launch else '(noindex ponechán)')
