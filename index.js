/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/no-use-before-define, unicorn/no-null */
import { Area, Entity, Player, Collectible, GameState } from './classes';

// #region Functions
/** Same result as random(), but secure. */
const random = () => globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

/** @type {Game['getContrastColor']} */
function getContrastColor(hex) {
  /* eslint-disable-next-line id-length */
  const [r, g, b] = hex.match(/\d{2}/g).map(e => Number.parseInt(e, 16));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}

/** @type {Game['getCurrentArea']} */
function getCurrentArea() {
  if (persistentScore >= 666) return blackHole;

  const planetIndex = Math.min(Math.floor(persistentScore / 60), areas.length - 1);
  return areas[planetIndex];
}

// We'll also add a 'hasHit' flag for flying obstacles when they spawn.
/** @type {Game['spawnFlyingObstacle']} */
function spawnFlyingObstacle(currentArea) {
  return new Entity({
    // color:
    baseSpeed: 5 + level / 2,
    width: 40,
    height: 20,
    posX: canvas.width,

    // For Venus, spawn obstacles lower
    posY: random() * (
      currentArea.name === 'Venus'
        ? (canvas.height / 5) + (canvas.height * 0.6)
        : canvas.height / 2
    ),
    posZ: 0
  });
}

/** @type {Game['spawnCoin']} */
const spawnCoin = () => new Collectible(
  'coin', 10,
  random() * (canvas.width - 20) + 10,
  random() * (canvas.height - 100) + 10
);

/** @type {Game['checkCollision']} */
function checkCollision(rect1, rect2) {
  const x1 = rect1.x ?? rect1.posX;
  const y1 = rect1.y ?? rect1.posY;
  const x2 = rect2.x ?? rect2.posX;
  const y2 = rect2.y ?? rect2.posY;

  return (
    x1 < x2 + rect2.width
    && y1 < y2 + rect2.height
    && x1 + rect1.width > x2
    && y1 + rect1.height > y2
  );
}

/** @type {Game['checkCoinCollision']} */
function checkCoinCollision(coin, player) {
  const dx = coin.posX - (player.posX + player.width / 2);
  const dy = coin.posY - (player.posY + player.height / 2);

  return Math.hypot(dx, dy) < coin.radius + Math.min(player.width, player.height) / 4;
}

/** @type {Game['drawWeather']} */
function drawWeather(currentArea) {
  const numDrops = 30;

  for (let i = 0; i < numDrops; i++) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;

    const length = random() * 15 + 5;
    if (currentArea.name === 'Sun')
      ctx.strokeStyle = 'rgba(255, 69, 0, 0.5)';
    else if (['Venus', 'Earth', 'Mars'].includes(currentArea.name))
      ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
    else
      continue;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + length);
    ctx.stroke();
  }
}

/** @type {Game['restartGame']} */
function restartGame() {
  score = 0;
  persistentScore = 0;
  level = 1;
  gameState = GameState.playing;

  justin.reset();

  collisionEffectTimer = 0;
  flyingObstacles = [];
  flyingObstacleTimer = 300;

  // TODO: remove old coin
  coin = spawnCoin();

  powerUp = null;
  powerUpTimer = Math.floor(random() * 700) + 800;

  enemyBoostTime = 0;
  console.debug('Game restarted');
}

// #endregion Functions

/** @type {HTMLCanvasElement} */
globalThis.canvas = document.querySelector('#gameCanvas');

/** @type {CanvasRenderingContext2D} */
globalThis.ctx = canvas.getContext('2d');

/* Game settings
   const immortal = false; */
/* eslint-disable-next-line prefer-const */
let testingMode = false;

/**
 * @type {Game.Area[]}
 * Array of areas (from easiest to hardest) */
