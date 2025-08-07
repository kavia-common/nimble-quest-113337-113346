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
  // 1-1 THE GARDEN GATE XL (revamped for maximum use of space)
  {
    name: "1-1: The Garden Gate XL",
    bgColor: "#9ad0ec",
    music: null,
    objective: "Collect all gems & reach the exit in a true sprawling garden world!",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },         // Floor
      { x: 50, y: 250, w: 120, h: 18 },
      { x: 240, y: 258, w: 110, h: 20 },
      { x: 420, y: 180, w: 85, h: 16 },
      { x: 518, y: 102, w: 78, h: 15 },
      { x: 120, y: 105, w: 180, h: 14 },
      { x: 320, y: 64, w: 98, h: 13 },
      { x: 599, y: 320, w: 41, h: 25 },         // Ground bump at far end
      // Extra upper and mid platforms for more gem/enemy spread
      { x: 360, y: 145, w: 50, h: 12 },
      { x: 92, y: 180, w: 60, h: 12 },
      { x: 215, y: 98, w: 45, h: 13 },
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 640, h: 40 },
        { x: 50, y: 250, w: 120, h: 18 },
        { x: 240, y: 258, w: 110, h: 20 },
        { x: 420, y: 180, w: 85, h: 16 },
        { x: 518, y: 102, w: 78, h: 15 },
        { x: 120, y: 105, w: 180, h: 14 },
        { x: 320, y: 64, w: 98, h: 13 },
        { x: 599, y: 320, w: 41, h: 25 },
        { x: 360, y: 145, w: 50, h: 12 },
        { x: 92, y: 180, w: 60, h: 12 },
        { x: 215, y: 98, w: 45, h: 13 }
      ]),
      { x: 570, y: 320 - 13, collected: false },
      { x: 70, y: 250 - 6, collected: false }
    ],
    playerStart: { x: 36, y: 260 },
    exit: { x: 610, y: 295, w: 26, h: 45 },
    enemies: [
      { type: "walker", x: 155, y: 302, dir: 1, patrolMin: 40, patrolMax: 240, speed: 45 },
      { type: "chaser", x: 470, y: 180, speed: 65, activeRange: 170 },
      { type: "hopper", x: 129, y: 92, dir: 1, jumpCooldown: 1.08, jumpTimer: 0, jumpVy: -104 },
      { type: "projectile", x: 312, y: 51, dir: 1, cooldown: 2.1, t: 0 },
      { type: "walker", x: 475, y: 90, dir: -1, patrolMin: 400, patrolMax: 520, speed: 54 }
    ],
    extra: {},
  },

  // 1-2 OVERGROWN RUINS XL
  {
    name: "1-2: Overgrown Ruins XL",
    bgColor: "#88c070",
    music: null,
    objective: "Find all gems, dodge slimes, projectiles, and hop between crumbly ruins.",
    platforms: [
      { x: 0, y: 320, w: 200, h: 40 },
      { x: 225, y: 314, w: 130, h: 18 },
      { x: 378, y: 288, w: 98, h: 16 },
      { x: 505, y: 235, w: 113, h: 14 },
      { x: 59, y: 210, w: 68, h: 14 },
      { x: 161, y: 152, w: 126, h: 15 },
      { x: 402, y: 130, w: 180, h: 13 },
      { x: 19, y: 120, w: 51, h: 17 },
      { x: 585, y: 320, w: 55, h: 17 },
      // Extra mid+upper ruins for more gems/enemies
      { x: 278, y: 173, w: 70, h: 13 },
      { x: 501, y: 118, w: 76, h: 13 }
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 200, h: 40 },
        { x: 225, y: 314, w: 130, h: 18 },
        { x: 378, y: 288, w: 98, h: 16 },
        { x: 505, y: 235, w: 113, h: 14 },
        { x: 59, y: 210, w: 68, h: 14 },
        { x: 161, y: 152, w: 126, h: 15 },
        { x: 402, y: 130, w: 180, h: 13 },
        { x: 19, y: 120, w: 51, h: 17 },
        { x: 585, y: 320, w: 55, h: 17 },
        { x: 278, y: 173, w: 70, h: 13 },
        { x: 501, y: 118, w: 76, h: 13 }
      ], { manualGroundGems: [{ x: 610, y: 320 - 6, collected: false }] }),
      { x: 110, y: 315 - 7, collected: false },
      { x: 430, y: 293 - 6, collected: false }
    ],
    playerStart: { x: 43, y: 255 },
    exit: { x: 620, y: 235, w: 18, h: 61 },
    enemies: [
      { type: "walker", x: 295, y: 300, dir: -1, patrolMin: 190, patrolMax: 360, speed: 68 },
      { type: "hopper", x: 155, y: 133, dir: 1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -161 },
      { type: "projectile", x: 44, y: 102, dir: 1, cooldown: 2.1, t: 0 },
      { type: "chaser", x: 585, y: 145, speed: 66, activeRange: 220 },
      { type: "hopper", x: 235, y: 154, dir: 1, jumpCooldown: 1.19, jumpTimer: 0, jumpVy: -110 },
      { type: "walker", x: 367, y: 287, dir: -1, patrolMin: 355, patrolMax: 435, speed: 62 }
    ],
    extra: {},
  },

  // 1-3 THE OLD WALLS XL
  {
    name: "1-3: The Old Walls XL",
    bgColor: "#707083",
    music: null,
    objective: "Four enemy types prowl these ruined platforms, requiring acrobatic play.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 45, y: 234, w: 69, h: 15 },
      { x: 220, y: 212, w: 106, h: 15 },
      { x: 393, y: 165, w: 120, h: 12 },
      { x: 89, y: 98, w: 112, h: 13 },
      { x: 540, y: 105, w: 72, h: 12 },
      { x: 320, y: 58, w: 68, h: 13 },    // Top middle
      { x: 599, y: 320, w: 37, h: 28 },   // Right bump
      // Add narrow ledges for more spread
      { x: 155, y: 155, w: 32, h: 10 },
      { x: 470, y: 140, w: 40, h: 8 }
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 640, h: 40 },
        { x: 45, y: 234, w: 69, h: 15 },
        { x: 220, y: 212, w: 106, h: 15 },
        { x: 393, y: 165, w: 120, h: 12 },
        { x: 89, y: 98, w: 112, h: 13 },
        { x: 540, y: 105, w: 72, h: 12 },
        { x: 320, y: 58, w: 68, h: 13 },
        { x: 599, y: 320, w: 37, h: 28 },
        { x: 155, y: 155, w: 32, h: 10 },
        { x: 470, y: 140, w: 40, h: 8 }
      ]),
      { x: 245, y: 292 - 4, collected: false },
      { x: 420, y: 164 - 6, collected: false }
    ],
    playerStart: { x: 56, y: 195 },
    exit: { x: 620, y: 290, w: 19, h: 44 },
    enemies: [
      { type: "walker", x: 120, y: 310, dir: 1, patrolMin: 60, patrolMax: 210, speed: 52 },
      { type: "hopper", x: 460, y: 152, dir: -1, jumpCooldown: 1.2, jumpTimer: 0, jumpVy: -176 },
      { type: "chaser", x: 162, y: 85, speed: 70, activeRange: 200 },
      { type: "projectile", x: 562, y: 96, dir: -1, cooldown: 2.65, t: 0 },
      { type: "walker", x: 376, y: 167, dir: 1, patrolMin: 365, patrolMax: 430, speed: 48 },
      { type: "hopper", x: 215, y: 107, dir: -1, jumpCooldown: 1.29, jumpTimer: 0, jumpVy: -92 }
    ],
    extra: {},
  },

  // 2-1 MOLTEN CAVES (NEW)
  {
    name: "2-1: Molten Caves",
    bgColor: "#772828",
    music: null,
    objective: "Hot floor! Time jumps between geysers and falling blocks.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 80, y: 245, w: 85, h: 14 },
      { x: 240, y: 270, w: 130, h: 14 },
      { x: 440, y: 190, w: 120, h: 12 },
      { x: 175, y: 159, w: 56, h: 10 },
      { x: 520, y: 82, w: 104, h: 13 },
      { x: 312, y: 92, w: 61, h: 12 },
      { x: 120, y: 60, w: 65, h: 10 },
      // Additional dangerous platforms for more gems and enemy spawns
      { x: 350, y: 230, w: 40, h: 10 },
      { x: 508, y: 122, w: 55, h: 11 }
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 640, h: 38 },
        { x: 80, y: 245, w: 85, h: 14 },
        { x: 240, y: 270, w: 130, h: 14 },
        { x: 440, y: 190, w: 120, h: 12 },
        { x: 175, y: 159, w: 56, h: 10 },
        { x: 520, y: 82, w: 104, h: 13 },
        { x: 312, y: 92, w: 61, h: 12 },
        { x: 120, y: 60, w: 65, h: 10 },
        { x: 350, y: 230, w: 40, h: 10 },
        { x: 508, y: 122, w: 55, h: 11 }
      ]),
      { x: 415, y: 195 - 7, collected: false },
      { x: 600, y: 320 - 10, collected: false }
    ],
    playerStart: { x: 22, y: 256 },
    exit: { x: 622, y: 78, w: 18, h: 48 },
    enemies: [
      { type: "walker", x: 96, y: 305, dir: 1, patrolMin: 64, patrolMax: 210, speed: 66 },
      { type: "hopper", x: 355, y: 255, dir: -1, jumpCooldown: 1.20, jumpTimer: 0, jumpVy: -107 },
      { type: "chaser", x: 418, y: 175, speed: 55, activeRange: 150 },
      { type: "projectile", x: 510, y: 170, dir: -1, cooldown: 1.85, t: 0 },
      { type: "projectile", x: 550, y: 92, dir: -1, cooldown: 1.92, t: 0 },
      { type: "hopper", x: 387, y: 220, dir: 1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -140 }
    ],
    extra: {},
  },

  // 2-2 FROSTBOUND SPIRES (NEW)
  {
    name: "2-2: Frostbound Spires",
    bgColor: "#90d6ff",
    music: null,
    objective: "Slippery ledges, tall towers. Ride the wind to hidden gems!",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 97, y: 242, w: 42, h: 19 },
      { x: 170, y: 192, w: 45, h: 18 },
      { x: 280, y: 150, w: 80, h: 20 },
      { x: 555, y: 200, w: 60, h: 24 },
      { x: 420, y: 105, w: 70, h: 18 },
      { x: 65, y: 104, w: 66, h: 18 },
      { x: 320, y: 60, w: 68, h: 14 },
      // More towers/ledges for variety
      { x: 200, y: 89, w: 36, h: 14 },
      { x: 500, y: 56, w: 62, h: 10 }
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 640, h: 38 },
        { x: 97, y: 242, w: 42, h: 19 },
        { x: 170, y: 192, w: 45, h: 18 },
        { x: 280, y: 150, w: 80, h: 20 },
        { x: 555, y: 200, w: 60, h: 24 },
        { x: 420, y: 105, w: 70, h: 18 },
        { x: 65, y: 104, w: 66, h: 18 },
        { x: 320, y: 60, w: 68, h: 14 },
        { x: 200, y: 89, w: 36, h: 14 },
        { x: 500, y: 56, w: 62, h: 10 }
      ], { manualGroundGems: [{ x: 10, y: 320 - 6, collected: false }, { x: 630, y: 320 - 6, collected: false }] }),
      { x: 480, y: 110 - 8, collected: false },
      { x: 372, y: 60 - 8, collected: false }
    ],
    playerStart: { x: 45, y: 275 },
    exit: { x: 24, y: 63, w: 18, h: 47 },
    enemies: [
      { type: "walker", x: 312, y: 305, dir: -1, patrolMin: 200, patrolMax: 390, speed: 74 },
      { type: "hopper", x: 278, y: 133, dir: -1, jumpCooldown: 1.33, jumpTimer: 0, jumpVy: -115 },
      { type: "chaser", x: 555, y: 185, speed: 82, activeRange: 210 },
      { type: "projectile", x: 121, y: 92, dir: 1, cooldown: 1.26, t: 0 },
      { type: "chaser", x: 585, y: 65, speed: 65, activeRange: 65 },
      { type: "hopper", x: 201, y: 76, dir: 1, jumpCooldown: 1.12, jumpTimer: 0, jumpVy: -110 }
    ],
    extra: {},
  },

  // 2-3 CRYSTAL MIDNIGHT (NEW) - vertical challenge
  {
    name: "2-3: Crystal Midnight",
    bgColor: "#343355",
    music: null,
    objective: "Ascend the darkness! Hidden platforms shimmer with gems.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 120, y: 280, w: 94, h: 9 },
      { x: 330, y: 250, w: 80, h: 9 },
      { x: 520, y: 214, w: 97, h: 10 },
      { x: 390, y: 165, w: 70, h: 11 },
      { x: 170, y: 125, w: 120, h: 11 },
      { x: 64, y: 80, w: 66, h: 10 },
      { x: 285, y: 48, w: 70, h: 11 },
      // Additional ledges and platforms to allow added gems/enemy spread
      { x: 230, y: 175, w: 44, h: 10 },
      { x: 410, y: 90, w: 60, h: 8 }
    ],
    gems: [
      ...gemsForPlatforms([
        { x: 0, y: 320, w: 640, h: 40 },
        { x: 120, y: 280, w: 94, h: 9 },
        { x: 330, y: 250, w: 80, h: 9 },
        { x: 520, y: 214, w: 97, h: 10 },
        { x: 390, y: 165, w: 70, h: 11 },
        { x: 170, y: 125, w: 120, h: 11 },
        { x: 64, y: 80, w: 66, h: 10 },
        { x: 285, y: 48, w: 70, h: 11 },
        { x: 230, y: 175, w: 44, h: 10 },
        { x: 410, y: 90, w: 60, h: 8 }
      ]),
      { x: 190, y: 130 - 8, collected: false },
      { x: 620, y: 94 - 9, collected: false }
    ],
    playerStart: { x: 24, y: 270 },
    exit: { x: 622, y: 39, w: 16, h: 49 },
    enemies: [
      { type: "walker", x: 170, y: 315, dir: 1, patrolMin: 124, patrolMax: 290, speed: 66 },
      { type: "chaser", x: 512, y: 204, speed: 60, activeRange: 150 },
      { type: "projectile", x: 335, y: 233, dir: 1, cooldown: 1.87, t: 0 },
      { type: "hopper", x: 336, y: 36, dir: 1, jumpCooldown: 1.45, jumpTimer: 0, jumpVy: -120 },
      { type: "walker", x: 403, y: 97, dir: 1, patrolMin: 410, patrolMax: 520, speed: 52 },
      { type: "chaser", x: 190, y: 66, speed: 60, activeRange: 80 }
    ],
    extra: {},
  }
];

export default LEVELS;
