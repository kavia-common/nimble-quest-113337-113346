// Physics.js - Core physics utilities (AABB platform/collision test).
/*
  Expanded for: Platform collision with flush snapping, AABB for player/entities,
  Debug helpers for collision visual verification,
  No hardcoded ground—supports multiple platforms.
*/

// PUBLIC_INTERFACE
export const GROUND_Y = 180 - 40; // Convention fallback; not used for main collision.

// PUBLIC_INTERFACE
/**
 * Rectangle Axis-Aligned Bounding Box (AABB) overlap test.
 */
export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

// PUBLIC_INTERFACE
/**
 * Checks if a player/entity bbox sits flush atop any given platform set.
 * Returns details for debugging draw overlays.
 * flush: Set true for strict "just barely sitting flush" mode (1-px leeway).
 * platforms: array [{x, y, w, h}]
 */
export function isPlayerOnAnyPlatform(x, y, w, h, platforms, flush = true) {
  for (let p of platforms) {
    if (
      // Horizontally inside, and "bottom" is exactly atop platform's top edge
      x + w > p.x + 1 &&
      x < p.x + p.w - 1 &&
      Math.abs((y + h) - p.y) < (flush ? 1.1 : 3)
    ) {
      // Vertical sides cannot be too deep below surface (snap check)
      if ((y + h) <= p.y + 1) {
        return p;
      }
    }
  }
  return null;
}

// PUBLIC_INTERFACE
/**
 * General collision test for player/entity bbox vs. platform list.
 * Returns true if colliding with any.
 */
export function isCollidingWithAnyPlatform(x, y, w, h, platforms) {
  for (let p of platforms) {
    if (
      rectsOverlap(x, y, w, h, p.x, p.y, p.w, p.h)
    ) {
      return true;
    }
  }
  return false;
}

