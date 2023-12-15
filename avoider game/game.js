let lastUpdateTime = performance.now();

function update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    
    // Update your game logic using deltaTime
    
    lastUpdateTime = currentTime;
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  width: 60,
  height: 60,
  img: new Image(),
  speed: 1.5,
  direction: 'right'
};

player.img.src = 'unnamed.png';

player.img.onload = function() {
  gameLoop();
};

const enemies = [];
const enemySpeed = 1;
const enemySize = 20;
const enemySpawnRate = 50;

const fireballImage = new Image();
fireballImage.src = 'fireball.png';

enemies.onload = function() {
  fireballImage.width = enemySize;
  fireballImage.height = enemySize;
  gameLoop();
};

const gold = []
const goldSpeed = 1;
const goldSize = 20;
const goldSpawnRate = 500;

const goldImage = new Image();
goldImage.src = 'goldCoin.png';

gold.onload = function() {
  goldImage.width = goldSize;
  goldImage.height = goldSize;
  gameLoop();
};

const projectiles = [];
const projectileSpeed = 1;
const projectileSize = 10;
let projectileSpawnTimer = 0;
const projectileSpawnDelay = 150; // Adjust this value to control the delay (in frames)

let score = 0;
let collectedGold = 0;

const gravity = .01; // Adjust this value to control the strength of gravity
const jumpStrength = 1.5; // Adjust this value to control the strength of the jump
const damping = 1; // Adjust this value to control the damping during descent
let isJumping = false;
let velocityX = 0;
let velocityY = 0;

let gameTime = 0;
let gameTimeInterval;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  return formattedMinutes + ':' + formattedSeconds;
}

function startGameTimer() {
  gameTimerInterval = setInterval(() => {
    gameTime++;
    draw(); // Update the canvas with the formatted time
  }, 1000); // Update the timer every second (1000 milliseconds)
}

function stopGameTimer() {
  clearInterval(gameTimerInterval);
}

function resetGameTimer() {
  gameTime = 0;
}

function drawPlayer() {
  if (player.direction === 'left') {
    ctx.drawImage(player.img, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
  } else {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(player.img, -player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    ctx.restore();
  }
}

function drawFireball(x, y) {
  ctx.drawImage(fireballImage, x - fireballImage.width / 2, y - fireballImage.height / 2);
}

function drawGold(x, y) {
  ctx.drawImage(goldImage, x - goldImage.width / 2, y - goldImage.height / 2);
}

function drawProjectile(x, y) {
  ctx.fillStyle = '#00F'; // Blue color for projectiles
  ctx.fillRect(x - projectileSize / 2, y - projectileSize / 2, projectileSize, projectileSize);
}

function drawScore() {
  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Collected Gold: ' + collectedGold, 10, 60);
}

function update() {
  if (!gameRunning) return;

  // Move player
  if (keys.left && player.x - player.width / 2 > 0) {
    player.x -= player.speed;
    player.direction = 'left';
  }

  if (keys.right && player.x + player.width / 2 < canvas.width) {
    player.x += player.speed;
    player.direction = 'right';
  }

  // Move enemies
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].y += enemySpeed;

    // Check for collisions with player
    if (
      enemies[i].y + fireballImage.height / 2 > player.y - player.height / 2 &&
      enemies[i].y - fireballImage.height / 2 < player.y + player.height / 2 &&
      enemies[i].x + fireballImage.width / 2 > player.x - player.width / 2 &&
      enemies[i].x - fireballImage.width / 2 < player.x + player.width / 2
    ) {
      gameOver();
      return;
    }

    // Remove off-screen enemies
    if (enemies[i].y - enemySize / 2 > canvas.height) {
      enemies.splice(i, 1);
      i--;
      score++;
    }
  }

  // Move gold
  for (let i = 0; i < gold.length; i++) {
    gold[i].y += goldSpeed;

    // Check for collisions with player
    if (
gold[i].y + goldImage.height / 2 > player.y - player.height / 2 &&
    gold[i].y - goldImage.height / 2 < player.y + player.height / 2 &&
    gold[i].x + goldImage.width / 2 > player.x - player.width / 2 &&
    gold[i].x - goldImage.width / 2 < player.x + player.width / 2
    ) {
      // Increase collected gold count by 1
      collectedGold++;
      // Remove collected gold
      gold.splice(i, 1);
      i--;
    }
  }

  // Move projectiles
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].y -= projectileSpeed;

    // Check for collisions with enemies
    for (let j = 0; j < enemies.length; j++) {
      if (
        projectiles[i].y - projectileSize / 2 < enemies[j].y + enemySize / 2 &&
        projectiles[i].y + projectileSize / 2 > enemies[j].y - enemySize / 2 &&
        projectiles[i].x - projectileSize / 2 < enemies[j].x + enemySize / 2 &&
        projectiles[i].x + projectileSize / 2 > enemies[j].x - enemySize / 2
      ) {
        // Remove projectile and enemy
        projectiles.splice(i, 1);
        enemies.splice(j, 1);
        score++;

        // Break out of the inner loop after removing a projectile
        break;
      }
    }

    // Remove off-screen projectiles
    if (projectiles[i] && projectiles[i].y + projectileSize / 2 < 0) {
      projectiles.splice(i, 1);
      i--;
    }
  }

  // Remove off-screen gold
  for (let i = gold.length - 1; i >= 0; i--) {
    if (gold[i].y - goldSize / 2 > canvas.height) {
      gold.splice(i, 1);
    }
  }

  // Spawn new enemies
  if (Math.random() < 1 / enemySpawnRate) {
    const enemyX = Math.random() * canvas.width;
    enemies.push({ x: enemyX, y: 0 });
  }

  // Spawn new gold
  if (Math.random() < 1 / goldSpawnRate) {
    const goldX = Math.random() * canvas.width;
    gold.push({ x: goldX, y: 0 });
  }

  // Shoot projectiles at regular intervals
  projectileSpawnTimer++;

  // Check if the timer has reached the desired delay
  if (projectileSpawnTimer >= projectileSpawnDelay) {
    const projectileX = player.x;
    const projectileY = player.y;
    projectiles.push({ x: projectileX, y: projectileY });

    // Reset the timer
    projectileSpawnTimer = 0;
  }

