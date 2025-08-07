//
// levels.js - Defines levels, layouts, and entity placement for platformer
//
// Each level contains: platforms, gem locations, exit, enemies, background info, and meta objectives.
//
// PUBLIC_INTERFACE: LEVELS (Array of Level objects)

 /**
  * Returns gem positions for any level - one gem per platform (except ground),
  * All gems spawn ON TOP of solid platforms, never below or inside rubble.
  * If a platform is "ground" (almost as wide as the world), only place gems at
  * special hand-picked locations.
  */
function gemsForPlatforms(platforms, opts = {}) {
  // Platforms sorted by y: low numbers are higher up
  const groundY = Math.max(...platforms.map(pl => pl.y));
  // Identify ground platforms: those whose bottom edge is at groundY
  const isGround = pl => pl.y >= groundY - 2 && pl.h >= 12 && pl.w > 150;
  // Place NO gems inside ground except if marked as special segment.
  // For other platforms: center one gem exactly on platform top center.
  let gems = [];
  platforms.forEach((pl) => {
    if (!isGround(pl)) {
      gems.push({
        x: pl.x + pl.w / 2,
        y: pl.y - 6, // Gem "radius" is 6, sits flush on top
        collected: false
      });
    }
  });
  // For select levels, allow manual override for gems-on-ground (e.g. edge segments etc).
  if (opts.manualGroundGems) {
    for (const g of opts.manualGroundGems) gems.push(g);
  }
  return gems;
}

// PUBLIC_INTERFACE: Array of Level objects
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
    gems: gemsForPlatforms(
      [
        { x: 0, y: 320, w: 640, h: 40 },
        { x: 175, y: 270, w: 84, h: 16 },
        { x: 390, y: 205, w: 70, h: 16 },
        { x: 440, y: 320, w: 90, h: 20 },
        { x: 75, y: 210, w: 48, h: 12 },
        { x: 560, y: 280, w: 40, h: 8 }
      ]
      // No manual ground gems
    ),
    exit: { x: 601, y: 290, w: 24, h: 40 },
    enemies: [
      { type: "walker", x: 355, y: 305, dir: 1, patrolMin: 180, patrolMax: 470, speed: 65 },
      { type: "chaser", x: 82, y: 305, speed: 71, activeRange: 180 }
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
    gems: gemsForPlatforms(
      [
        { x: 0, y: 320, w: 370, h: 40 },
        { x: 420, y: 270, w: 160, h: 20 },
        { x: 540, y: 220, w: 70, h: 16 },
        { x: 149, y: 215, w: 80, h: 17 },
        { x: 260, y: 170, w: 50, h: 16 },
        { x: 28, y: 160, w: 41, h: 18 },
        { x: 600, y: 100, w: 34, h: 12 }
      ],
      {
        // Add a manual ground gem at far right of ground segment
        manualGroundGems: [
          { x: 610 + 15, y: 320 - 6, collected: false }
        ]
      }
    ),
    exit: { x: 610, y: 95, w: 22, h: 40 },
    enemies: [
      { type: "walker", x: 438, y: 295, dir: -1, patrolMin: 370, patrolMax: 590, speed: 68 },
      { type: "hopper", x: 190, y: 200, dir: 1, jumpCooldown: 1.3, jumpTimer: 0, jumpVy: -195 },
      { type: "projectile", x: 38, y: 143, dir: 1, cooldown: 2.3, t: 0 },
      { type: "chaser", x: 597, y: 123, speed: 82, activeRange: 210 }
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
    gems: gemsForPlatforms(
      [
        { x: 0, y: 320, w: 640, h: 40 },
        { x: 85, y: 260, w: 76, h: 22 },
        { x: 300, y: 256, w: 180, h: 22 },
        { x: 536, y: 228, w: 95, h: 22 },
        { x: 370, y: 180, w: 51, h: 16 },
        { x: 110, y: 156, w: 62, h: 16 }
      ]
      // No manual ground gems
    ),
    exit: { x: 25, y: 285, w: 24, h: 38 },
    enemies: [
      { type: "walker", x: 474, y: 305, dir: -1, patrolMin: 95, patrolMax: 520, speed: 74 },
      { type: "hopper", x: 260, y: 240, dir: 1, jumpCooldown: 1.3, jumpTimer: 0, jumpVy: -212 },
      { type: "chaser", x: 135, y: 145, speed: 73, activeRange: 250 },
      { type: "projectile", x: 570, y: 215, dir: -1, cooldown: 2.8, t: 0 }
    ],
    extra: {}
  }
];

export default LEVELS;
