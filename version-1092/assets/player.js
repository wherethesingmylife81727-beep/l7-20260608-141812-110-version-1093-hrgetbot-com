function initPlayer(streamUrl) {
  var video = document.getElementById('playerVideo');
  var cover = document.getElementById('playerCover');
  var ready = false;
  var hls = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function bindVideo() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function playVideo() {
    bindVideo();
    video.controls = true;
    cover.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  cover.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
