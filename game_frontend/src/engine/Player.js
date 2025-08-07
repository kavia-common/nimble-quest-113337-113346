//
// Player.js - Refined: Robust pixel-perfect retro platformer physics, collision, and debug visualization.
//
// Responsibilities:
//   - Accurate physics integration (position, velocity, "flush" platform snapping)
//   - Strict jump restriction to only when in contact with platform/floor below
//   - No sinking or hovering—player's bbox lands flat on surface
//   - Correct AABB math for all collision, including collectibles
//   - Debug: Bounding box render & collision console diagnostics
//

const PLAYER_WIDTH = 12;
const PLAYER_HEIGHT = 14;
const MOVE_SPEED = 90;
const JUMP_VELOCITY = -195;
const GRAVITY = 650;
const GLIDE_GRAVITY = 170; // Reduced gravity for gliding (tunable)
const MAX_GLIDE_FALL_SPEED = 58; // Max fall speed when gliding (tunable)
const DASH_VELOCITY = 260;
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;

// Maximum number of jumps (triple jump: 3)
const MAX_JUMPS = 3;

// Wall jump settings
const WALL_JUMP_X_VELOCITY = 150;
const WALL_JUMP_Y_VELOCITY = -170;
const WALL_JUMP_BUFFER_TIME = 0.16; // seconds: leeway after leaving wall for jump

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

    // Wall-jump-related fields
    this.touchingWallLeft = false;
    this.touchingWallRight = false;
    this.lastWallDir = 0; // -1 for left, 1 for right
    this.wallJumpBufferTimer = 0; // seconds left for a wall-jump after leaving wall

    // Gliding state
    this.isGliding = false;

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
   * Adds wall jump logic as well as multi-jump and gliding.
   * @param {number} dt - Delta time (seconds)
   * @param {object} controls - { left, right, jumpPressed, dashPressed, glide }
   * @param {function} collisionTester - function (x, y, w, h) => boolean
   */
  update(dt, controls, collisionTester) {
    this.wasOnGround = this.onGround;

    // --- Wall contact detection for wall jump mechanic ---
    let leftWall = false, rightWall = false;
    if (collisionTester) {
      // Check at left/right sides of the player bounding box.
      leftWall = collisionTester(this.x - 1, this.y, 1, PLAYER_HEIGHT);
      rightWall = collisionTester(this.x + PLAYER_WIDTH, this.y, 1, PLAYER_HEIGHT);
    }
    this.touchingWallLeft = leftWall;
    this.touchingWallRight = rightWall;

    // Determine if wall buffer should be started or refreshed
    if (!this.onGround && (leftWall || rightWall)) {
      this.lastWallDir = leftWall ? -1 : (rightWall ? 1 : 0);
      this.wallJumpBufferTimer = WALL_JUMP_BUFFER_TIME;
    } else if (!this.onGround && this.wallJumpBufferTimer > 0) {
      // Decrease buffer if airborne and not touching wall
      this.wallJumpBufferTimer -= dt;
      if (this.wallJumpBufferTimer < 0) this.wallJumpBufferTimer = 0;
    } else {
      // Not eligible
      this.lastWallDir = 0;
      this.wallJumpBufferTimer = 0;
    }

    // --- Gliding logic
    // The key must be held, and player must NOT be on ground and must be falling
    if (controls.glide && !this.onGround && this.vy > 0) {
      this.isGliding = true;
    } else {
      this.isGliding = false;
    }

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

    // --- 3. Apply gravity, possibly reduced by gliding
    if (this.isGliding) {
      this.vy += GLIDE_GRAVITY * dt;
    } else {
      this.vy += GRAVITY * dt;
    }
    if (this.isGliding && this.vy > MAX_GLIDE_FALL_SPEED) {
      this.vy = MAX_GLIDE_FALL_SPEED;
    }

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
        this.isGliding = false; // Cancel gliding on touching ground
      }
    }
    this.onGround = flushGrounded;

    // --- 8. Jumping: now supports wall-jump and triple-jump logic ---
    if (controls.jumpPressed) {
      let didWallJump = false;
      if (
        !this.onGround &&
        this.wallJumpBufferTimer > 0 &&
        this.lastWallDir !== 0
      ) {
        // Perform wall jump
        this.vy = WALL_JUMP_Y_VELOCITY;
        this.vx = -this.lastWallDir * WALL_JUMP_X_VELOCITY;
        this.jumpCount = 1; // After wall jump, allow mid-air jumps
        this.wallJumpBufferTimer = 0;
        didWallJump = true;
        this.facing = -this.lastWallDir;
        this.onGround = false;
      }
      // Only do regular jump if not just wall-jumped
      if (
        !didWallJump &&
        (
          (this.onGround && this.jumpCount === 0) ||
          (!this.onGround && this.jumpCount > 0 && this.jumpCount < MAX_JUMPS)
        )
      ) {
        this.vy = JUMP_VELOCITY * (this.jumpCount === 0 ? 1.0 : 0.93); // Slightly less power for air jumps
        this.jumpCount += 1;
        this.onGround = false;
      }
    }

    // Snap/jump reset for world ground edge-case (fallback)
    // Also, if grounded, wall-jump buffer is cancelled.
    if (this.y >= GAME_HEIGHT - PLAYER_HEIGHT - 1) {
      this.jumpCount = 0;
      this.wallJumpBufferTimer = 0;
      this.isGliding = false;
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
      this.isGliding = false;
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

