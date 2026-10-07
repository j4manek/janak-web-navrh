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