const areas = [
  new Area('Mercury', '#666666', 0.4, new Entity({ color: 'gray', baseSpeed: 3, height: 20 })),
  new Area('Venus', '#FFB347', 0.45, new Entity({ color: 'orange', baseSpeed: 3.2, height: 35 })),
  new Area('Earth', '#4B9CD3', 0.5, new Entity({ color: 'brown', baseSpeed: 3, height: 45 })),
  new Area('Mars', '#CC3300', 0.55, new Entity({ color: 'white', baseSpeed: 3.5, height: 40 })),
  new Area('Jupiter', '#D2B48C', 0.6, new Entity({ color: 'beige', baseSpeed: 4, height: 50 })),
  new Area('Saturn', '#F0E68C', 0.65, new Entity({ color: 'goldenrod', baseSpeed: 3.8, height: 45 })),
  new Area('Uranus', '#AFEEEE', 0.7, new Entity({ color: 'lightblue', baseSpeed: 4.2, height: 40 })),
  new Area('Neptune', '#4169E1', 0.75, new Entity({ color: 'blue', baseSpeed: 4.5, height: 40 })),
  new Area('Sun', '#FF4500', 0.8, new Entity({ color: 'black', baseSpeed: 5, height: 50 }))
];

/**
 * @type {Area}
 * Endlevel: Black Hole when persistentScore >= 666 */
const blackHole = new Area('Black Hole', '#000000', 1.2, new Entity('#222222', 10, 60));

// Global variables
let score = 0;
let persistentScore = 0;
let level = 1;
let gameState = GameState.playing;
let collisionEffectTimer = 0;

let coin = spawnCoin();

// Power-up: When picked up, grants invincibility for 300 frames and enemy boost for 282 frames.
let powerUp = null;
let powerUpTimer = Math.floor(random() * 700) + 800; // 800 to 1500 frames
let enemyBoostTime = 0;

// Array for flying obstacles
let flyingObstacles = [];
let flyingObstacleTimer = 300;

/** @type {Game.Player} */
const justin = new Player({
  color: 'red',
  baseSpeed: 5,
  width: 50,
  height: 70,
  posX: 100,
  posY: 500,
  posZ: 0,

  jumpStrength: -12,
  gravity: 0.5, // set dynamically
  maxHealth: 100
});

/**
 * @type {Game.Entity}
 * "Kacke" */
const enemy = new Entity({
  color: 'brown',
  baseSpeed: 3,
  width: 50,
  height: 45,
  posX: canvas.width,
  posY: 550,
  posZ: 0
});

const keys = {};
const shopCosts = [15, 20, 25, 25, 100];
document.addEventListener('keydown', e => {
  switch (gameState) {
    case GameState.gameOver:
      if (e.key.toLowerCase() === 'r') restartGame();
      break;


    case GameState.shop:

      // Check if selected item is affordable, also prevent buying useless Big Boy
      /* eslint-disable-next-line unicorn/prefer-number-properties -- intentional */
      if (!isNaN(e.key)) {
        if (
          score < shopCosts[e.key]
          || e.key === '5' && justin.damageReduction != 0
        ) break;
        else score -= shopCosts[e.key];
      }

      // Shop options
      switch (e.key.toLowerCase()) {
        case '1':
          justin.jumpStrength *= 1.03;

          console.debug('Stronger Jump purchased!');
          break;

        case '2':
          justin.baseSpeed += 2;

          console.debug('More Endurance purchased!');
          break;

        case '3':
          enemy.speed *= 0.95;

          console.debug('Enemies slowed!');
          break;

        case '4':
          justin.health = Math.min(justin.health + 20, justin.maxHealth);

          console.debug('Extra Health purchased!');
          break;

        case '5':
          justin.damageReduction = 10;

          console.debug('Big Boy purchased! Shield active: Damage reduced by 10.');
          break;

        case 'c':
          // Clear key states upon shop exit.
          for (const k in keys) keys[k] = false;

          level++;
          gameState = GameState.playing;

          // Reset Justin's position.
          justin.posX = 100;
          justin.posY = 500;
          justin.posZ = 0;

          console.debug('Continuing to level ' + level);
          break;
      }
      break;

    case GameState.playing:
      keys[e.key] = true;

      switch (e.key.toLowerCase()) {
        // Make W key work as jump, along with Up Arrow and Space.
        case ' ':
        case 'w':
        case 'arrowup':
          if (justin.isOnGround()) justin.dy = justin.jumpStrength;
          break;

        case 'shift':
          if (justin.dashCooldown === 0 && justin.dashTime === 0)
            justin.dashTime = 10;
          break;
      }
  }
});

