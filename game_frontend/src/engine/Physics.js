//
// Physics.js - Core physics utilities and collision scaffolding for the platformer.
//
/*
  Responsibilities:
    - Gravity constants, math helpers
    - Platform collision tester (stub)
    - Expandable for more advanced collision/resolution
*/

// PUBLIC_INTERFACE
export const GROUND_Y = 180 - 40; // Must match main engine and player

// PUBLIC_INTERFACE
/**
 * Stub for basic platform collider. To be replaced by tilemap/entity collision.
 */
export function isCollidingWithGround(x, y, w, h) {
  return (y + h) >= GROUND_Y;
}

// PUBLIC_INTERFACE
/**
 * Rectangle collision check.
 */
export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}
