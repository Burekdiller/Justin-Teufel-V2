export class Area {
  name; background; gravity; enemy;

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

  /** @type {Game.Entity['constructor']} */
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
    // this.posY = 0;
    // this.posZ = 0;

    this.hasHit = false;
  }

  isOnGround() {
    return this.dy === 0;
  }
}

export class Player extends Entity {
  jumpStrength; gravity; maxHealth; health;
  immortalityTime; damageReduction; invulTimer; dashTime; dashCooldown;

  /** @type {Game.Player['constructor']} */
  constructor({
    jumpStrength, gravity, maxHealth, ...entityArgs
  }) {
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

    this.posX = 100;
    this.posZ = 500;

    this.health = this.maxHealth; // TODO: Does this allow keeping max HP over games?

    this.immortalityTime = 0;
    this.damageReduction = 0;
    this.invulTimer = 0;
    this.dashTime = 0;
    this.dashCooldown = 0;
  }
}

export class Collectible {
  name; radius; posX; posY;

  /** @type {Game.Collectible['constructor']} */
  constructor(name, radius, posX, posY) {
    this.name = name;
    this.radius = radius;
    this.posX = posX;
    this.posY = posY;
  }
}

/** @type {typeof Game.GameState} */
export const GameState = Object.freeze(
  ['playing', 'shop', 'gameOver']
    .reduce((acc, e) => ({ ...acc, [e]: Symbol(e) }), {})
);