(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var keyword = qs('[data-filter-keyword]', scope) || qs('[data-filter-keyword]');
      var year = qs('[data-filter-year]', scope) || qs('[data-filter-year]');
      var type = qs('[data-filter-type]', scope) || qs('[data-filter-type]');
      var cards = qsa('[data-search]', scope);
      if (!cards.length || (!keyword && !year && !type)) {
        return;
      }
      function apply() {
        var key = keyword ? keyword.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var matchKey = !key || (card.getAttribute('data-search') || '').indexOf(key) >= 0;
          var matchYear = !y || card.getAttribute('data-year') === y;
          var matchType = !t || (card.getAttribute('data-type') || '').toLowerCase() === t;
          card.classList.toggle('is-hidden', !(matchKey && matchYear && matchType));
        });
      }
      [keyword, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPlayers() {
    qsa('.player-frame').forEach(function (frame) {
      var video = qs('video', frame);
      var button = qs('.play-button', frame);
      var url = frame.getAttribute('data-video');
      var ready = null;
      if (!video || !url) {
        return;
      }
      function attach() {
        if (ready) {
          return ready;
        }
        ready = new Promise(function (resolve) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            resolve();
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              maxBufferLength: 60,
              maxMaxBufferLength: 120
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              if (!video.src) {
                video.src = url;
              }
              resolve();
            });
            window.setTimeout(resolve, 1800);
            return;
          }
          video.src = url;
          resolve();
        });
        return ready;
      }
      attach();
      function start() {
        frame.classList.add('is-playing');
        if (button) {
          button.classList.add('hidden');
        }
        attach().then(function () {
          var play = video.play();
          if (play && typeof play.catch === 'function') {
            play.catch(function () {});
          }
        });
      }
      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
        if (button) {
          button.classList.add('hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
