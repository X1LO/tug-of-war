const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;

// Car settings
const carWidth = 90;   // or any size you like, just keep them equal
const carHeight = 90;
const gap = 200;

let ropeCenterX = canvas.width / 2 - 30;
const playerSpeed = 2; // was 1.5, now weaker
const botSpeed = 0.5;   // was 0.1, now stronger

let isPulling = false;
let gameOver = false;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    gameStarted = true;  // Start the game when Space is pressed
    isPulling = true;    // Start pulling when space is held down
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    isPulling = false;   // Stop pulling when space is released
  }
});

canvas.addEventListener('mousedown', () => {
  gameStarted = true;
  isPulling = true;
});
canvas.addEventListener('mouseup', () => {
  isPulling = false;
});

// For mobile touch
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  gameStarted = true;
  isPulling = true;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  isPulling = false;
}, { passive: false });


function update() {
  if (!gameStarted || gameOver) return;


  if (isPulling) {
    ropeCenterX += playerSpeed;
  }

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



function draw() {
  if (!gameStarted) {
    ctx.fillStyle = '#222'; // dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white'; // text color
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to Start Tug of War!', canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { playerX, botX, y } = getPositions();

  // Draw rope
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
 // toki
   ctx.beginPath();
  ctx.strokeStyle = '333';
  ctx.lineWidth = 8;
  const midX = (playerX + botX + carWidth) / 2;
  const midY = y + carHeight / 2 + Math.sin(Date.now() / 200) * 10;
  const ropeOffset = 10; // Try 10, adjust as needed
  ctx.moveTo(playerX + ropeOffset, y + carHeight / 2);
  ctx.quadraticCurveTo(midX, midY, botX + carWidth - ropeOffset, y + carHeight / 2); // back of bot (left truck)
  ctx.stroke();

 
  drawCar(playerX, y, 'blue');
  drawCar(botX, y, 'orange');
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
    endGame("Bot wins! 😈");
  }
}


function endGame(message) {
  gameOver = true;
  setTimeout(() => {
    alert(message);
    location.reload();
  }, 100);
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
