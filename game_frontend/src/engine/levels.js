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

const LEVELS = [
  // 1-1 THE GARDEN GATE XL - TUNED: All platforms now within triple jump reach (max ~135px per jump, so <390 total)
  {
    name: "1-1: The Garden Gate XL",
    bgColor: "#9ad0ec",
    music: null,
    objective: "Collect fewer gems, avoid a walker and slow hopper.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 50, y: 230, w: 120, h: 18 },      // Lowered from y:250 → y:230
      { x: 420, y: 160, w: 85, h: 16 },      // Lowered from y:180 → y:160
      { x: 120, y: 105, w: 180, h: 14 },     // No change (still within reach)
      { x: 599, y: 320, w: 41, h: 25 }
    ],
    gems: [
      { x: 120, y: 230 - 6, collected: false },
      { x: 450, y: 160 - 6, collected: false },
      { x: 210, y: 105 - 6, collected: false },
      { x: 610, y: 320 - 12, collected: false },
      { x: 90, y: 320 - 12, collected: false }
    ],
    playerStart: { x: 36, y: 245 }, // Lowered player start for platform
    exit: { x: 610, y: 295, w: 26, h: 45 },
    enemies: [
      { type: "walker", x: 155, y: 302, dir: 1, patrolMin: 40, patrolMax: 240, speed: 44 },
      { type: "hopper", x: 129, y: 88, dir: 1, jumpCooldown: 1.18, jumpTimer: 0, jumpVy: -96 }
    ],
    extra: {},
  },

  // 1-2 OVERGROWN RUINS XL - TUNED VERTICALS: ensure <415px total jump needed (max 390 with 3 jumps)
  {
    name: "1-2: Overgrown Ruins XL",
    bgColor: "#88c070",
    music: null,
    objective: "Lower gem count. Face a walker, projectile shooter, chaser, and a hopper.",
    platforms: [
      { x: 0, y: 320, w: 200, h: 40 },
      { x: 225, y: 260, w: 130, h: 18 },   // Lowered from y:314 → y:260 (platform 64px above ground)
      { x: 505, y: 205, w: 113, h: 14 },   // Lowered from y:235 → y:205
      { x: 19, y: 130, w: 51, h: 17 },     // Raised slightly from y:120 → y:130 (makes pathing easier)
      { x: 278, y: 83, w: 70, h: 13 }      // Lowered from y:173 → y:83
    ],
    gems: [
      { x: 60, y: 320 - 6, collected: false },
      { x: 235, y: 260 - 6, collected: false },
      { x: 505, y: 205 - 6, collected: false },
      { x: 45, y: 130 - 6, collected: false },
      { x: 320, y: 320 - 10, collected: false },
      { x: 310, y: 83 - 7, collected: false }
    ],
    playerStart: { x: 43, y: 222 }, // Start on safe ground
    exit: { x: 620, y: 205, w: 18, h: 61 },
    enemies: [
      { type: "walker", x: 140, y: 300, dir: 1, patrolMin: 30, patrolMax: 230, speed: 62 },
      { type: "projectile", x: 44, y: 112, dir: 1, cooldown: 2.1, t: 0 },
      { type: "chaser", x: 585, y: 145, speed: 60, activeRange: 180 },
      { type: "hopper", x: 278, y: 67, dir: 1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -111 }
    ],
    extra: {},
  },

  // 1-3 THE OLD WALLS XL - TUNED: Staggered/accessible arrangement for triple jump
  {
    name: "1-3: The Old Walls XL",
    bgColor: "#707083",
    music: null,
    objective: "Seven gems, plus walker, hopper, chaser, projectile!",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 393, y: 230, w: 120, h: 12 },   // Lowered from y:165 → y:230
      { x: 155, y: 170, w: 32, h: 10 },    // Raised slightly from y:155→y:170
      { x: 470, y: 125, w: 40, h: 8 }      // Lowered from y:140 → y:125
    ],
    gems: [
      { x: 70, y: 320 - 10, collected: false },
      { x: 115, y: 320 - 10, collected: false },
      { x: 400, y: 230 - 7, collected: false },
      { x: 480, y: 125 - 7, collected: false },
      { x: 580, y: 320 - 10, collected: false },
      { x: 170, y: 170 - 7, collected: false },
      { x: 610, y: 320 - 10, collected: false }
    ],
    playerStart: { x: 56, y: 245 }, // Start on platform for better reach
    exit: { x: 620, y: 290, w: 19, h: 44 },
    enemies: [
      { type: "walker", x: 120, y: 310, dir: 1, patrolMin: 60, patrolMax: 210, speed: 57 },
      { type: "hopper", x: 470, y: 112, dir: -1, jumpCooldown: 1.21, jumpTimer: 0, jumpVy: -140 },
      { type: "chaser", x: 400, y: 221, speed: 80, activeRange: 170 },
      { type: "projectile", x: 510, y: 135, dir: -1, cooldown: 1.99, t: 0 }
    ],
    extra: {},
  },

  // 2-1 MOLTEN CAVES (NEW) - TUNED: All platforms reach w/triple jump
  {
    name: "2-1: Molten Caves",
    bgColor: "#772828",
    music: null,
    objective: "6 gems, hazards everywhere; multiple enemy types.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 80, y: 240, w: 85, h: 14 },    // Lowered from y:245 → y:240
      { x: 440, y: 162, w: 120, h: 12 }   // Lowered from y:190 → y:162
    ],
    gems: [
      { x: 100, y: 240 - 7, collected: false },
      { x: 420, y: 162 - 7, collected: false },
      { x: 50, y: 320 - 11, collected: false },
      { x: 350, y: 320 - 10, collected: false },
      { x: 570, y: 320 - 10, collected: false },
      { x: 610, y: 162 - 7, collected: false }
    ],
    playerStart: { x: 22, y: 260 },
    exit: { x: 622, y: 78, w: 18, h: 48 },
    enemies: [
      { type: "walker", x: 96, y: 305, dir: 1, patrolMin: 64, patrolMax: 210, speed: 72 },
      { type: "hopper", x: 120, y: 240, dir: -1, jumpCooldown: 1.05, jumpTimer: 0, jumpVy: -120 },
      { type: "chaser", x: 418, y: 150, speed: 64, activeRange: 145 },
      { type: "projectile", x: 160, y: 232, dir: 1, cooldown: 1.85, t: 0 },
      { type: "projectile", x: 520, y: 152, dir: -1, cooldown: 1.46, t: 0 },
      { type: "chaser", x: 590, y: 320 - 20, speed: 60, activeRange: 150 }
    ],
    extra: {},
  },

  // 2-2 FROSTBOUND SPIRES (NEW) - TUNED: All reachable (triple jump <390)
  {
    name: "2-2: Frostbound Spires",
    bgColor: "#90d6ff",
    music: null,
    objective: "More enemies for frosty challenge, fewer gems.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 280, y: 180, w: 80, h: 20 },    // Lowered from y:150 → y:180
      { x: 555, y: 230, w: 60, h: 24 },    // Lowered to keep jump step accessible
      { x: 65, y: 132, w: 66, h: 18 },     // Lowered from y:104 → y:132
      { x: 200, y: 109, w: 36, h: 14 }     // Raised from y:89 → y:109
    ],
    gems: [
      { x: 66, y: 320 - 10, collected: false },
      { x: 180, y: 320 - 10, collected: false },
      { x: 320, y: 320 - 10, collected: false },
      { x: 350, y: 180 - 8, collected: false },
      { x: 560, y: 230 - 7, collected: false },
      { x: 365, y: 132 - 7, collected: false },
      { x: 610, y: 320 - 10, collected: false }
    ],
    playerStart: { x: 45, y: 278 },
    exit: { x: 24, y: 63, w: 18, h: 47 },
    enemies: [
      { type: "walker", x: 350, y: 303, dir: 1, patrolMin: 280, patrolMax: 400, speed: 76 },
      { type: "hopper", x: 200, y: 109, dir: -1, jumpCooldown: 1.19, jumpTimer: 0, jumpVy: -120 },
      { type: "chaser", x: 320, y: 98, speed: 85, activeRange: 144 },
      { type: "projectile", x: 121, y: 102, dir: 1, cooldown: 1.33, t: 0 },
      { type: "chaser", x: 555, y: 201, speed: 76, activeRange: 140 }
    ],
    extra: {},
  },

  // 2-3 CRYSTAL MIDNIGHT (NEW) - All platforms accessible (max step < triple jump)
  {
    name: "2-3: Crystal Midnight",
    bgColor: "#343355",
    music: null,
    objective: "Fewer gems, high enemy count and diversity.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 330, y: 220, w: 80, h: 9 },    // Lowered from y:250 → y:220
      { x: 390, y: 155, w: 70, h: 11 },   // Lowered from y:165 → y:155
      { x: 170, y: 115, w: 120, h: 11 },  // Slightly raised from y:125 -> y:115 for reasonable jumps
      { x: 410, y: 80, w: 60, h: 8 }      // Lowered from y:90 → y:80
    ],
    gems: [
      { x: 40, y: 320 - 10, collected: false },
      { x: 140, y: 320 - 10, collected: false },
      { x: 350, y: 320 - 10, collected: false },
      { x: 610, y: 320 - 10, collected: false },
      { x: 350, y: 220 - 7, collected: false },
      { x: 400, y: 155 - 7, collected: false },
      { x: 190, y: 115 - 7, collected: false },
      { x: 410, y: 80 - 7, collected: false }
    ],
    playerStart: { x: 24, y: 270 },
    exit: { x: 622, y: 39, w: 16, h: 49 },
    enemies: [
      { type: "walker", x: 170, y: 315, dir: 1, patrolMin: 124, patrolMax: 290, speed: 78 },
      { type: "chaser", x: 350, y: 220, speed: 82, activeRange: 165 },
      { type: "projectile", x: 335, y: 203, dir: 1, cooldown: 1.77, t: 0 },
      { type: "hopper", x: 336, y: 56, dir: -1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -110 },
      { type: "chaser", x: 190, y: 86, speed: 86, activeRange: 105 },
      { type: "hopper", x: 220, y: 92, dir: 1, jumpCooldown: 1.11, jumpTimer: 0, jumpVy: -105 }
    ],
    extra: {},
  }
];

export default LEVELS;
