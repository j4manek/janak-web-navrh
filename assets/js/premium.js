// Jemné odhalení sekcí při scrollu na premium stránkách (SVJ, Developeři).
// Bez knihovny - jen IntersectionObserver, respektuje prefers-reduced-motion.
(function () {
  var items = document.querySelectorAll('.pm-reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  // Teprve teď smí CSS obsah schovat - do té doby byl normálně vidět.
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

// Realizace: filtr podle kategorie, skryté karty se nezobrazují, prázdná kategorie ukáže vysvětlení
(function () {
  var wrap = document.querySelector('[data-projs]');
  if (!wrap) return;
  var chips = document.querySelectorAll('.sv-chip[data-filter]');
  var cards = wrap.querySelectorAll('.sv-proj');
  var empty = document.querySelector('[data-empty]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter, shown = 0;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      cards.forEach(function (card) {
        var ok = f === 'all' || card.dataset.cats.split(' ').indexOf(f) !== -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
})();

// Mobil: tlačítko rozbalí/sbalí skupinu karet (služby, realizace). Na počítači je tlačítko skryté a karty vidět vždy.
document.addEventListener('click', function (e) {
  var b = e.target.closest('.m-fold-btn');
  if (!b) return;
  var box = document.getElementById(b.dataset.fold);
  if (!box) return;
  var open = box.classList.toggle('is-open');
  b.setAttribute('aria-expanded', String(open));
  b.textContent = open ? b.dataset.less : b.dataset.more;
});
