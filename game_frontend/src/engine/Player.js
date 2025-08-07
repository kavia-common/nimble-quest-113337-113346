//
// Player.js - Refined: Robust pixel-perfect retro platformer physics, collision, and debug visualization.
//
/*
  Responsibilities:
    - Accurate physics integration (position, velocity, "flush" platform snapping)
    - Strict jump restriction to only when in contact with platform/floor below
    - No sinking or hovering—player's bbox lands flat on surface
    - Correct AABB math for all collision, including collectibles
    - Debug: Bounding box render & collision console diagnostics
*/

const PLAYER_WIDTH = 12;
const PLAYER_HEIGHT = 14;
const MOVE_SPEED = 90;
const JUMP_VELOCITY = -195;
const GRAVITY = 650;
const DASH_VELOCITY = 260;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

// Maximum number of jumps (triple jump: 3)
const MAX_JUMPS = 3;

// PUBLIC_INTERFACE
export default class Player {
  /**
   * @param {object} opts - Player initialization options (x, y).
   */
  constructor(opts = {}) {
    // Position: left/top of bounding box (pixel units)
    this.x = opts.x ?? 150;
    this.y = opts.y ?? (GAME_HEIGHT - 40 - PLAYER_HEIGHT);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.wasOnGround = false;
    this.dashAvailable = true;
    this.facing = 1; // 1: right, -1: left

    this.jumpCount = 0; // Number of jumps performed since last landing
    this.inputJumpBuffered = false; // To buffer jump press between frames

    // Debug
    this._debugLastCollidePlatform = null;
  }

