import { H as Hls } from './hls-vendor-dru42stk.js';

function showMessage(player, text) {
  var message = player.querySelector('[data-player-message]');
  if (message) {
    message.textContent = text;
    message.classList.add('is-visible');
  }
}

function hideMessage(player) {
  var message = player.querySelector('[data-player-message]');
  if (message) {
    message.textContent = '';
    message.classList.remove('is-visible');
  }
}

function prepareVideo(player) {
  var video = player.querySelector('video');
  if (!video) {
    return null;
  }
  var src = video.getAttribute('data-video-src');
  if (!src) {
    showMessage(player, '当前播放源暂不可用');
    return null;
  }
  if (video.dataset.ready === '1') {
    return video;
  }
  video.dataset.ready = '1';
  video.controls = true;

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        showMessage(player, '视频加载异常，请刷新后重试');
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });
    player._hls = hls;
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else {
    showMessage(player, '当前浏览器不支持 HLS 播放');
    return video;
  }
  return video;
}

function playVideo(player) {
  hideMessage(player);
  var video = prepareVideo(player);
  if (!video) {
    return;
  }
  var overlay = player.querySelector('[data-play-button]');
  if (overlay) {
    overlay.classList.add('is-hidden');
  }
  video.play().catch(function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
    showMessage(player, '点击播放器后即可开始播放');
  });
}

document.querySelectorAll('[data-player]').forEach(function (player) {
  var button = player.querySelector('[data-play-button]');
  var video = player.querySelector('video');
  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo(player);
    });
  }
  player.addEventListener('click', function (event) {
    if (event.target && event.target.tagName === 'VIDEO') {
      return;
    }
    playVideo(player);
  });
  if (video) {
    video.addEventListener('play', function () {
      var overlay = player.querySelector('[data-play-button]');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      var overlay = player.querySelector('[data-play-button]');
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  }
});
