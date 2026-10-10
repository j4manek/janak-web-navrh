// Jednoduchý lightbox pro fotogalerii: klik na náhled zvětší fotku přes celou obrazovku.
(function () {
  var lightbox = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  if (!lightbox || !img) return;

  function open(src, alt) {
    img.src = src;
    img.alt = alt;
    lightbox.hidden = false;
  }

  function close() {
    lightbox.hidden = true;
    img.src = '';
  }

  document.querySelectorAll('.gallery-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var thumb = btn.querySelector('img');
      open(btn.dataset.full, thumb ? thumb.alt : '');
    });
  });

  lightbox.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) close();
  });
})();