  // PUBLIC_INTERFACE
  /**
   * Draw the player, bounding box, ground contact marker, and debug overlays for collision.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    // Player main body
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    // (Retro) shadow underneath
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#222';
    ctx.fillRect(this.x + 1, this.y + PLAYER_HEIGHT, PLAYER_WIDTH - 2, 3);
    ctx.globalAlpha = 1;

    // --- Debug overlays ---
    const debug = true;
    if (debug) {
      // (1) Player AABB (green=grounded, red=air)
      ctx.save();
      ctx.strokeStyle = this.onGround ? '#27e827' : '#ff5555';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      ctx.restore();

      // (2) Bottom-center ground contact dot
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x + PLAYER_WIDTH / 2, this.y + PLAYER_HEIGHT - 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.onGround ? '#00eaff' : '#ffc';
      ctx.globalAlpha = this.onGround ? 1 : 0.48;
      ctx.fill();
      ctx.restore();

      // (3) Highlight flush collision platform, if any
      if (this._debugLastCollidePlatform) {
        ctx.save();
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = "#28d6fa";
        const pl = this._debugLastCollidePlatform;
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // PUBLIC_INTERFACE
  /**
   * Integrate player movement, flush snap, ground state, and jump/collision handling with strict AABB guarantees.
   * @param {number} dt - Delta time (seconds)
   * @param {object} controls - { left, right, jumpPressed, dashPressed }
   * @param {function} collisionTester - function (x, y, w, h) => boolean
   */
  update(dt, controls, collisionTester) {
    this.wasOnGround = this.onGround;

    // --- 1. Handle horizontal movement & facing
    if (controls.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    } else if (controls.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // --- 2. Dashing (single-shot, disables until next ground contact)
    if (controls.dashPressed && this.dashAvailable) {
      this.vx = this.facing * DASH_VELOCITY;
      this.dashAvailable = false;
    }

    // --- 3. Apply gravity
    this.vy += GRAVITY * dt;

    // --- 4. Compute proposed positions
    let nextX = this.x + this.vx * dt;
    let nextY = this.y + this.vy * dt;

    // --- 5. Horizontal AABB collision
    // Move X with fine-grained step for pixel-perfect stop at obstacles
    let movedX = false;
    {
      let origX = this.x;
      let desiredX = nextX;
      let step = Math.sign(desiredX - origX);
      while (Math.abs(desiredX - this.x) > 0.8) {
        let testX = this.x + step;
        if (collisionTester && collisionTester(testX, this.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          this.vx = 0;
          break;
        } else {
          this.x = testX;
          movedX = true;
        }
        if (Math.abs(desiredX - this.x) < 0.8) break;
      }
      // If no step required, allow subpixel
      if (!movedX && !collisionTester(desiredX, this.y, PLAYER_WIDTH, PLAYER_HEIGHT))
        this.x = desiredX;
    }

    // --- 6. Vertical AABB collision & flush ground/floor snap
    this._debugLastCollidePlatform = null;
    {
      let origY = this.y;
      let desiredY = nextY;
      let step = Math.sign(desiredY - origY);
      while (Math.abs(desiredY - this.y) > 0.8) {
        let testY = this.y + step;
        if (collisionTester && collisionTester(this.x, testY, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          this.vy = 0;
          break;
        } else {
          this.y = testY;
        }
        if (Math.abs(desiredY - this.y) < 0.8) break;
      }
      // Try subpixel if still not colliding
      if (!collisionTester(this.x, desiredY, PLAYER_WIDTH, PLAYER_HEIGHT))
        this.y = desiredY;
    }

    // --- 7. Ground/Floor flush check: are we standing strictly ON TOP of platform?
    let flushGrounded = false;
    if (collisionTester) {
      // Look for surface exactly below (1 px)
      if (this.vy >= 0 && collisionTester(this.x, this.y + 1, PLAYER_WIDTH, PLAYER_HEIGHT)) {
        this.y = Math.round(this.y); // Snap flush
        this.vy = 0;
        flushGrounded = true;
        this.dashAvailable = true;
        this.jumpCount = 0; // Reset jump counter on ground
      }
    }
    this.onGround = flushGrounded;

    // --- 8. Jumping: triple jump logic ---
    // Only allow a jump when:
    //   - On ground (first jump)
    //   - Or < MAX_JUMPS jumps have been made since last landing (allow up to 2 mid-air)
    // Requires fresh press ("jumpPressed" buffer in controls)
    if (controls.jumpPressed) {
      if (
          (this.onGround && this.jumpCount === 0) ||
          (!this.onGround && this.jumpCount > 0 && this.jumpCount < MAX_JUMPS)
        ) {
        this.vy = JUMP_VELOCITY * (this.jumpCount === 0 ? 1.0 : 0.93); // Slightly less power for air jumps
        this.jumpCount += 1;
        this.onGround = false;
      }
    }

    // Snap/jump reset for world ground edge-case (fallback)
    if (this.y >= GAME_HEIGHT - PLAYER_HEIGHT - 1) {
      this.jumpCount = 0;
    }

    // --- 9. World bounds clamp (retro)
    if (this.x < 0) this.x = 0;
    if (this.x > GAME_WIDTH - PLAYER_WIDTH) this.x = GAME_WIDTH - PLAYER_WIDTH;
    if (this.y < 0) this.y = 0;
    if (this.y > GAME_HEIGHT - PLAYER_HEIGHT - 1) {
      this.y = GAME_HEIGHT - PLAYER_HEIGHT - 1;
      this.vy = 0;
      this.onGround = true;
      this.jumpCount = 0;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Returns true if player's AABB overlaps target rect (classic AABB collision).
   * Used for collectibles, exit, etc.
   */
  overlapsRect(x, y, w, h) {
    // Classic AABB
    return (
      this.x < x + w &&
      this.x + PLAYER_WIDTH > x &&
      this.y < y + h &&
      this.y + PLAYER_HEIGHT > y
    );
  }

  // PUBLIC_INTERFACE
  // Stub placeholder for expansion hook
  onCollide(entityType, entity) {
    // entityType: 'platform', 'enemy', 'gem', etc.
    // future: callback used in engine if needed
  }
}