document.addEventListener('keyup', e => {
  if (gameState !== GameState.shop) keys[e.key] = false;
});

// Start game loop after the page finished loading
document.addEventListener('DOMContentLoaded', () => gameLoop());

function update() {
  if (gameState !== GameState.playing) return;

  const currentArea = getCurrentArea();

  justin.gravity = currentArea.gravity;

  enemy.height = currentArea.enemy.height;
  enemy.color = currentArea.enemy.color;

  // Increase base speed by 10%
  const baseEnemySpeed = testingMode ? 30 : currentArea.enemy.speed * 1.1;
  if (enemyBoostTime > 0) {
    enemy.speed = baseEnemySpeed * 3;
    enemyBoostTime--;
  }
  else enemy.speed = baseEnemySpeed;

  // Decrease invincibility timer
  if (justin.immortalityTime > 0) justin.immortalityTime--;

  justin.speed = justin.baseSpeed;
  let horizontalSpeed = justin.speed;

  if (justin.dashTime > 0) {
    horizontalSpeed *= 2;
    justin.dashTime--;
    if (justin.dashTime === 0) justin.dashCooldown = 50;
  }
  if (justin.dashCooldown > 0) justin.dashCooldown--;

  if (keys.ArrowRight || keys.d)
    justin.posX += horizontalSpeed;
  if (keys.ArrowLeft || keys.a)
    justin.posX = Math.max(justin.posX - horizontalSpeed, 0);

  if (justin.posX + justin.width > canvas.width)
    justin.posX = canvas.width - justin.width;


  justin.posY += justin.dy;
  justin.dy += justin.gravity;
  if (justin.posY + justin.height > canvas.height) {
    justin.posY = canvas.height - justin.height;
    justin.dy = 0;
  }

  if (justin.posY < 0) justin.posY = 0;


  if (justin.invulTimer > 0) justin.invulTimer--;

  enemy.posX -= enemy.speed;
  if (enemy.posX + enemy.width < 0) {
    enemy.posX = canvas.width; // TODO: is this actually just setting dead enemies outside the canvas? lol

    score++;
    persistentScore++;
  }

  // Collision with enemy (using hasHit flag)
  if (checkCollision(justin, enemy) && justin.invulTimer === 0 && justin.immortalityTime <= 0) {
    if (enemy.hasHit) {
      enemy.hasHit = false;
      return;
    }

    enemy.hasHit = true;

    const damage = Math.max(20 - justin.damageReduction, 0);
    justin.health -= damage;

    justin.invulTimer = 60;
    collisionEffectTimer = 30;

    if (justin.health <= 0) gameState = GameState.gameOver;
    console.debug('Collision! Health: ' + justin.health);
  }

  if (checkCoinCollision(coin, justin)) {
    score += 5;
    persistentScore += 5;

    // TODO: remove old coin
    coin = spawnCoin();
    console.debug('Coin collected!');
  }

  if (powerUp) {
    powerUp.duration--;
    if (powerUp.duration > 0 && checkCollision(powerUp, justin)) {
      justin.immortalityTime = 300;
      enemyBoostTime = 282;

      console.debug('Power-Up collected: Invincible & Enemies 3x faster for 5 sec!');
    }

    powerUp = null;
  }
  else {
    powerUpTimer--;

    // TODO: Class
    if (powerUpTimer <= 0) {
      powerUp = {
        x: random() * (canvas.width - 30) + 15,
        y: random() * (canvas.height / 3) + (canvas.height * 2 / 3 - 50),
        width: 20,
        height: 20,
        duration: 600
      };
      powerUpTimer = Math.floor(random() * 700) + 800;
    }
  }

  if (level >= 5) {
    flyingObstacleTimer--;
    if (flyingObstacleTimer <= 0) {
      flyingObstacles.push(spawnFlyingObstacle(currentArea));
      flyingObstacleTimer = Math.floor(random() * 300) + 300;
    }

    for (let i = flyingObstacles.length - 1; i >= 0; i--) {
      const obs = flyingObstacles[i];
      obs.posX -= obs.speed;

      if (obs.posX + obs.width < 0) {
        flyingObstacles.splice(i, 1);
        continue;
      }

      if (checkCollision(justin, obs) && justin.invulTimer === 0 && justin.immortalityTime <= 0) {
        if (!obs.hasHit) {
          const damage = Math.max(20 - justin.damageReduction, 0);
          justin.health -= damage;
          justin.invulTimer = 60;
          collisionEffectTimer = 30;
          obs.hasHit = true;
          console.log('Collision with flying obstacle! Health: ' + justin.health);
          if (justin.health <= 0) gameState = 'gameover';
        }
      }
      else obs.hasHit = false;
    }
  }

  const shopInterval = level <= 10 ? 20 : 30;
  if (persistentScore >= level * shopInterval)
    gameState = GameState.shop;
}

