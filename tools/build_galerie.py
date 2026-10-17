#!/usr/bin/env python3
"""Sestaví fotogalerii z fotek ve složkách assets/img/galerie/<kategorie>/.

Použití:  python3 tools/build_galerie.py
- Fotky (jpg/jpeg/png/webp/heic) hoďte do složky podle kategorie: voda, topeni, kanalizace, koupelny.
- Název souboru = popisek fotky (např. "Výměna rozvodů v bytovém domě.jpg").
- Skript vytvoří zmenšené verze (náhled 800 px, velká 1800 px) do assets/img/galerie/_web/
  a přepíše mřížku ve fotogalerie.html mezi značkami GALERIE-START a GALERIE-KONEC.
Originály zůstávají beze změny.
"""
import html, re, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/galerie'
OUT = SRC / '_web'
KATEGORIE = [('voda', 'Voda'), ('topeni', 'Topení'), ('kanalizace', 'Kanalizace'), ('koupelny', 'Koupelny a rekonstrukce')]
EXT = {'.jpg', '.jpeg', '.png', '.webp'}

def slug(s):
    t = s.lower()
    for a, b in zip('áäčďéěëíňóöřšťúůüýž', 'aacdeeeinoorstuuuyz'):
        t = t.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

def zmensi(src, dst, maxpx, q):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)

OUT.mkdir(exist_ok=True)
polozky, pouzite = [], set()
for kat, nazev in KATEGORIE:
    for f in sorted((SRC / kat).glob('*')):
        if f.suffix.lower() not in EXT:
            continue
        popis = f.stem.strip()
        base = f'{kat}-{slug(popis)}'
        zmensi(f, OUT / f'{base}-m.jpg', 800, 80)
        zmensi(f, OUT / f'{base}-v.jpg', 1800, 85)
        pouzite |= {f'{base}-m.jpg', f'{base}-v.jpg'}
        polozky.append((kat, nazev, popis, base))
for f in OUT.glob('*.jpg'):
    if f.name not in pouzite:
        f.unlink()

chips = ['<button type="button" class="gal-chip is-active" data-filter="vse">Vše</button>']
for kat, nazev in KATEGORIE:
    if any(p[0] == kat for p in polozky):
        chips.append(f'<button type="button" class="gal-chip" data-filter="{kat}">{html.escape(nazev)}</button>')
items = []
for kat, nazev, popis, base in polozky:
    p = html.escape(popis)
    items.append(
        f'<button type="button" class="gallery-item" data-cat="{kat}" data-full="assets/img/galerie/_web/{base}-v.jpg" aria-label="Zvětšit fotku: {p}">'
        f'<img src="assets/img/galerie/_web/{base}-m.jpg" alt="{p}" loading="lazy">'
        f'<span class="gallery-item__caption">{p}</span></button>')
blok = ('<!--GALERIE-START-->\n<div class="gal-filters" role="group" aria-label="Filtr podle kategorie">' + ''.join(chips) + '</div>\n'
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" id="gal-grid">\n' + '\n'.join(items) + '\n</div>\n<!--GALERIE-KONEC-->')
page = ROOT / 'fotogalerie.html'
s = page.read_text()
n, k = re.subn(r'<!--GALERIE-START-->.*?<!--GALERIE-KONEC-->', lambda m: blok, s, flags=re.S)
if not k:
    sys.exit('V fotogalerie.html chybí značky GALERIE-START / GALERIE-KONEC')
page.write_text(n)
print(f'Hotovo: {len(polozky)} fotek.')
