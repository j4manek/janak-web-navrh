// Mobilní menu: přepíná panel pod hlavičkou, zavře se po kliknutí na odkaz nebo Escape
(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function () { setOpen(panel.hidden); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();

// Mapa se načte až po kliknutí, dřív se na servery Google nepřipojujeme
document.addEventListener('click', function (e) {
  if (!e.target.closest('[data-map-load]')) return;
  var ph = e.target.closest('.map-embed__ph');
  var f = document.createElement('iframe');
  f.src = ph.dataset.mapSrc; f.title = 'Mapa: Instalatérství Janak, Vamberk';
  f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
  ph.replaceWith(f);
});

// Karty služeb: klik kamkoliv na kartu ji otočí, odkaz na formulář zůstává odkazem.
// Zadní strana je pro čtečky skrytá, dokud není otočená.
document.addEventListener('click', function (e) {
  var card = e.target.closest('[data-flip]');
  if (!card || e.target.closest('a')) return;
  var flipped = !card.classList.contains('is-flipped');
  card.classList.toggle('is-flipped', flipped);
  card.querySelector('[data-flip-open]').setAttribute('aria-expanded', String(flipped));
  card.querySelector('.flip-card__back').setAttribute('aria-hidden', String(!flipped));
  if (e.detail === 0) (flipped ? card.querySelector('[data-flip-close]') : card.querySelector('[data-flip-open]')).focus();
});

// Nahrání fotky v kontaktním formuláři: ukáže název souboru, hlídá velikost, umí přetažení
(function () {
  var MAX = 10 * 1024 * 1024;
  document.querySelectorAll('[data-dz]').forEach(function (dz) {
    var input = dz.querySelector('[data-dz-input]');
    var name = dz.querySelector('[data-dz-name]');
    var hint = dz.querySelector('[data-dz-hint]');
    var err = dz.parentNode.querySelector('[data-dz-err]');
    var defName = name.textContent, defHint = hint.textContent;
    function show() {
      var f = input.files[0];
      err.hidden = true;
      if (f && f.size > MAX) {
        input.value = ''; f = null;
        err.textContent = 'Soubor je větší než 10 MB, zkuste menší fotku.'; err.hidden = false;
      }
      dz.classList.toggle('has-file', !!f);
      name.textContent = f ? f.name : defName;
      hint.textContent = f ? Math.max(1, Math.round(f.size / 1024)) + ' kB, kliknutím vyberete jiný' : defHint;
    }
    input.addEventListener('change', show);
    ['dragenter', 'dragover'].forEach(function (t) { dz.addEventListener(t, function () { dz.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { dz.addEventListener(t, function () { dz.classList.remove('is-over'); }); });
  });
})();

// Video: soubor (data-src) se načte až po kliknutí na Přehrát. Bez data-src zůstane zástupný nápis.
document.addEventListener('click', function (e) {
  var btn = e.target.closest('.vid__play');
  if (!btn) return;
  var box = btn.closest('[data-video]');
  var src = box.dataset.src;
  var tag = box.querySelector('[data-vid-tag]');
  if (!src) { tag.textContent = 'Video se připravuje, brzy tu bude.'; return; }
  var v = document.createElement('video');
  v.controls = true; v.playsInline = true; v.preload = 'auto'; v.src = src;
  if (box.dataset.title) v.setAttribute('aria-label', box.dataset.title);
  v.addEventListener('error', function () { box.classList.remove('is-playing'); v.remove(); tag.textContent = 'Video se nepodařilo načíst.'; });
  box.appendChild(v); box.classList.add('is-playing');
  v.play().catch(function () {});
});
