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
  // 1-1 THE GARDEN GATE XL - LOWERED for easy 3-jump access everywhere
  {
    name: "1-1: The Garden Gate XL",
    bgColor: "#9ad0ec",
    music: null,
    objective: "Collect fewer gems, avoid a walker and slow hopper.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },                                              // ground
      { x: 50, y: 250, w: 120, h: 18 },      // Lowered slightly (was y:230); maintain challenge, but gap is fair
      { x: 420, y: 200, w: 85, h: 16 },      // Lowered significantly (was y:160), allow next-to-ground gap to be crossable
      { x: 120, y: 160, w: 180, h: 14 },     // Lowered (was y:105); next platform always within reach
      { x: 599, y: 320, w: 41, h: 25 }
    ],
    gems: [
      { x: 110, y: 250 - 6, collected: false },
      { x: 450, y: 200 - 6, collected: false },
      { x: 210, y: 160 - 6, collected: false },
      { x: 610, y: 320 - 12, collected: false },
      { x: 90, y: 320 - 12, collected: false }
    ],
    playerStart: { x: 36, y: 280 }, // Start on ground, lower for new layout
    exit: { x: 610, y: 295, w: 26, h: 45 },
    enemies: [
      { type: "walker", x: 155, y: 302, dir: 1, patrolMin: 40, patrolMax: 240, speed: 44 },
      { type: "hopper", x: 129, y: 150, dir: 1, jumpCooldown: 1.18, jumpTimer: 0, jumpVy: -96 }
    ],
    extra: {},
  },

  // 1-2 OVERGROWN RUINS XL - Platforms collapsed so each step is < triple jump distance
  {
    name: "1-2: Overgrown Ruins XL",
    bgColor: "#88c070",
    music: null,
    objective: "Lower gem count. Face a walker, projectile shooter, chaser, and a hopper.",
    platforms: [
      { x: 0, y: 320, w: 200, h: 40 },                                          // ground
      { x: 225, y: 260, w: 130, h: 18 },   // unchanged: 60px up
      { x: 505, y: 200, w: 113, h: 14 },   // 60px from last, lowered a bit from y:205→y:200
      { x: 29, y: 150, w: 51, h: 17 },     // was y:130→y:150, staggered for reachability (gap from 200→150=50)
      { x: 278, y: 110, w: 70, h: 13 }     // was y:83→y:110, now staggered with previous, underneath 150 (vertical < 50)
    ],
    gems: [
      { x: 60, y: 320 - 6, collected: false },
      { x: 235, y: 260 - 6, collected: false },
      { x: 530, y: 200 - 6, collected: false },
      { x: 45, y: 150 - 6, collected: false },
      { x: 320, y: 320 - 10, collected: false },
      { x: 310, y: 110 - 7, collected: false }
    ],
    playerStart: { x: 43, y: 295 }, // Start on ground, near new ground platform
    exit: { x: 620, y: 205, w: 18, h: 61 },
    enemies: [
      { type: "walker", x: 140, y: 300, dir: 1, patrolMin: 30, patrolMax: 230, speed: 62 },
      { type: "projectile", x: 44, y: 132, dir: 1, cooldown: 2.1, t: 0 },
      { type: "chaser", x: 585, y: 140, speed: 60, activeRange: 180 },
      { type: "hopper", x: 278, y: 90, dir: 1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -111 }
    ],
    extra: {},
  },

  // 1-3 THE OLD WALLS XL - Platforms all reachable with < triple jump
  {
    name: "1-3: The Old Walls XL",
    bgColor: "#707083",
    music: null,
    objective: "Seven gems, plus walker, hopper, chaser, projectile!",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },                    // ground
      { x: 293, y: 230, w: 120, h: 12 },   // was 393, lowered y:230
      { x: 155, y: 180, w: 42, h: 10 },    // gap from 230→180 (50)
      { x: 420, y: 130, w: 72, h: 8 }      // was 470, lowered and widened for accessibility (180→130, 50px diff)
    ],
    gems: [
      { x: 70, y: 320 - 10, collected: false },
      { x: 115, y: 320 - 10, collected: false },
      { x: 300, y: 230 - 7, collected: false },
      { x: 440, y: 130 - 7, collected: false },
      { x: 580, y: 320 - 10, collected: false },
      { x: 170, y: 180 - 7, collected: false },
      { x: 610, y: 320 - 10, collected: false }
    ],
    playerStart: { x: 56, y: 265 }, // slightly above ground for initial jump
    exit: { x: 620, y: 290, w: 19, h: 44 },
    enemies: [
      { type: "walker", x: 120, y: 310, dir: 1, patrolMin: 60, patrolMax: 210, speed: 57 },
      { type: "hopper", x: 420, y: 108, dir: -1, jumpCooldown: 1.21, jumpTimer: 0, jumpVy: -140 },
      { type: "chaser", x: 300, y: 221, speed: 80, activeRange: 170 },
      { type: "projectile", x: 510, y: 139, dir: -1, cooldown: 1.99, t: 0 }
    ],
    extra: {},
  },

  // 2-1 MOLTEN CAVES (NEW) - All platforms are stepwise < triple jump
  {
    name: "2-1: Molten Caves",
    bgColor: "#772828",
    music: null,
    objective: "6 gems, hazards everywhere; multiple enemy types.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 80, y: 250, w: 85, h: 14 },    // y:240->250, higher so next platform is in step
      { x: 440, y: 190, w: 120, h: 12 }   // y:162->190, broader and higher, step regions consistent
    ],
    gems: [
      { x: 100, y: 250 - 7, collected: false },
      { x: 460, y: 190 - 7, collected: false },
      { x: 50, y: 320 - 11, collected: false },
      { x: 350, y: 320 - 10, collected: false },
      { x: 570, y: 320 - 10, collected: false },
      { x: 610, y: 190 - 7, collected: false }
    ],
    playerStart: { x: 22, y: 295 },
    exit: { x: 622, y: 108, w: 18, h: 48 },
    enemies: [
      { type: "walker", x: 96, y: 305, dir: 1, patrolMin: 64, patrolMax: 210, speed: 72 },
      { type: "hopper", x: 120, y: 250, dir: -1, jumpCooldown: 1.05, jumpTimer: 0, jumpVy: -120 },
      { type: "chaser", x: 418, y: 174, speed: 64, activeRange: 145 },
      { type: "projectile", x: 160, y: 242, dir: 1, cooldown: 1.85, t: 0 },
      { type: "projectile", x: 520, y: 182, dir: -1, cooldown: 1.46, t: 0 },
      { type: "chaser", x: 590, y: 320 - 20, speed: 60, activeRange: 150 }
    ],
    extra: {},
  },

  // 2-2 FROSTBOUND SPIRES (RELAYERED VERTICALS for new jump balance)
  {
    name: "2-2: Frostbound Spires",
    bgColor: "#90d6ff",
    music: null,
    objective: "More enemies for frosty challenge, fewer gems.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 38 },
      { x: 220, y: 240, w: 98, h: 20 },    // y:180->240 (stepwise), makes the gap < triple jump
      { x: 395, y: 180, w: 94, h: 24 },    // y:230->180, stagger up for easy triple jump
      { x: 65, y: 140, w: 66, h: 18 },     // y:132->140, stepwise for easier climb
      { x: 200, y: 109, w: 66, h: 14 }     // y:109 unchanged (top platform)
    ],
    gems: [
      { x: 66, y: 320 - 10, collected: false },
      { x: 180, y: 320 - 10, collected: false },
      { x: 260, y: 240 - 8, collected: false },
      { x: 440, y: 180 - 7, collected: false },
      { x: 560, y: 320 - 10, collected: false },
      { x: 365, y: 140 - 7, collected: false },
      { x: 210, y: 109 - 7, collected: false }
    ],
    playerStart: { x: 45, y: 295 },
    exit: { x: 24, y: 63, w: 18, h: 47 },
    enemies: [
      { type: "walker", x: 350, y: 303, dir: 1, patrolMin: 280, patrolMax: 400, speed: 76 },
      { type: "hopper", x: 200, y: 109, dir: -1, jumpCooldown: 1.19, jumpTimer: 0, jumpVy: -120 },
      { type: "chaser", x: 320, y: 98, speed: 85, activeRange: 144 },
      { type: "projectile", x: 121, y: 120, dir: 1, cooldown: 1.33, t: 0 },
      { type: "chaser", x: 395, y: 150, speed: 76, activeRange: 140 }
    ],
    extra: {},
  },

  // 2-3 CRYSTAL MIDNIGHT (RETOOLED for easy traverse with triple jump)
  {
    name: "2-3: Crystal Midnight",
    bgColor: "#343355",
    music: null,
    objective: "Fewer gems, high enemy count and diversity.",
    platforms: [
      { x: 0, y: 320, w: 640, h: 40 },
      { x: 330, y: 250, w: 80, h: 9 },    // y:220->250, easier triple jump
      { x: 390, y: 190, w: 70, h: 11 },   // y:155->190
      { x: 210, y: 135, w: 120, h: 11 },  // was y:115->135 (mid&top now easier)
      { x: 410, y: 80, w: 60, h: 8 }      // unchanged
    ],
    gems: [
      { x: 40, y: 320 - 10, collected: false },
      { x: 140, y: 320 - 10, collected: false },
      { x: 350, y: 250 - 7, collected: false },
      { x: 420, y: 190 - 7, collected: false },
      { x: 280, y: 135 - 7, collected: false },
      { x: 410, y: 80 - 7, collected: false },
      { x: 190, y: 320 - 10, collected: false },
      { x: 610, y: 320 - 10, collected: false }
    ],
    playerStart: { x: 24, y: 295 },
    exit: { x: 622, y: 69, w: 16, h: 49 },
    enemies: [
      { type: "walker", x: 170, y: 315, dir: 1, patrolMin: 124, patrolMax: 290, speed: 78 },
      { type: "chaser", x: 350, y: 250, speed: 82, activeRange: 165 },
      { type: "projectile", x: 335, y: 230, dir: 1, cooldown: 1.77, t: 0 },
      { type: "hopper", x: 336, y: 110, dir: -1, jumpCooldown: 1.25, jumpTimer: 0, jumpVy: -110 },
      { type: "chaser", x: 280, y: 135, speed: 86, activeRange: 105 },
      { type: "hopper", x: 220, y: 115, dir: 1, jumpCooldown: 1.11, jumpTimer: 0, jumpVy: -105 }
    ],
    extra: {},
  }
];

export default LEVELS;
