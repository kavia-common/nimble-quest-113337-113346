//
// levels.js - Defines levels, layouts, and entity placement for platformer
//
// Each level contains: platforms, gem locations, exit, enemies, background info, and meta objectives.
//

/**
 * @typedef {Object} Level
 * @property {string} name - Level display label
 * @property {Array} platforms - [{x, y, w, h}]
 * @property {Array} gems - [{x, y, collected: false}]
 * @property {Object} exit - {x, y, w, h}
 * @property {Array} enemies - [{type, x, y, ...}]
 * @property {string} bgColor - background color hex or null
 * @property {string} [music] - music key/filename (optional)
 * @property {string} [objective] - short description of win condition
 * @property {Object} [extra] - any extra per-level
 */

// Sample level data array - grows as new levels/worlds are added
// Positions are in virtual (320x180) pixel-art canvas units

const LEVELS = [
  {
    name: "1-1: The Garden Gate",
    bgColor: "#9ad0ec",
    music: null,
    objective: "Collect all gems & reach the exit",
    platforms: [
      // ground
      { x: 0, y: 160, w: 320, h: 20 },
      // block
      { x: 100, y: 124, w: 32, h: 10 },
      { x: 195, y: 105, w: 22, h: 10 },
      { x: 220, y: 90, w: 22, h: 10 },
    ],
    gems: [
      { x: 110, y: 112, collected: false },
      { x: 202, y: 95, collected: false },
    ],
    exit: { x: 292, y: 140, w: 12, h: 20 },
    enemies: [
      { type: "walker", x: 175, y: 151, dir: 1, patrolMin: 175, patrolMax: 270, speed: 35 },
      { type: "chaser", x: 45, y: 151, speed: 42, activeRange: 80 },
    ],
    extra: {}
  },
  {
    name: "1-2: Overgrown Ruins",
    bgColor: "#88c070",
    music: null,
    objective: "Find all gems, dodge slimes and projectiles, reach the gold door",
    platforms: [
      { x: 0, y: 160, w: 170, h: 20 },
      { x: 200, y: 145, w: 80, h: 10 },
      { x: 270, y: 110, w: 35, h: 10 },
      { x: 70, y: 110, w: 40, h: 10 },
      { x: 130, y: 85, w: 25, h: 10 }, // platform for jumping enemy
      { x: 14, y: 83, w: 20, h: 10 }, // platform for projectile enemy
    ],
    gems: [
      { x: 78, y: 98, collected: false },
      { x: 280, y: 98, collected: false },
      { x: 260, y: 135, collected: false }
    ],
    exit: { x: 300, y: 90, w: 12, h: 20 },
    enemies: [
      { type: "walker", x: 220, y: 151, dir: -1, patrolMin: 120, patrolMax: 260, speed: 37 },
      { type: "hopper", x: 90, y: 103, dir: 1, jumpCooldown: 1.3, jumpTimer: 0, jumpVy: -105 }, // classic frog enemy
      { type: "projectile", x: 24, y: 76, dir: 1, cooldown: 2.5, t: 0 }, // shoots at intervals
      { type: "chaser", x: 150, y: 77, speed: 56, activeRange: 120 },
    ],
    extra: {}
  },
  {
    name: "1-3: The Old Walls",
    bgColor: "#707083",
    music: null,
    objective: "Beware: all four enemy types patrol these ruins.",
    platforms: [
      { x: 0, y: 160, w: 320, h: 20 },
      { x: 60, y: 130, w: 38, h: 10 },
      { x: 150, y: 128, w: 90, h: 10 },
      { x: 268, y: 114, w: 46, h: 10 },
      { x: 180, y: 90, w: 25, h: 10 },
      { x: 55, y: 82, w: 30, h: 10 }
    ],
    gems: [
      { x: 170, y: 116, collected: false },
      { x: 212, y: 80, collected: false },
      { x: 293, y: 106, collected: false }
    ],
    exit: { x: 10, y: 140, w: 12, h: 20 },
    enemies: [
      { type: "walker", x: 290, y: 151, dir: -1, patrolMin: 35, patrolMax: 292, speed: 38 },
      { type: "hopper", x: 134, y: 118, dir: 1, jumpCooldown: 1.0, jumpTimer: 0, jumpVy: -125 },
      { type: "chaser", x: 65, y: 71, speed: 40, activeRange: 140 },
      { type: "projectile", x: 240, y: 123, dir: -1, cooldown: 3.5, t: 0 }
    ],
    extra: {}
  }
];

export default LEVELS;
