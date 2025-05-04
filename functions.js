/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-null */

import { Entity, GameState, Coin, PowerUp } from './classes';

/** Same result as random(), but secure. */
export const random = () => globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

/** @type {Game['getContrastColor']} */
export function getContrastColor(hex) {
  /* eslint-disable-next-line id-length */
  const [r, g, b] = hex.match(/\d{2}/g).map(e => Number.parseInt(e, 16));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}

/** @type {Game['getCurrentArea']} */
export function getCurrentArea() {
  if (persistentScore >= 666) return blackHole;

  const planetIndex = Math.min(Math.floor(persistentScore / 60), areas.length - 1);
  return areas[planetIndex];
}

// We'll also add a 'hasHit' flag for flying obstacles when they spawn.
/** @type {Game['spawnFlyingObstacle']} */
export function spawnFlyingObstacle(currentArea) {
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
export const spawnCoin = () => new Coin({
  posX: random() * (canvas.width - 20) + 10,
  posY: random() * (canvas.height - 100) + 10,
  radius: 10
});

export const spawnPowerUp = () => new PowerUp({
  posX: random() * (canvas.width - 30) + 15,
  posY: random() * (canvas.height / 3) + (canvas.height * 2 / 3 - 50),
  width: 20, height: 20, duration: 600,
  timer: Math.floor(random() * 700) + 800 // 800 to 1500 frames
});

/** @type {Game['checkCollision']} */
export function checkCollision(rect1, rect2) {
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
export function checkCoinCollision(coin, player) {
  const dx = coin.posX - (player.posX + player.width / 2);
  const dy = coin.posY - (player.posY + player.height / 2);

  return Math.hypot(dx, dy) < coin.radius + Math.min(player.width, player.height) / 4;
}

/** @type {Game['drawWeather']} */
export function drawWeather(currentArea) {
  const numDrops = 30;

  for (let i = 0; i < numDrops; i++) {
    const dropX = random() * canvas.width;
    const dropY = random() * canvas.height;

    const length = random() * 15 + 5;
    if (currentArea.name === 'Sun')
      ctx.strokeStyle = 'rgba(255, 69, 0, 0.5)';
    else if (['Venus', 'Earth', 'Mars'].includes(currentArea.name))
      ctx.strokeStyle = 'rgba(173, 216, 230, 0.5)';
    else
      continue;

    ctx.beginPath();
    ctx.moveTo(dropX, dropY);
    ctx.lineTo(dropX, dropY + length);
    ctx.stroke();
  }
}

/** @type {Game['restartGame']} */
export function restartGame() {
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