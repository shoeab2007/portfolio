const video = document.getElementById('brandVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const centerPlayBtn = document.getElementById('centerPlayBtn');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const navSoundBtn = document.getElementById('navSoundBtn');
const navSoundLabel = document.getElementById('navSoundLabel');
const audioSymbol = document.getElementById('audioSymbol');
const loopToggleBtn = document.getElementById('loopToggleBtn');
const speedBtn = document.getElementById('speedBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const timelineWrapper = document.getElementById('timelineWrapper');
const timelineProgress = document.getElementById('timelineProgress');
const timelineThumb = document.getElementById('timelineThumb');
const timeCurrent = document.getElementById('timeCurrent');
const timeDuration = document.getElementById('timeDuration');
const shotIndicatorText = document.getElementById('shotIndicatorText');
const jumpTabBtns = document.querySelectorAll('.jump-tab-btn');

function formatTime(seconds) {
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
    updatePlayState(true);
  } else {
    video.pause();
    updatePlayState(false);
  }
}

function updatePlayState(isPlaying) {
  if (isPlaying) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    centerPlayBtn.classList.remove('force-show');
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    centerPlayBtn.classList.add('force-show');
  }
}

function toggleAudio() {
  video.muted = !video.muted;
  updateAudioState();
}

function updateAudioState() {
  if (video.muted) {
    audioToggleBtn.classList.remove('active');
    navSoundBtn.classList.remove('btn-primary');
    navSoundBtn.classList.add('btn-outline');
    navSoundLabel.textContent = 'Sound: Muted';
    if (audioSymbol) audioSymbol.textContent = '🔇';
  } else {
    audioToggleBtn.classList.add('active');
    navSoundBtn.classList.remove('btn-outline');
    navSoundBtn.classList.add('btn-primary');
    navSoundLabel.textContent = 'Sound: Playing ♫';
    if (audioSymbol) audioSymbol.textContent = '🔊';
  }
}

window.seekVideo = function(timeInSec) {
  video.currentTime = timeInSec;
  if (video.paused) {
    video.play();
    updatePlayState(true);
  }
  updateJumpTabState(timeInSec);
};

function updateJumpTabState(time) {
  jumpTabBtns.forEach(btn => {
    const target = parseFloat(btn.getAttribute('data-seek'));
    if (time < 3.5 && target === 0.0) {
      btn.classList.add('active');
    } else if (time >= 3.5 && time < 7.0 && target === 3.5) {
      btn.classList.add('active');
    } else if (time >= 7.0 && target === 7.0) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

video.addEventListener('timeupdate', () => {
  const cur = video.currentTime;
  const dur = video.duration || 10.0;
  const pct = (cur / dur) * 100;

  timelineProgress.style.width = pct + '%';
  timelineThumb.style.left = pct + '%';
  timeCurrent.textContent = formatTime(cur);

  if (cur < 3.5) {
    shotIndicatorText.textContent = 'Shot 1: Studio Macro · "WORN. NOT MADE."';
    updateJumpTabState(cur);
  } else if (cur < 7.0) {
    shotIndicatorText.textContent = 'Shot 2: Craft Scroll · Product Tags';
    updateJumpTabState(cur);
  } else {
    shotIndicatorText.textContent = 'Shot 3: Golden Hour · Lifestyle Outro';
    updateJumpTabState(cur);
  }
});

video.addEventListener('loadedmetadata', () => {
  timeDuration.textContent = formatTime(video.duration || 10.0);
});

let isDragging = false;
function handleSeek(e) {
  const rect = timelineWrapper.getBoundingClientRect();
  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const targetTime = pos * (video.duration || 10.0);
  video.currentTime = targetTime;
}

timelineWrapper.addEventListener('mousedown', (e) => {
  isDragging = true;
  handleSeek(e);
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) handleSeek(e);
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

jumpTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const time = parseFloat(btn.getAttribute('data-seek'));
    seekVideo(time);
  });
});

const speeds = [1.0, 0.5, 1.5];
let speedIndex = 0;
speedBtn.addEventListener('click', () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  const s = speeds[speedIndex];
  video.playbackRate = s;
  speedBtn.textContent = s.toFixed(1) + 'x';
});

fullscreenBtn.addEventListener('click', () => {
  const elem = document.getElementById('videoViewport');
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
});

loopToggleBtn.addEventListener('click', () => {
  video.loop = !video.loop;
  loopToggleBtn.classList.toggle('active', video.loop);
});

playPauseBtn.addEventListener('click', togglePlay);
centerPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);
audioToggleBtn.addEventListener('click', toggleAudio);
navSoundBtn.addEventListener('click', toggleAudio);

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
  } else if (e.code === 'KeyM') {
    toggleAudio();
  } else if (e.code === 'KeyF') {
    fullscreenBtn.click();
  }
});

updateAudioState();
