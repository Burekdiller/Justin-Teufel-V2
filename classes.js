/* eslint-disable @typescript-eslint/no-magic-numbers */
export class Area {
  name; background; gravity; enemy;

  /**
   * @param {import('./types/classes').AreaOptions[0]}name
   * @param {import('./types/classes').AreaOptions[1]}background
   * @param {import('./types/classes').AreaOptions[2]}gravity
   * @param {import('./types/classes').AreaOptions[3]}enemy*/
  constructor(name, background, gravity, enemy) {
    this.name = name;
    this.background = background;
    this.gravity = gravity;
    this.enemy = enemy;
  }
}

export class Entity {
  color; baseSpeed; width; height; speed; posX; posY; posZ;
  hasHit;

  /** @param {import('./types/classes').EntityOptions} options */
  constructor({
    color, baseSpeed, width, height,
    posX, posY, posZ
  }) {
    this.color = color;
    this.baseSpeed = baseSpeed;
    this.width = width;
    this.height = height;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.dy = 0;

    this.speed = baseSpeed;
    this.hasHit = false;
  }

  reset() {
    this.speed = this.baseSpeed;

    this.posX = canvas.width;

    /* this.posY = 0;
       this.posZ = 0; */

    this.hasHit = false;
  }

  isOnGround() {
    return this.dy === 0;
  }
}

export class Player extends Entity {
  jumpStrength; gravity; maxHealth; health;
  immortalityTime; damageReduction; invulTimer; dashTime; dashCooldown;

  /** @param {import('./types/classes').EntityOptions & import('./types/classes').PlayerOptions} options */
  constructor({ jumpStrength, gravity, maxHealth, ...entityArgs }) {
    super(entityArgs);

    this.jumpStrength = jumpStrength;
    this.gravity = gravity;
    this.maxHealth = maxHealth;

    this.immortalityTime = 0;
    this.damageReduction = 0;
    this.invulTimer = 0;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.health = maxHealth;
  }

  resetPosition() {
    this.posX = 100;
    this.posY = 500;
    this.posZ = 0;
  }

  reset() {
    super.reset();

    this.resetPosition();

    this.health = this.maxHealth; // TODO: Does this allow keeping max HP over games?

    this.immortalityTime = 0;
    this.damageReduction = 0;
    this.invulTimer = 0;
    this.dashTime = 0;
    this.dashCooldown = 0;
  }
}

export class Collectible {
  posX; posY;

  /** @param {import('./types/classes').CollectibleOptions}options */
  constructor({ posX, posY }) {
    this.posX = posX;
    this.posY = posY;
  }
}

export class Coin extends Collectible {
  radius;

  /** @param {{radius: import('./types/classes').Coin['radius']} & import('./types/classes').CollectibleOptions}options */
  constructor({ radius, ...collectibleArgs }) {
    super(collectibleArgs);

    this.radius = radius;
  }
}

/** Power-up: When picked up, grants invincibility for 300 frames and enemy boost for 282 frames. */
export class PowerUp extends Collectible {
  width; height; duration; timer;

  /** @param {{width: number, height: number, duration: number, timer: number} & import('./types/classes').CollectibleOptions}options */
  constructor({ width, height, duration, timer, ...collectibleArgs }) {
    super(collectibleArgs);

    this.width = width;
    this.height = height;
    this.duration = duration;
    this.timer = timer;
  }
}

/** @type {import('./types/classes').GameState} */
export const GameState = Object.freeze(Object.fromEntries(
  ['playing', 'shop', 'gameOver'].map(e => [e, Symbol(e)])
));