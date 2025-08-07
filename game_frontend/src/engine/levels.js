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
      { type: "walker", x: 175, y: 151, dir: 1 }
    ],
    extra: {}
  },
  {
    name: "1-2: Overgrown Ruins",
    bgColor: "#88c070",
    music: null,
    objective: "Find all gems, dodge two patrolling slimes, reach the gold door",
    platforms: [
      { x: 0, y: 160, w: 170, h: 20 },
      { x: 200, y: 145, w: 80, h: 10 },
      { x: 270, y: 110, w: 35, h: 10 },
      { x: 70, y: 110, w: 40, h: 10 },
    ],
    gems: [
      { x: 78, y: 98, collected: false },
      { x: 280, y: 98, collected: false },
      { x: 260, y: 135, collected: false }
    ],
    exit: { x: 300, y: 90, w: 12, h: 20 },
    enemies: [
      { type: "walker", x: 220, y: 151, dir: -1 },
      { type: "hopper", x: 90, y: 103, dir: 1 }
    ],
    extra: {}
  }
];

export default LEVELS;
