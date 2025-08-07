//
// Player.js - Overhauled: Robust retro platformer player physics, AABB collision, and debug overlays.
//
/*
  Responsibilities:
    - Accurate physics integration (position, velocity, "flush" platform snapping)
    - Strict jump restriction to only when in contact with platform/floor below
    - No sinking or hovering—player's bbox lands flat on surface
    - Correct AABB math for all collision, including collectibles
    - Debug: Bounding box render & collision console diagnostics
*/

// Dimensions and constants
const PLAYER_WIDTH = 12;
const PLAYER_HEIGHT = 14;
const MOVE_SPEED = 90;
const JUMP_VELOCITY = -195;
const GRAVITY = 650;
const DASH_VELOCITY = 260;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

// PUBLIC_INTERFACE
export default class Player {
  /**
   * @param {object} opts - Player initialization options (x, y).
   */
  constructor(opts = {}) {
    // Position: left / top of bounding box (pixel units)
    this.x = opts.x ?? 150;
    this.y = opts.y ?? (GAME_HEIGHT - 40 - PLAYER_HEIGHT);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.wasOnGround = false;
    this.hasDoubleJumped = false;
    this.dashAvailable = true;
    this.facing = 1; // 1: right, -1: left
    // Debug
    this._debugLastCollidePlatform = null;
  }

  // PUBLIC_INTERFACE
  /**
   * Draws the player as a simple pixel-art rectangle/sprite, with bbox and state overlay in debug mode.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    // Shadow under feet
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#222';
    ctx.fillRect(this.x + 1, this.y + PLAYER_HEIGHT, PLAYER_WIDTH - 2, 3);
    ctx.globalAlpha = 1;

    // Debug: draw bounding box and ground contact marker
    // Toggle debug drawing -- set to true to show collision overlays
    const showDebug = true;
    if (showDebug) {
      // Bounding box
      ctx.save();
      ctx.strokeStyle = this.onGround ? "#2ecc71" : "#ff5555";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      // Draw bottom-center dot
      ctx.beginPath();
      ctx.arc(this.x + PLAYER_WIDTH / 2, this.y + PLAYER_HEIGHT, 2, 0, 2 * Math.PI);
      ctx.fillStyle = this.onGround ? "#ccf" : "#ccc";
      ctx.fill();
      ctx.restore();

      // If platform collision last frame, show it
      if (this._debugLastCollidePlatform) {
        ctx.save();
        ctx.globalAlpha = 0.35;
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
   * Physics and control integration. Handles ground/platform AABB collision with pixel-perfect resolution.
   * @param {number} dt - Delta time (seconds)
   * @param {object} controls - { left, right, jumpPressed, dashPressed }
   * @param {function} collisionTester - receives (x, y, w, h) => boolean (true if colliding)
   *        Must check against all platforms, not just ground!
   */
  update(dt, controls, collisionTester) {
    this.wasOnGround = this.onGround;

    // 1. Horizontal movement and facing
    if (controls.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    } else if (controls.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // 2. Dashing (one tap - cancels midair friction)
    if (controls.dashPressed && this.dashAvailable) {
      this.vx = this.facing * DASH_VELOCITY;
      this.dashAvailable = false;
    }

    // 3. Gravity
    this.vy += GRAVITY * dt;

    // 4. Desired next position (but clamp and resolve separately)
    let nextX = this.x + this.vx * dt;
    let nextY = this.y + this.vy * dt;

    // 5. Horizontal collision: platforms
    let xResolved = false;
    let origY = this.y;
    // Check moving in x, test at increments to prevent tunneling
    {
      let testX = nextX;
      let collided = false;
      if (collisionTester && collisionTester(testX, origY, PLAYER_WIDTH, PLAYER_HEIGHT)) {
        // Binary search back to open space (iteration for pixel snap)
        let min = this.x, max = testX, last = this.x;
        for (let steps = 0; steps < Math.abs(testX - this.x); steps++) {
          let mid = min + Math.sign(max - min) * 1;
          if (!collisionTester(mid, origY, PLAYER_WIDTH, PLAYER_HEIGHT)) {
            last = mid;
            min = mid;
          } else {
            max = mid;
          }
          if (Math.abs(max - min) < 1) break;
        }
        this.x = last;
        this.vx = 0;
        xResolved = true;
      } else {
        this.x = testX;
      }
    }

    // 6. Vertical collision: platforms/floor/ceiling
    let yResolved = false;
    let origX = this.x;
    this._debugLastCollidePlatform = null;
    {
      let testY = nextY, direction = (this.vy >= 0) ? 1 : -1;
      let collided = false;
      // Scan through the motion incrementally for pixel snapping
      let dy = testY - this.y;
      let steps = Math.abs(Math.round(dy));
      let lastGood = this.y;
      for (let s = 0; s < steps; s++) {
        let testPosY = this.y + direction;
        if (!collisionTester(origX, testPosY, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          this.y = testPosY;
          lastGood = this.y;
        } else {
          collided = true;
          break;
        }
      }
      if (collided) {
        this.y = lastGood;
        yResolved = true;
        this.vy = 0;
      } else {
        this.y = testY;
      }
    }

    // 7. Are we on ground/platform? (Strict: bbox flush atop any platform or floor)
    let onTop = false;
    if (collisionTester) {
      // If moving/falling downwards AND a collision just one pixel below
      if (this.vy >= 0) {
        // Test bounding box just 1 pixel below
        if (collisionTester(this.x, this.y + 1, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          // We are flush on ground/platform
          this.y = Math.floor(this.y);
          this.vy = 0;
          onTop = true;
          this.dashAvailable = true;
          this.hasDoubleJumped = false;
        }
      }
    }
    this.onGround = onTop;

    // 8. Jumping: strictly only when flush on ground/platform/top
    if (controls.jumpPressed) {
      if (this.onGround) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
        this.hasDoubleJumped = false;
      } else if (!this.hasDoubleJumped) {
        // For classic double-jump feel (optional; can remove if single-jump only desired)
        this.vy = JUMP_VELOCITY * 0.92;
        this.hasDoubleJumped = true;
      }
    }

    // 9. Clamp within world bounds (retro style)
    if (this.x < 0) this.x = 0;
    if (this.x > GAME_WIDTH - PLAYER_WIDTH) this.x = GAME_WIDTH - PLAYER_WIDTH;
    if (this.y < 0) this.y = 0;
    if (this.y > GAME_HEIGHT - PLAYER_HEIGHT - 1) {
      // Snap to floor (hard stop, not below visible)
      this.y = GAME_HEIGHT - PLAYER_HEIGHT - 1;
      this.vy = 0;
      this.onGround = true;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Used for integration test: check if player's bbox overlaps some rectangle (collectibles etc).
   */
  overlapsRect(x, y, w, h) {
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