// Apply gravity to the player's y-velocity
velocityY += gravity;

// Apply damping to the y-velocity for smoother descent
velocityY *= damping;

// Update player's position based on velocity
player.x += velocityX;
player.y += velocityY;

// Check if the player is on the ground (you might need to adjust this based on your game)
if (player.y > canvas.height - 60) {
  player.y = canvas.height - 60; // Snap the player to the ground
  velocityY = 0; // Reset y-velocity when on the ground
  isJumping = false;
}

// Check for jump input and apply jump
if (keys.space && !isJumping) {
  velocityY = -jumpStrength;
  isJumping = true;
}
}

let floorOffset = 0;

function draw() {
  // Set the background color to grey
  ctx.fillStyle = '#413e3e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Move the floor based on player's movement
  floorOffset += player.direction === 'left' ? player.speed : -player.speed;
  const floorPosition = (canvas.height + floorOffset) % 80;

  ctx.fillStyle = '#4CAF50'; // Green floor color
  ctx.fillRect(0, canvas.height - 40, canvas.width, 80);

  drawPlayer();
  for (const enemy of enemies) {
    drawFireball(enemy.x, enemy.y);
  }
  for (const g of gold) {
    drawGold(g.x, g.y);
  }
  for (const projectile of projectiles) {
    drawProjectile(projectile.x, projectile.y);
  }
  drawScore();

  ctx.fillStyle = 'white';
  ctx.font = '50px Arial';
  const formattedTime = formatTime(gameTime);
  const timerText = formattedTime;
  const timerTextWidth = ctx.measureText(timerText).width;
  ctx.fillText(timerText, canvas.width / 2 - timerTextWidth / 2, canvas.height / 8);
}


function gameOver() {
  gameRunning = false;
  stopGameTimer(); // Stop the timer
  alert('Game Over! Your score is ' + score + ' and you collected ' + collectedGold + ' gold.');
  resetGame();
}

function resetGame() {
  gameRunning = true;
  keys.left = false;
  keys.right = false;
  keys.space = false;
  player.x = canvas.width / 2;
  player.y = canvas.height - 60;
  enemies.length = 0;
  gold.length = 0;
  projectiles.length = 0;
  score = 0;
  collectedGold = 0;
  resetGameTimer(); // Reset the timer
  startGameTimer(); // Start the timer
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

const keys = {
  left: false,
  right: false,
  space: false
};

window.addEventListener('keydown', (e) => {
  handleKeyDown(e);
});

window.addEventListener('keyup', (e) => {
  handleKeyUp(e);
});

function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  if (e.key === ' ') keys.space = true;
}

function handleKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  if (e.key === ' ') keys.space = false;
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Add the play button click event listener
let gameRunning = false;

const itemShopButton = document.getElementById('itemShopButton');

// Function to handle the item shop action
function goToItemShop() {
  document.getElementById('itemShop').style.display = 'block';
  alert("Opening Item Shop!"); // Example: show an alert
}

// Add event listener to the item shop button
document.getElementById("itemShopButton").addEventListener("click", goToItemShop);


const playButton = document.getElementById('playButton');
playButton.addEventListener('click', startGame);

function startGame() {
  // Hide the play/itemShop button
  itemShopButton.style.display = 'none';
  playButton.style.display = 'none';
  // Start or restart the game
  resetGame();
  gameRunning = true;
  gameTime = 0; // Reset the timer
  if (!gameTimerInterval) {
    startGameTimer(); // Start the timer only if it's not already running
  }
  gameLoop();
}

// game.js

document.addEventListener('DOMContentLoaded', function () {
  // Your JavaScript code here

  // Add event listeners to the item shop buttons
  document.getElementById('playButton').addEventListener('click', startGame);
  document.getElementById('itemShopButton').addEventListener('click', goToItemShop);
  document.getElementById('enterGameButton').addEventListener('click', startGame);
  document.getElementById('exitItemShopButton').addEventListener('click', exitItemShop);
});

function goToItemShop() {
  // Hide the game elements and show the item shop
  document.getElementById('gameCanvas').style.display = 'none';
  document.getElementById('scoreDisplay').style.display = 'none';
  document.getElementById('goldDisplay').style.display = 'none';
  document.getElementById('playButton').style.display = 'none';
  document.getElementById('itemShopButton').style.display = 'none';
  // Show the item shop and the exit button
  document.getElementById('exitItemShopButton').style.display = 'block';
}

function exitItemShop() {
  // Show the game elements and hide the item shop
  document.getElementById('gameCanvas').style.display = 'block';
  document.getElementById('scoreDisplay').style.display = 'block';
  document.getElementById('goldDisplay').style.display = 'block';
  document.getElementById('playButton').style.display = 'block';
  document.getElementById('itemShopButton').style.display = 'block';
  document.getElementById('itemShop').style.display = 'none';
  document.getElementById('exitItemShopButton').style.display = 'none';
}
