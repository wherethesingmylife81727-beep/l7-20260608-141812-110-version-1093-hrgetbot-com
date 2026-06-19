(function () {
    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function move(step) {
            show(active + step);
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                move(1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var pageSearch = document.querySelector("[data-page-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var emptyState = document.querySelector("[data-empty]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

    if (pageSearch && query) {
        pageSearch.value = query;
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var words = normalize(pageSearch ? pageSearch.value : "");
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var keywords = normalize(card.getAttribute("data-keywords"));
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var matched = true;

            if (words && keywords.indexOf(words) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [pageSearch, yearFilter, typeFilter].forEach(function (element) {
        if (element) {
            element.addEventListener("input", applyFilters);
            element.addEventListener("change", applyFilters);
        }
    });

    applyFilters();
})();
