/* eslint-disable @typescript-eslint/no-magic-numbers */

import './globals.js'

import { Entity, Player, GameState } from './classes.js';
import {
  random, getContrastColor, getCurrentArea,
  spawnFlyingObstacle, spawnCoin, spawnPowerUp,
  checkCollision, checkCoinCollision, drawWeather, restartGame
} from './functions.js';


let collisionEffectTimer = 0;

let coin = spawnCoin();
let powerUp = spawnPowerUp();

let enemyBoostTime = 0;

// Array for flying obstacles
const flyingObstacles = [];
let flyingObstacleTimer = 300;

const justin = new Player({
  color: 'red',
  baseSpeed: 300,
  width: 50,
  height: 70,
  posX: 100,
  posY: 500,
  posZ: 0,

  jumpStrength: -800,
  maxHealth: 100
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
          currentArea.enemy.speed *= 0.95;

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
          for (const key of Object.keys(keys)) keys[key] = false;

          level++;
          gameState = GameState.playing;

          // Reset Justin's position.
          justin.resetPosition();

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
          justin.jump();

        case 'shift':
          if (justin.dashCooldown === 0 && justin.dashTime === 0)
            justin.dashTime = 10;
      }
  }
});

document.addEventListener('keyup', e => {
  if (gameState !== GameState.shop) keys[e.key] = false;
});

// Start game loop after the page finished loading
document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(gameLoop));

function update(deltaTime) {
  if (gameState !== GameState.playing) return;

  const currentArea = getCurrentArea();

  justin.gravity = currentArea.gravity;

  // Increase base speed by 10%
  const baseEnemySpeed = testingMode ? 30 : currentArea.enemy.baseSpeed * 1.1;
  if (enemyBoostTime > 0) {
    currentArea.enemy.speed = baseEnemySpeed * 3;
    enemyBoostTime -= deltaTime;
  }
  else currentArea.enemy.speed = baseEnemySpeed;

  if (justin.immortalityTime > 0) justin.immortalityTime -= deltaTime;
  if (collisionEffectTimer > 0) collisionEffectTimer -= deltaTime

  justin.speed = justin.baseSpeed;
  let horizontalSpeed = justin.speed;

  if (justin.dashTime > 0) {
    horizontalSpeed *= 2;
    justin.dashTime -= deltaTime;
    if (justin.dashTime <= 0) justin.dashCooldown = 5000;
  }

  if (justin.dashCooldown > 0) justin.dashCooldown -= deltaTime;

  const movement = horizontalSpeed * (deltaTime / 1000); // Pixel per second -> ms

  if (keys.ArrowRight || keys.d)
    justin.posX += movement;
  if (keys.ArrowLeft || keys.a)
    justin.posX = Math.max(justin.posX - movement, 0);

  if (justin.posX + justin.width > canvas.width)
    justin.posX = canvas.width - justin.width;

  justin.posY += justin.dy * (deltaTime / 1000);
  justin.dy += justin.gravity * (deltaTime / 1000);

  if (justin.posY + justin.height > canvas.height) {
    justin.posY = canvas.height - justin.height;
    justin.dy = 0;
  }

  if (justin.posY < 0) justin.posY = 0;

  if (justin.invulTimer > 0) justin.invulTimer -= deltaTime;

  currentArea.enemy.posX -= currentArea.enemy.speed * (deltaTime / 1000);

  if (currentArea.enemy.posX + currentArea.enemy.width < 0) {
    score++;
    persistentScore++;

    currentArea.enemy.reset()
  }

  if (checkCollision(justin, currentArea.enemy) && justin.invulTimer <= 0 && justin.immortalityTime <= 0) {
    if (currentArea.enemy.hasHit) {
      currentArea.enemy.hasHit = false;
      return;
    }

    currentArea.enemy.hasHit = true;

    const damage = Math.max(20 - justin.damageReduction, 0);
    justin.health -= damage;
    justin.invulTimer = 1000;
    collisionEffectTimer = 500;

    if (justin.health <= 0) gameState = GameState.gameOver;
    console.debug('Collision! Health: ' + justin.health);
  }

  if (checkCoinCollision(coin, justin)) {
    score += 5;
    persistentScore += 5;

    coin = spawnCoin();
    console.debug('Coin collected!');
  }

  if (powerUp.duration > 0) {
    powerUp.duration -= deltaTime;

    if (checkCollision(powerUp, justin)) {
      justin.immortalityTime = 5000;
      enemyBoostTime = 4700;
      console.debug('Power-Up collected!');
    }
  }
  else {
    powerUp.timer -= deltaTime;
    if (powerUp.timer <= 0) powerUp = spawnPowerUp();
  }

  if (level >= 5) {
    flyingObstacleTimer -= deltaTime;
    if (flyingObstacleTimer <= 0) {
      flyingObstacles.push(spawnFlyingObstacle(currentArea));
      flyingObstacleTimer = Math.floor(random() * 3000) + 3000;
    }

    for (let i = flyingObstacles.length - 1; i >= 0; i--) {
      const obs = flyingObstacles[i];
      obs.posX -= obs.speed * (deltaTime / 1000);

      if (obs.posX + obs.width < 0) {
        flyingObstacles.splice(i, 1);
        continue;
      }

      if (checkCollision(justin, obs) && justin.invulTimer <= 0 && justin.immortalityTime <= 0) {
        if (!obs.hasHit) {
          const damage = Math.max(20 - justin.damageReduction, 0);
          justin.health -= damage;
          justin.invulTimer = 1000;
          collisionEffectTimer = 500;
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

function draw(deltaTime) {
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

  ctx.fillStyle = currentArea.enemy.color;
  ctx.fillStyle = 'red';
  ctx.fillRect(currentArea.enemy.posX, currentArea.enemy.posY, currentArea.enemy.width, currentArea.enemy.height);

  ctx.beginPath();
  ctx.arc(coin.posX, coin.posY, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();

  if (powerUp.timer === 0) {
    ctx.fillStyle = 'lime';
    ctx.fillRect(powerUp.posX, powerUp.posY, powerUp.width, powerUp.height);
  }

  for (const obs of flyingObstacles) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(obs.posX, obs.posY, obs.width, obs.height);
  }

  ctx.fillStyle = '#FFD700';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Level: ${level}`, 10, 60);
  ctx.fillText(`Health: ${justin.health}`, 10, 90);

  ctx.fillText(`Highscore: ${persistentScore}`, canvas.width - 200, 60);
  ctx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, canvas.width - 200, 30);

  ctx.fillStyle = dynamicTextColor;
  ctx.font = '18px Arial';
  if (justin.immortalityTime > 0) ctx.fillText('Invincible!', 10, 120);
  if (justin.damageReduction > 0) ctx.fillText('Shield: Big Boy Active', 10, 140);

  if (collisionEffectTimer > 0) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

let lastTime = performance.now();
function gameLoop(currentTime) {
  const deltaTime = Math.min(currentTime - lastTime, 100) // max 100ms
  lastTime = currentTime;

  update(deltaTime);
  draw(deltaTime);

  requestAnimationFrame(gameLoop);
}