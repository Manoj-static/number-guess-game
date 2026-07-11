// ================= Game State =================
let secretNumber;
let attempts = 0;
let gameOver = false;
let maxRange = 100;
let minGuess = 1;
let maxGuess = 100;
let timerInterval = null;
let secondsElapsed = 0;

// ================= DOM References =================
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const bestScoreEl = document.getElementById('bestScore');
const timerEl = document.getElementById('timer');
const rangeText = document.getElementById('rangeText');
const liveRange = document.getElementById('liveRange');
const historyList = document.getElementById('historyList');
const difficultySelect = document.getElementById('difficulty');
const themeToggle = document.getElementById('themeToggle');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

// ================= Init =================
function initGame() {
  maxRange = Number(difficultySelect.value);
  secretNumber = Math.floor(Math.random() * maxRange) + 1;
  attempts = 0;
  gameOver = false;
  minGuess = 1;
  maxGuess = maxRange;
  secondsElapsed = 0;

  attemptsEl.textContent = 0;
  timerEl.textContent = '0s';
  guessInput.disabled = false;
  guessInput.max = maxRange;
  guessBtn.disabled = false;
  guessInput.value = '';
  resetBtn.style.display = 'none';
  messageEl.textContent = '';
  messageEl.className = 'message';
  historyList.innerHTML = '';
  rangeText.textContent = `I'm thinking of a number between 1 and ${maxRange}...`;
  liveRange.textContent = `Possible range: 1 – ${maxRange}`;
  loadBestScore();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = secondsElapsed + 's';
  }, 1000);

  guessInput.focus();
}

// ================= Best Score (per difficulty, saved in localStorage) =================
function bestScoreKey() {
  return 'bestScore_' + maxRange;
}

function loadBestScore() {
  const saved = localStorage.getItem(bestScoreKey());
  bestScoreEl.textContent = saved ? saved : '--';
}

function saveBestScoreIfBetter() {
  const saved = localStorage.getItem(bestScoreKey());
  if (!saved || attempts < Number(saved)) {
    localStorage.setItem(bestScoreKey(), attempts);
    bestScoreEl.textContent = attempts;
  }
}

// ================= Guess Handling =================
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + type;
}

function addHistoryItem(guess, tagText, tagClass) {
  const li = document.createElement('li');
  li.innerHTML = `<span>Guess: ${guess}</span><span class="tag ${tagClass}">${tagText}</span>`;
  historyList.prepend(li);
}

function handleGuess() {
  if (gameOver) return;

  const guess = Number(guessInput.value);

  if (!guessInput.value || guess < 1 || guess > maxRange) {
    showMessage(`Enter a valid number between 1 and ${maxRange}`, 'too-high');
    return;
  }

  attempts++;
  attemptsEl.textContent = attempts;

  if (guess === secretNumber) {
    showMessage(`🎉 Correct! The number was ${secretNumber}. You got it in ${attempts} attempts and ${secondsElapsed}s!`, 'correct');
    addHistoryItem(guess, 'WIN', 'win');
    endGame();
  } else if (guess > secretNumber) {
    showMessage('📉 Too High! Try a lower number.', 'too-high');
    addHistoryItem(guess, 'HIGH', 'high');
    maxGuess = Math.min(maxGuess, guess - 1);
    liveRange.textContent = `Possible range: ${minGuess} – ${maxGuess}`;
  } else {
    showMessage('📈 Too Low! Try a higher number.', 'too-low');
    addHistoryItem(guess, 'LOW', 'low');
    minGuess = Math.max(minGuess, guess + 1);
    liveRange.textContent = `Possible range: ${minGuess} – ${maxGuess}`;
  }

  guessInput.value = '';
  guessInput.focus();
}

function endGame() {
  gameOver = true;
  guessBtn.disabled = true;
  guessInput.disabled = true;
  resetBtn.style.display = 'block';
  clearInterval(timerInterval);
  saveBestScoreIfBetter();
  launchConfetti();
}

// ================= Dark Mode =================
function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ================= Confetti Animation =================
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeCanvas();
  const colors = ['#764ba2', '#667eea', '#1a8a4d', '#c0521a', '#e0c341'];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20,
    r: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
  }));

  let frame = 0;
  const maxFrames = 150;

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += 5;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  animate();
}

// ================= Event Listeners =================
guessBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleGuess();
});

resetBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('resize', resizeCanvas);

// ================= Start =================
loadTheme();
resizeCanvas();
initGame();