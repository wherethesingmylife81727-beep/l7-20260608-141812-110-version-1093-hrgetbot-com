(function () {
    function setupPlayer(player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var ready = false;
        var hls = null;

        if (!video || !cover) {
            return;
        }

        function attachStream() {
            var stream = video.getAttribute("data-stream");
            if (ready || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        }

        function playVideo() {
            attachStream();
            video.controls = true;
            player.classList.add("is-playing");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        cover.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                player.classList.remove("is-playing");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), setupPlayer);
})();
