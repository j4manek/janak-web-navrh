// Fotogalerie: filtr podle kategorie + lightbox (klik, šipky, Esc, swipe).
(function () {
  var grid = document.getElementById('gal-grid');
  var lb = document.getElementById('lightbox');
  if (!grid || !lb) return;
  var img = document.getElementById('lightbox-img');
  var cap = document.getElementById('lightbox-cap');
  var items = [].slice.call(grid.querySelectorAll('.gallery-item'));
  var current = -1;

  function visible() { return items.filter(function (b) { return !b.hidden; }); }

  document.querySelectorAll('.gal-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.gal-chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      var f = chip.dataset.filter;
      items.forEach(function (b) { b.hidden = !(f === 'vse' || b.dataset.cat === f); });
    });
  });

  function show(i) {
    var list = visible();
    if (!list.length) return;
    current = (i + list.length) % list.length;
    var b = list[current], t = b.querySelector('img');
    img.src = b.dataset.full;
    img.alt = t ? t.alt : '';
    cap.textContent = t ? t.alt : '';
    lb.hidden = false;
    lb.classList.toggle('lightbox--single', list.length < 2);
  }
  function close() { lb.hidden = true; img.src = ''; }

  items.forEach(function (b) {
    b.addEventListener('click', function () { show(visible().indexOf(b)); });
  });
  lb.addEventListener('click', function (e) {
    if (e.target.closest('.lightbox__nav--prev')) return show(current - 1);
    if (e.target.closest('.lightbox__nav--next')) return show(current + 1);
    if (e.target !== img) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
})();
