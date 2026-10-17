#!/usr/bin/env python3
"""Zkopíruje společnou hlavičku, mobilní menu a patičku z partials/ do všech stránek.
Úprava menu nebo patičky = změnit soubor v partials/ a spustit: python3 tools/sync_layout.py"""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
P = {k: (ROOT / 'partials' / f'{k}.html').read_text() for k in ('header', 'mobile-nav', 'footer')}
RX = {'header': r'<header.*?</header>', 'mobile-nav': r'<nav id="mobile-nav".*?</nav>', 'footer': r'<footer.*?</footer>'}
for f in sorted(ROOT.glob('*.html')):
    s = f.read_text(); o = s
    for k, rx in RX.items():
        s = re.sub(rx, lambda m: P[k], s, count=1, flags=re.S)
    if s != o:
        f.write_text(s); print('upraveno:', f.name)
