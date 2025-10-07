document.addEventListener('DOMContentLoaded', () => {
  const mainMenu = document.getElementById('mainMenu');
  const gameScreen = document.getElementById('game');
  if (!mainMenu || !gameScreen) return;

  const camerasEl = document.getElementById('cameras');
  const powerEl = document.getElementById('power');
  const timeEl = document.getElementById('time');
  const freddyEl = document.getElementById('freddy');
  const messageEl = document.getElementById('message');

  const startBtn = document.getElementById('startBtn');
  const gameAudio = document.getElementById('gameAudio'); // AUDIO ELEMENT
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const downBtn = document.getElementById('downBtn');

  if (!startBtn) {
    console.error("Brak przycisku #startBtn!");
    return;
  }

  let currentCamera = null;
  let power = 100;
  let hour = 0;
  let gameRunning = false;
  let freddyProgress = 0;
  let gameLoop = null;

  const CAMERA_LIST = ['1A', '1B', '2A', '2B', '3', '4A', '4B', '5', '6', '7'];
  let currentCamIndex = 0;

  function showView(view) {
    document.querySelectorAll('.camera-view, #officeBg').forEach(el => {
      el.style.display = 'none';
    });

    if (view === 'office') {
      document.getElementById('officeBg').style.display = 'block';
      camerasEl.textContent = 'Kamera: Biuro';
      currentCamera = null;
    } else {
      const camEl = document.getElementById(`cam_${view}`);
      if (camEl) camEl.style.display = 'block';
      camerasEl.textContent = `Kamera: ${view}`;
      currentCamera = view;
    }
  }

  function usePower(amount) {
    if (currentCamera === null || !gameRunning) return;
    power -= amount;
    if (power < 0) power = 0;
    powerEl.textContent = `Bateria: ${Math.floor(power)}%`;
    if (power <= 0) {
      gameOver("Zabrakło baterii! Freddy cię złapał!");
    }
  }

  function updateTime() {
    const timeDisplay = hour === 0 ? "12 AM" : `${hour} AM`;
    timeEl.textContent = timeDisplay;
  }

  function gameOver(reason) {
    gameRunning = false;
    if (gameLoop) clearInterval(gameLoop);
    messageEl.innerHTML = `
      PRZEGRAŁEŚ!<br>${reason}
      <button id="exitToMenuBtn">Wyjście</button>
    `;
    messageEl.style.display = 'flex';
    freddyEl.style.opacity = '1';
    freddyEl.style.display = 'block';

    // ZATRZYMAJ MUZYKĘ
    gameAudio.pause();
    gameAudio.currentTime = 0;

    const exitBtn = document.getElementById('exitToMenuBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        messageEl.style.display = 'none';
        gameScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });
    }
  }

  function win() {
    gameRunning = false;
    if (gameLoop) clearInterval(gameLoop);
    messageEl.innerHTML = `
      WYGRAŁEŚ!<br>Przeżyłeś całą noc!
      <button id="exitToMenuBtn">Wyjście</button>
    `;
    messageEl.style.display = 'flex';

    // ZATRZYMAJ MUZYKĘ
    gameAudio.pause();
    gameAudio.currentTime = 0;

    const exitBtn = document.getElementById('exitToMenuBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        messageEl.style.display = 'none';
        gameScreen.style.display = 'none';
        mainMenu.style.display = 'block';
      });
    }
  }

  function resetGame() {
    currentCamera = null;
    power = 100;
    hour = 0;
    freddyProgress = 0;
    gameRunning = true;
    currentCamIndex = 0;

    powerEl.textContent = "Bateria: 100%";
    messageEl.style.display = 'none';
    freddyEl.style.opacity = '0';
    freddyEl.style.display = 'none';

    showView('office');
    updateTime();
  }

  function startGame() {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'block';
    resetGame();

    // WŁĄCZ MUZYKĘ
    gameAudio.currentTime = 0;
    gameAudio.play().catch(e => console.log("Audio play failed:", e));

    gameLoop = setInterval(() => {
      if (!gameRunning) return;

      if (Math.random() < 0.02) {
        hour++;
        updateTime();
        if (hour >= 6) {
          win();
          return;
        }
      }

      if (currentCamera !== '1A') {
        if (Math.random() < 0.03) freddyProgress++;
      } else {
        if (freddyProgress > 0 && Math.random() < 0.1) freddyProgress--;
      }

      if (freddyProgress >= 5) {
        gameOver("Freddy stał się zbyt blisko!");
      }

      if (Math.random() < 0.005 && currentCamera !== null) {
        usePower(0.2);
      }
    }, 200);
  }

  startBtn.addEventListener('click', startGame);

  if (leftBtn) leftBtn.addEventListener('click', () => {
    if (!gameRunning) return;
    currentCamIndex = (currentCamIndex - 1 + CAMERA_LIST.length) % CAMERA_LIST.length;
    showView(CAMERA_LIST[currentCamIndex]);
    usePower(2);
  });

  if (rightBtn) rightBtn.addEventListener('click', () => {
    if (!gameRunning) return;
    currentCamIndex = (currentCamIndex + 1) % CAMERA_LIST.length;
    showView(CAMERA_LIST[currentCamIndex]);
    usePower(2);
  });

  if (downBtn) downBtn.addEventListener('click', () => {
    if (!gameRunning) return;
    showView('office');
  });
});