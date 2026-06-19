(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeader() {
        var header = qs('.site-header');
        var toggle = qs('.mobile-toggle');
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        var prev = qs('.hero-prev', slider);
        var next = qs('.hero-next', slider);
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilterPages() {
        qsa('.js-filter-page').forEach(function (page) {
            var input = qs('.js-filter-input', page);
            var typeSelect = qs('.js-type-filter', page);
            var yearSelect = qs('.js-year-filter', page);
            var sortSelect = qs('.js-sort-select', page);
            var grid = qs('.js-card-grid', page);
            var cards = qsa('.js-card', page);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';

            if (input && query) {
                input.value = query;
            }

            function pass(card) {
                var text = normalize(card.getAttribute('data-search'));
                var title = normalize(card.getAttribute('data-title'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var term = input ? normalize(input.value) : '';
                var typeValue = typeSelect ? normalize(typeSelect.value) : '';
                var yearValue = yearSelect ? normalize(yearSelect.value) : '';

                if (term && text.indexOf(term) === -1 && title.indexOf(term) === -1) {
                    return false;
                }
                if (typeValue && type.indexOf(typeValue) === -1) {
                    return false;
                }
                if (yearValue && year !== yearValue) {
                    return false;
                }
                return true;
            }

            function sortCards(list) {
                var mode = sortSelect ? sortSelect.value : 'default';
                return list.slice().sort(function (a, b) {
                    if (mode === 'year') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    if (mode === 'popular') {
                        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                    }
                    if (mode === 'score') {
                        return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                    }
                    return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
                });
            }

            function apply() {
                var ordered = sortCards(cards);
                ordered.forEach(function (card) {
                    card.classList.toggle('is-hidden-by-filter', !pass(card));
                    if (grid) {
                        grid.appendChild(card);
                    }
                });
            }

            [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initSmoothLinks() {
        qsa('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                var target = qs(link.getAttribute('href'));
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    window.setupVideoPlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var url = config.url;
        var hlsInstance = null;

        if (!video || !url) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === 'true') {
                return;
            }
            video.setAttribute('data-ready', 'true');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHero();
        initFilterPages();
        initSmoothLinks();
    });
}());
