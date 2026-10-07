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
