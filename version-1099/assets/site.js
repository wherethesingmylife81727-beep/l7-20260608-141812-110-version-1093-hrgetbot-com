(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        if (navToggle) {
            navToggle.addEventListener("click", function () {
                document.body.classList.toggle("nav-open");
            });
        }

        document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
            var inputs = scope.querySelectorAll("[data-search-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var chips = scope.querySelectorAll("[data-filter-value]");
            var keyword = "";
            var filterValue = "";

            function apply() {
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var year = normalize(card.getAttribute("data-year"));
                    var type = normalize(card.getAttribute("data-type"));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesFilter = !filterValue || text.indexOf(filterValue) !== -1 || year === filterValue || type === filterValue;
                    var visible = matchesKeyword && matchesFilter;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            inputs.forEach(function (input) {
                input.addEventListener("input", function () {
                    keyword = normalize(input.value);
                    apply();
                });
            });

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    filterValue = normalize(chip.getAttribute("data-filter-value"));
                    apply();
                });
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    });
})();
