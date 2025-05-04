declare global {
  const canvas: HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D;

  /** Array of areas (from easiest to hardest) */
  const areas: Game.Area[];

  /** Endlevel: Black Hole when persistentScore >= 666 */
  const blackHole: Game.Area;

  let testingMode: boolean;
  let score: number;
  let persistentScore: number;
  let level: number;
  let gameState: Game.GameState;

  namespace Game {
  class Area {
    name: string;
    background: `#${string}`;
    gravity: number;
    enemy: Entity;

    constructor(
      name: Area['name'],
      background: Area['background'],
      gravity: Area['gravity'],
      enemy: Area['enemy']
    );
  }

  interface EntityOptions {
    color: Entity['color'];
    baseSpeed: Entity['baseSpeed'];
    width: Entity['width'];
    height: Entity['height'];
    posX: Entity['posX'];
    posY: Entity['posY'];
    posZ: Entity['posZ'];
  }

  class Entity {
    color: string;
    baseSpeed: number;
    speed: number;
    width: number;
    height: number;
    posX: number;
    posY: number;
    posZ: number;
    dy: number;

    hasHit: boolean;

    constructor(options: EntityOptions);

    reset(): void;

    isOnGround(): boolean;
  }

  class Player extends Entity {
    jumpStrength: number;
    gravity: number;
    maxHealth: number;
    health: number;

    immortalityTime: number;
    damageReduction: number;
    invulTimer: number;
    dashTime: number;
    dashCooldown: number;

    constructor(options: EntityOptions & {
      jumpStrength: Player['jumpStrength'];
      gravity: Player['gravity'];
      maxHealth: Player['maxHealth'];
    });

    resetPosition(): void;
  }

  interface CollectibleOptions {
    posX: Collectible['posX'];
    posY: Collectible['posY'];
  }

  class Collectible {
    posX: number;
    posY: number;

    constructor(args: CollectibleOptions);
  }

  class Coin extends Collectible {
    radius: number;

    constructor(options: CollectibleOptions & {
      radius: Coin['radius'];
    });
  }

  class PowerUp extends Collectible {
    width: number;
    height: number;
    duration: number;
    timer: number;

    constructor(options: CollectibleOptions & {
      width: PowerUp['width'];
      height: PowerUp['height'];
      duration: PowerUp['duration'];
      timer: PowerUp['timer'];
    });
  }

  enum GameState {
    playing = 'playing',
    shop = 'shop',
    gameOver = 'gameOver'
  }

  /** Returns a contrast color ('white' or 'black') for a given hex background. */
  function getContrastColor(hex: `#${string}`): 'black' | 'white';
  function getCurrentArea(): Area;
  function spawnFlyingObstacle(currentArea: Area): Entity;
  function spawnCoin(): Collectible;
  function checkCollision(rect1: CanvasRect | Entity, rect2: CanvasRect | Entity): boolean;
  function checkCoinCollision(coin: Collectible, player: Player): boolean;
  function drawWeather(currentArea: Area): void;
  function restartGame(): void;
}
}

export {};