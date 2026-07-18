const $ = (s) => document.querySelector(s);
// Replace these three sample links with your own public Google Drive photo links.
// Each photo must be shared as: Anyone with the link → Viewer.
const photos = [
  'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz123/view',
  'https://drive.google.com/file/d/2AbCdEfGhIjKlMnOpQrStUvWxYz123/view',
  'https://drive.google.com/file/d/3AbCdEfGhIjKlMnOpQrStUvWxYz123/view'
];
const heroPhotos = [
  'https://drive.google.com/file/d/4AbCdEfGhIjKlMnOpQrStUvWxYz123/view',
  'https://drive.google.com/file/d/5AbCdEfGhIjKlMnOpQrStUvWxYz123/view'
];
const scoreEl = $('#score'), board = $('#gameBoard'), win = $('#gameWin');
let score = 0, candlesLit = false, musicPlaying = false, audioContext;

function driveUrl(value) {
  const id = value.match(/[\w-]{20,}/)?.[0] || value.trim();
  return id ? 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600' : '';
}
function setPhoto(el, value) {
  const url = driveUrl(value || '');
  el.classList.remove('has-photo');
  el.style.backgroundImage = '';
  if (!url) return;
  const image = new Image();
  image.onload = () => {
    el.style.backgroundImage = 'url("' + url + '")';
    el.classList.add('has-photo');
  };
  image.onerror = () => {
    console.warn('Could not load Google Drive photo:', value);
  };
  image.src = url;
}
function setHeroPhoto(el, value, rotate = false) {
  const url = driveUrl(value || '');
  el.classList.remove('has-photo');
  el.style.backgroundImage = '';
  el.querySelector('.hero-image')?.remove();
  if (!url) return;
  const image = new Image();
  image.className = 'hero-image' + (rotate ? ' hero-image-rotated' : '');
  image.onload = () => {
    el.append(image);
    el.classList.add('has-photo');
  };
  image.onerror = () => console.warn('Could not load Google Drive photo:', value);
  image.src = url;
}
function renderPhotos() {
  document.querySelectorAll('.memory-photo').forEach((el, i) => {
    setPhoto(el, photos[i]);
  });
  document.querySelectorAll('.hero-polaroid .photo').forEach((el, i) => {
    setHeroPhoto(el, heroPhotos[i], i === 0);
  });
}

function addCakeSprinkle() {
  const s = document.createElement('i');
  s.className = 'sprinkle';
  s.style.left = (18 + Math.random() * 180) + 'px';
  s.style.top = (35 + Math.random() * 110) + 'px';
  s.style.setProperty('--r', (Math.random() * 180) + 'deg');
  $('#sprinklesOnCake').append(s);
}
function spawnSprinkle() {
  if (score >= 10) return;
  const b = document.createElement('button');
  b.className = 'flying-sprinkle'; b.type = 'button';
  b.style.left = (12 + Math.random() * 76) + '%';
  b.style.top = (25 + Math.random() * 58) + '%';
  b.style.setProperty('--x', (-18 + Math.random() * 36) + 'px');
  b.style.setProperty('--y', (-16 + Math.random() * 32) + 'px');
  b.setAttribute('aria-label', 'Collect a heart sprinkle');
  b.addEventListener('click', () => {
    b.remove(); score++; scoreEl.textContent = score; addCakeSprinkle(); heartConfetti(4);
    if (score === 10) completeCake(); else setTimeout(spawnSprinkle, 260);
  });
  board.append(b);
  setTimeout(() => {
    if (b.isConnected) {
      b.remove();
      spawnSprinkle();
    }
  }, 3000);
}
function completeCake() { win.hidden = false; $('#gamePrompt').textContent = 'Your cake is perfectly sweet — now make it glow.'; heartConfetti(28); }
function makeCandles() {
  $('#candles').innerHTML = '';
  for (let i = 0; i < 5; i++) { const c = document.createElement('div'); c.className = 'candle'; c.innerHTML = '<i class="flame"></i>'; $('#candles').append(c); }
}
$('#lightCandles').addEventListener('click', () => {
  candlesLit = true; win.hidden = true;
  $('#gamePrompt').textContent = 'Make your birthday wish, then tap each little flame to blow it out.';
  document.querySelectorAll('.candle').forEach(c => c.addEventListener('click', () => {
    c.querySelector('.flame').classList.add('out');
    if (!document.querySelector('.flame:not(.out)')) {
      $('#gamePrompt').textContent = 'Wish granted. Your letter is ready below…';
      heartConfetti(55); $('#wish').scrollIntoView({ behavior: 'smooth' });
    }
  }));
});

function heartConfetti(amount = 35) {
  for (let i = 0; i < amount; i++) {
    const h = document.createElement('span');
    h.className = 'heart-piece'; h.textContent = ['♥', '♡', '✦'][Math.floor(Math.random() * 3)];
    h.style.left = (Math.random() * 100) + 'vw';
    h.style.fontSize = (12 + Math.random() * 17) + 'px';
    h.style.setProperty('--drift', (-90 + Math.random() * 180) + 'px');
    h.style.setProperty('--duration', (2 + Math.random() * 1.8) + 's');
    h.style.animationDelay = (Math.random() * .25) + 's';
    $('#confetti').append(h); setTimeout(() => h.remove(), 4500);
  }
}
function playHappyBirthday() {
  const notes = [261.63,261.63,293.66,261.63,349.23,329.63,261.63,261.63,293.66,261.63,392,349.23,261.63,261.63,523.25,440,349.23,329.63,293.66,466.16,466.16,440,349.23,392,349.23];
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  let t = audioContext.currentTime + .06;
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(.12, t + .02); gain.gain.exponentialRampToValueAtTime(.0001, t + .27);
    osc.connect(gain).connect(audioContext.destination); osc.start(t); osc.stop(t + .29);
    t += (i === 5 || i === 11 || i === 18 || i === 25) ? .52 : .3;
  });
}
$('#soundToggle').addEventListener('click', () => {
  playHappyBirthday(); musicPlaying = !musicPlaying;
  $('#soundToggle').textContent = musicPlaying ? '♫ playing birthday song' : '♫ play birthday song';
  $('#soundToggle').setAttribute('aria-pressed', musicPlaying);
});
function openLetter() {
  if (!candlesLit || document.querySelector('.flame:not(.out)')) {
    $('#gamePrompt').textContent = 'First, finish the cake and blow out every candle for your secret letter.';
    $('#cake-game').scrollIntoView({ behavior: 'smooth' }); return;
  }
  $('#envelope').classList.add('open'); heartConfetti(32);
}
$('#envelope').addEventListener('click', openLetter);
$('#envelope').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLetter(); });
const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')), { threshold: .13 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
renderPhotos(); makeCandles(); setTimeout(spawnSprinkle, 700); setTimeout(() => heartConfetti(18), 700);
