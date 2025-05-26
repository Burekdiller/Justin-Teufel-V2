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
  color; baseSpeed; gravity; width; height; speed; posX; posY; posZ;
  startPosX; startPosY; startPosZ; hasHit;

  /** @param {import('./types/classes').EntityOptions} options */
  constructor({
    color, baseSpeed, width = 50, height = 45,
    posX = canvas.width, posY = canvas.height - height * 2, posZ = 0
  }) {
    this.color = color;
    this.baseSpeed = baseSpeed;
    this.width = width;
    this.height = height;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.gravity = 0;
    this.dy = this.gravity;

    this.speed = baseSpeed;
    this.hasHit = false;

    this.startPosX = posX;
    this.startPosY = posY;
    this.startPosZ = posZ
  }

  reset() {
    this.speed = this.baseSpeed;

    this.posX = this.startPosX;
    this.posY = this.startPosY;
    this.posZ = this.startPosZ;

    this.hasHit = false;
  }

  isOnGround() {
    return this.dy === 0 || this.dy == this.gravity;
  }

  jump() {
    if (this.isOnGround()) this.dy += this.jumpStrength;
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

  reset() {
    super.reset();

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