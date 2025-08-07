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
    name: "1-1: The Garden Gate XL",
    bgColor: "#9ad0ec",
    music: null,
    objective: "Collect all gems & reach the exit in the much larger world!",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 175, y: 270, w: 84, h: 16 },
      { x: 390, y: 205, w: 70, h: 16 },
      { x: 440, y: 320, w: 90, h: 20 },
      { x: 75, y: 210, w: 48, h: 12 },
      { x: 560, y: 280, w: 40, h: 8 }
    ],
    gems: [
      { x: 78, y: 180, collected: false },
      { x: 228, y: 210, collected: false },
      { x: 480, y: 330, collected: false },
      { x: 580, y: 245, collected: false }
    ],
    exit: { x: 601, y: 290, w: 24, h: 40 },
    enemies: [
      // Patrolling walker
      { type: "walker", x: 355, y: 305, dir: 1, patrolMin: 180, patrolMax: 470, speed: 65 },
      // Chaser (pursues in range)
      { type: "chaser", x: 82, y: 305, speed: 71, activeRange: 180 },
    ],
    extra: {}
  },
  {
    name: "1-2: Overgrown Ruins XL",
    bgColor: "#88c070",
    music: null,
    objective: "Find all gems, dodge slimes and projectiles, reach the gold door.",
    platforms: [
      { x: 0, y: 320, w: 370, h: 40 },
      { x: 420, y: 270, w: 160, h: 20 },
      { x: 540, y: 220, w: 70, h: 16 },
      { x: 149, y: 215, w: 80, h: 17 },
      { x: 260, y: 170, w: 50, h: 16 },
      { x: 28, y: 160, w: 41, h: 18 },
      { x: 600, y: 100, w: 34, h: 12 }
    ],
    gems: [
      { x: 156, y: 193, collected: false },
      { x: 553, y: 200, collected: false },
      { x: 610, y: 330, collected: false },
      { x: 325, y: 290, collected: false }
    ],
    exit: { x: 610, y: 95, w: 22, h: 40 },
    enemies: [
      // Patrolling walker
      { type: "walker", x: 438, y: 295, dir: -1, patrolMin: 370, patrolMax: 590, speed: 68 },
      // Jumping enemy (hops left/right on platform)
      { type: "hopper", x: 190, y: 200, dir: 1, jumpCooldown: 1.3, jumpTimer: 0, jumpVy: -195 },
      // Projectile thrower (left side)
      { type: "projectile", x: 38, y: 143, dir: 1, cooldown: 2.3, t: 0 },
      // Chaser (upper right)
      { type: "chaser", x: 597, y: 123, speed: 82, activeRange: 210 },
    ],
    extra: {}
  },
  {
    name: "1-3: The Old Walls XL",
    bgColor: "#707083",
    music: null,
    objective: "All four enemy types prowl these expanded ruins.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 85, y: 260, w: 76, h: 22 },
      { x: 300, y: 256, w: 180, h: 22 },
      { x: 536, y: 228, w: 95, h: 22 },
      { x: 370, y: 180, w: 51, h: 16 },
      { x: 110, y: 156, w: 62, h: 16 }
    ],
    gems: [
      { x: 340, y: 220, collected: false },
      { x: 460, y: 166, collected: false },
      { x: 580, y: 206, collected: false },
      { x: 100, y: 226, collected: false }
    ],
    exit: { x: 25, y: 285, w: 24, h: 38 },
    enemies: [
      // Patroller
      { type: "walker", x: 474, y: 305, dir: -1, patrolMin: 95, patrolMax: 520, speed: 74 },
      // Jumping enemy, mid floating platform
      { type: "hopper", x: 260, y: 240, dir: 1, jumpCooldown: 1.3, jumpTimer: 0, jumpVy: -212 },
      // Chaser, high left
      { type: "chaser", x: 135, y: 145, speed: 73, activeRange: 250 },
      // Projectile thrower
      { type: "projectile", x: 570, y: 215, dir: -1, cooldown: 2.8, t: 0 }
    ],
    extra: {}
  }
];

export default LEVELS;
