// Mobilní menu: přepíná panel pod hlavičkou
(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', function () {
    var open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
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
