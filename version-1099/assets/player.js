function initMoviePlayer(source) {
    var video = document.querySelector('[data-video-player="main"]');
    var overlay = document.querySelector('[data-play-overlay="main"]');
    var started = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    }

    function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function start() {
        hideOverlay();
        if (started) {
            playVideo();
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
            return;
        }
        video.src = source;
        playVideo();
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            start();
        }
    });
}
