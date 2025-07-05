const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let gameOver = false;

// Car settings
const carWidth = 90;
const carHeight = 90;
const gap = 200;

let ropeCenterX = canvas.width / 2 - 30;
const playerSpeed = 15;
const botSpeed = 0.5;

let spaceDown = false; // Add this line

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !spaceDown) { // Only on first press
    spaceDown = true;
    if (!gameStarted) {
      gameStarted = true;
    } else if (!gameOver) {
      ropeCenterX += playerSpeed; // Only move when SPACE is pressed, not held
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    spaceDown = false;
  }
});

canvas.addEventListener('mousedown', () => {
  gameStarted = true;
  if (!gameOver) {
    ropeCenterX += playerSpeed;
  }
});
canvas.addEventListener('mouseup', () => {
  // No action needed
});

// For mobile touch
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  gameStarted = true;
  if (!gameOver) {
    ropeCenterX += playerSpeed;
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
}, { passive: false });


function update() {
  if (!gameStarted || gameOver) return;

  // Only bot pulls automatically
  ropeCenterX -= botSpeed;

  checkWinCondition();
}
function getPositions() {
  const y = canvas.height / 2 - carHeight / 2;
  // Bot is now on the left, player is on the right
  const botX = ropeCenterX - gap / 2 - carWidth;
  const playerX = ropeCenterX + gap / 2;
  return { playerX, botX, y };
}



// --- Confetti system ---
const confettiPieces = [];
function spawnConfetti() {
  for (let i = 0; i < 80; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      speed: Math.random() * 2 + 2,
      dx: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2
    });
  }
}
function drawConfetti() {
  for (const c of confettiPieces) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r);
    ctx.restore();
    c.y += c.speed;
    c.x += c.dx;
    c.angle += c.spin;
  }
}

// --- Enhanced draw function ---
function draw() {
  const t = Date.now() / 1000;

  // Animated grass (wavy top and bottom)
  let grassGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grassGradient.addColorStop(0, "#4eea7b");
  grassGradient.addColorStop(1, "#228B22");
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wavy grass edge (top)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= canvas.width; x += 10) {
    ctx.lineTo(
      x,
      18 + Math.sin(t * 2 + x * 0.04) * 6
    );
  }
  ctx.lineTo(canvas.width, 0);
  ctx.closePath();
  ctx.fillStyle = "#3cb371";
  ctx.fill();
  ctx.restore();

  // Wavy grass edge (bottom)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x += 10) {
    ctx.lineTo(
      x,
      canvas.height - 18 + Math.cos(t * 2 + x * 0.04) * 6
    );
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fillStyle = "#3cb371";
  ctx.fill();
  ctx.restore();

  // Track settings
  let trackHeight = 180;
  let trackY = (canvas.height - trackHeight) / 2;

  // Track shadow
  ctx.save();
  ctx.shadowColor = "#222";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, trackY + 10, canvas.width, trackHeight - 20);
  ctx.restore();

  // Draw track (brighter asphalt)
  let trackGradient = ctx.createLinearGradient(0, trackY, 0, trackY + trackHeight);
  trackGradient.addColorStop(0, "#e0e0e0");
  trackGradient.addColorStop(1, "#bdbdbd");
  ctx.fillStyle = trackGradient;
  ctx.fillRect(0, trackY, canvas.width, trackHeight);

  // Draw track edges (white lines)
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, trackY, canvas.width, 8); // top edge
  ctx.fillRect(0, trackY + trackHeight - 8, canvas.width, 8); // bottom edge

  // Animated dashed center line
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 6;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -((t * 30) % 60); // animate dashes
  ctx.beginPath();
  ctx.moveTo(0, trackY + trackHeight / 2);
  ctx.lineTo(canvas.width, trackY + trackHeight / 2);
  ctx.stroke();
  ctx.restore();

  if (!gameStarted) {
    ctx.fillStyle = '#222'; // dark overlay
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white'; // text color
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to Start Tug of War!', canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, 0, 0); // No-op, keep for structure

  const { playerX, botX, y } = getPositions();

  // Draw rope (vertical center line)
  ctx.save();
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 4;
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Draw rope (between cars) with more dynamic wiggle
  ctx.beginPath();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 8;
  const midX = (playerX + botX + carWidth) / 2;
  const midY = y + carHeight / 2 + Math.sin(Date.now() / 200) * 10 + Math.sin(t * 6) * 4;
  const ropeOffset = 10 + Math.sin(t * 4) * 2;
  ctx.moveTo(playerX + ropeOffset, y + carHeight / 2);
  ctx.quadraticCurveTo(midX, midY, botX + carWidth - ropeOffset, y + carHeight / 2);
  ctx.stroke();

  drawCar(playerX, y, 'blue');
  drawCar(botX, y, 'orange');

  // Draw confetti if any
  drawConfetti();
}

// Load both images
const playerImg = new Image();
playerImg.src = 'img/123.png'; // Your original image

const botImg = new Image();
botImg.src = 'img/1.png'; // The new image you just uploaded

function drawCar(x, y, color) {
  ctx.save();
  if (color === 'blue') {
    ctx.globalAlpha = 1;
    ctx.drawImage(playerImg, x, y, carWidth, carHeight);
  } else {
    ctx.globalAlpha = 0.85;
    // Flip the bot image horizontally
    ctx.translate(x + carWidth / 2, y + carHeight / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(botImg, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
  }
  ctx.restore();
}

function checkWinCondition() {
  const { playerX, botX } = getPositions();
  const centerLine = canvas.width / 2;

  // If bot's car touches or crosses the center line, player wins
  if (botX + carWidth >= centerLine) {
    endGame("You win! 🎉");
  }
  // If player's car touches or crosses the center line, bot wins
  else if (playerX <= centerLine) {
    endGame("Bot wwinssss! 😈");
  }
}


function endGame(message) {
  gameOver = true;
  if (message.includes("win")) spawnConfetti();
  setTimeout(() => {
    alert(message);
    location.reload();
  }, 1000); // Give time for confetti
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

const truckImg = new Image();
truckImg.src = 'img/123.png'; // Use your actual file name here
truckImg.onload = function() {
  gameLoop();
};
