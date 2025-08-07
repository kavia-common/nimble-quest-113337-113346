//
// Enemy.js - Enemy AI and entity logic for platformer enemies.
// Modernizes and centralizes slime (walker), hopper, chaser, and projectile enemy movement/AI
//

/**
 * Enemy class for simple patrol (walker) "slime" enemies.
 * Support for future: chaser, hopper, projectile
 * Handles autonomous AI state and update per-tick.
 */

// PUBLIC_INTERFACE
export class WalkerSlime {
  /**
   * Classic platformer "slime": horizontal patrols between patrolMin/patrolMax, turns when hitting boundary.
   * @param {object} opts { x, y, dir, patrolMin, patrolMax, speed }
   */
  constructor(opts = {}) {
    this.x = opts.x ?? 0;
    this.y = opts.y ?? 0;
    this.type = "walker";
    this.dir = opts.dir ?? 1; // 1: right, -1: left
    this.patrolMin = opts.patrolMin ?? 0;
    this.patrolMax = opts.patrolMax ?? 320 - 14; // Assume 14px wide sprite
    this.speed = opts.speed ?? 36;
    // For future: state
  }

  // PUBLIC_INTERFACE
  /**
   * Update the slime's patrol movement for this frame.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    this.x += this.dir * this.speed * dt;
    // Clamp x to patrol range
    if (this.x < this.patrolMin) {
      this.x = this.patrolMin;
      this.dir = 1;
    } else if (this.x > this.patrolMax) {
      this.x = this.patrolMax;
      this.dir = -1;
    }
  }
}

//
// (Stub for future AI: Hopper, Chaser, Projectile)
//

/**
 * Factory for creating the appropriate AI object for a given enemy type
 * @param {object} data - Enemy object from level definition
 */
export function createEnemyInstance(data) {
  if (data.type === "walker") return new WalkerSlime(data);
  // TODO: support for hopper, chaser etc.
  return { ...data };
}

// PUBLIC_INTERFACE
/**
 * Top-level tick update for all enemies in a level (to be called from GameEngine).
 * @param {Array<object>} enemiesState - Array of live enemy objects
 * @param {number} dt - Delta time per tick (seconds)
 * Modifies the objects in-place if they have an update() method.
 */
export function updateEnemies(enemiesState, dt) {
  for (let enemy of enemiesState) {
    if (typeof enemy.update === "function") {
      enemy.update(dt);
    }
    // else: legacy format, state mutation happens elsewhere
  }
}
