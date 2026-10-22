// Rychlý audit přístupnosti, spouští se v prohlížeči: vloží se jako <script> a zavolá window.__audit().
// Kontroluje jen viditelné prvky. Kontrast se počítá jen tam, kde je pozadí plná barva (ne přechod/obrázek).
window.__audit = function () {
  var lum = function (c) { var a = c.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
  var parse = function (s) { var m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; var p = m[1].split(',').map(Number); return { rgb: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
  var cr = function (a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
  var bgInfo = function (el) { var e = el; while (e) { var cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; var c = parse(cs.backgroundColor); if (c && c.a > .9) return c.rgb; e = e.parentElement; } return [255, 255, 255]; };
  var vis = function (e) { var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  var q = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var o = { title: document.title, lang: document.documentElement.lang, h1: q('h1').length };
  var hs = q('h1,h2,h3,h4').map(function (h) { return +h.tagName[1]; });
  o.headingSkips = hs.map(function (l, i) { return i && l - hs[i - 1] > 1 ? hs[i - 1] + '>' + l : null; }).filter(Boolean);
  o.skipLink = !!document.querySelector('.skip-link'); o.main = !!document.getElementById('main');
  o.imgNoAlt = [].slice.call(document.images).filter(function (i) { return !i.hasAttribute('alt'); }).length;
  o.nameless = q('button,a[href]').filter(function (e) { return vis(e) && !(e.innerText || '').trim() && !e.getAttribute('aria-label') && !e.getAttribute('title') && !e.querySelector('img[alt]:not([alt=""])'); }).map(function (e) { return (e.getAttribute('href') || e.className || '').toString().slice(0, 50); });
  o.noLabel = q('input:not([type=hidden]):not([type=file]),select,textarea').filter(function (i) { return vis(i) && !(i.labels && i.labels.length) && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby'); }).map(function (i) { return i.name || i.id; });
  o.smallTargets = q('summary,button,input[type=checkbox]').filter(function (e) { var r = e.getBoundingClientRect(); return vis(e) && (r.height < 24 || r.width < 24); }).map(function (e) { return (e.innerText || e.name || e.tagName).slice(0, 24); }).slice(0, 6);
  var bad = [], seen = {};
  q('h1,h2,h3,h4,p,li,a,span,small,summary,label,button,strong,em,cite,td,th').forEach(function (el) {
    if (![].some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })) return;
    if (!vis(el)) return;
    var cs = getComputedStyle(el); if (+cs.opacity === 0) return;
    var fg = parse(cs.color), bg = bgInfo(el); if (!fg || !bg) return;
    var ratio = cr(fg.rgb, bg), fs = parseFloat(cs.fontSize), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700), need = large ? 3 : 4.5;
    if (ratio < need) { var k = cs.color + bg + (el.innerText || '').slice(0, 18); if (seen[k]) return; seen[k] = 1; bad.push((el.innerText || '').trim().slice(0, 30) + ' ' + ratio.toFixed(1) + '/' + need + (cs.webkitTextStrokeWidth !== '0px' ? ' (obrys)' : '')); }
  });
  o.contrast = bad.slice(0, 12);
  o.tiny = q('p,li,span,a,small,strong,td').filter(function (e) { return e.innerText && vis(e) && parseFloat(getComputedStyle(e).fontSize) < 11.5; }).length;
  o.dupIds = q('[id]').map(function (e) { return e.id; }).filter(function (id, i, a) { return a.indexOf(id) !== i; });
  o.overflowX = document.documentElement.scrollWidth > innerWidth;
  return o;
};