function draw() {
  /** @type {Area} */
  const currentArea = getCurrentArea();
  const dynamicTextColor = getContrastColor(currentArea.background);

  ctx.fillStyle = currentArea.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawWeather(currentArea);

  // TODO: px to rem
  ctx.fillStyle = dynamicTextColor;
  ctx.font = '20px Arial';
  ctx.fillText('Planet: ' + currentArea.name, canvas.width / 2 - 100, 30);

  ctx.fillStyle = justin.color;
  ctx.fillRect(justin.posX, justin.posY, justin.width, justin.height);

  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.posX, enemy.posY, enemy.width, enemy.height);

  ctx.beginPath();
  ctx.arc(coin.posX, coin.posY, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();

  if (powerUp) {
    ctx.fillStyle = 'lime';
    ctx.fillRect(powerUp.posX, powerUp.posY, powerUp.width, powerUp.height);
  }

  for (const obs of flyingObstacles) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(obs.posX, obs.posY, obs.width, obs.height);
  }

  ctx.fillStyle = '#FFD700';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Highscore: ' + persistentScore, canvas.width - 200, 30);
  ctx.fillText('Level: ' + level, 10, 60);
  ctx.fillText('Health: ' + justin.health, 10, 90);

  ctx.fillStyle = dynamicTextColor;
  ctx.font = '18px Arial';
  if (justin.immortalityTime > 0) ctx.fillText('Invincible!', 10, 120);
  if (justin.damageReduction > 0) ctx.fillText('Shield: Big Boy Active', 10, 140);

  if (collisionEffectTimer > 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    collisionEffectTimer--;
  }

  if (gameState === GameState.shop) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = dynamicTextColor;
    ctx.font = '28px Arial';
    ctx.fillText('Level ' + level + ' completed!', canvas.width / 2 - 150, canvas.height / 2 - 100);
    ctx.font = '24px Arial';
    ctx.fillText('Shop:', canvas.width / 2 - 50, canvas.height / 2 - 60);
    ctx.fillText('1: Stronger Jump (15 pts, +3%)', canvas.width / 2 - 150, canvas.height / 2 - 20);
    ctx.fillText('2: More Endurance (20 pts)', canvas.width / 2 - 150, canvas.height / 2 + 20);
    ctx.fillText('3: Slow Enemies (25 pts)', canvas.width / 2 - 150, canvas.height / 2 + 60);
    ctx.fillText('4: Extra Health (25 pts, +20 HP)', canvas.width / 2 - 150, canvas.height / 2 + 100);
    ctx.fillText('5: Big Boy (100 pts, Shield: -10 dmg)', canvas.width / 2 - 150, canvas.height / 2 + 140);
    ctx.fillText('Planet: ' + currentArea.name, canvas.width / 2 - 150, canvas.height / 2 + 180);
    ctx.fillText('Press "C" to continue.', canvas.width / 2 - 150, canvas.height / 2 + 220);
  }

  if (gameState === GameState.gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText('Press "R" to restart', canvas.width / 2 - 130, canvas.height / 2);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop); // TODO: consistent speed across different screen refresh rates
}