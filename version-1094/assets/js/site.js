(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var next = slider.querySelector('[data-hero-next]');
    var prev = slider.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    var input = area.querySelector('[data-filter-input]');
    var year = area.querySelector('[data-year-filter]');
    var type = area.querySelector('[data-type-filter]');
    var list = area.parentElement.querySelector('[data-filter-list]');
    var empty = area.parentElement.querySelector('[data-empty-state]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedYear = year && year.value;
      var selectedType = type && type.value;
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var okType = !selectedType || card.getAttribute('data-type') === selectedType;
        var ok = okKeyword && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-page-input]');
  var searchStatus = document.querySelector('[data-search-status]');

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function renderSearch() {
    if (!searchResults || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (searchInput) {
      searchInput.value = q;
    }
    var keyword = q.trim().toLowerCase();
    if (!keyword) {
      searchResults.innerHTML = '';
      if (searchStatus) {
        searchStatus.textContent = '请输入关键词开始搜索。';
      }
      return;
    }
    var results = window.MOVIE_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (searchStatus) {
      searchStatus.textContent = results.length ? '以下是匹配的影视内容。' : '暂无匹配影片。';
    }
    searchResults.innerHTML = results.map(function (movie) {
      var tags = String(movie.tags || '').split(' ').filter(Boolean).slice(0, 4).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">' +
        '<span class="card-poster"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy"><span class="play-chip">播放</span></span>' +
        '<span class="card-body"><span class="card-title">' + escapeHtml(movie.title) + '</span>' +
        '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
        '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>' +
        '<span class="card-tags">' + tags + '</span></span></a>';
    }).join('');
  }

  renderSearch();
})();
