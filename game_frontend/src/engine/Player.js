//
// Player.js - Core player entity, state, and control logic for the platformer.
//
/*
  Responsibilities:
    - Player physics integration (position, velocity, input-controlled movement)
    - Jump, double jump, dash stubs (to be expanded later)
    - Keyboard controls (left, right, jump, dash)
    - Collision hooks with platforms/obstacles (callbacks, but logic TBA)
    - Simple pixel-art sprite/block drawing for now
*/

const PLAYER_WIDTH = 12;
const PLAYER_HEIGHT = 14;
const MOVE_SPEED = 90; // pixels/sec
const JUMP_VELOCITY = -195; // pixels/sec upward (negative is upward)
const GRAVITY = 650; // pixels/sec^2
const DASH_VELOCITY = 260;
const GROUND_Y = 180 - 40; // Ground's Y coordinate (sync w/GameEngine)

export default class Player {
  // PUBLIC_INTERFACE
  /**
   * @param {object} opts - Player initialization options, e.g. { x, y }
   */
  constructor(opts = {}) {
    this.x = opts.x ?? 150;
    this.y = opts.y ?? (GROUND_Y - PLAYER_HEIGHT);
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hasDoubleJumped = false;
    this.dashAvailable = true;
    this.facing = 1; // 1: right, -1: left
  }

  // PUBLIC_INTERFACE
  /**
   * Draws the player as a simple pixel-art rectangle/sprite.
   */
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    // Draw subtle shadow
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#222';
    ctx.fillRect(this.x + 1, this.y + PLAYER_HEIGHT, PLAYER_WIDTH - 2, 3);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // PUBLIC_INTERFACE
  /**
   * Updates the player physics and state.
   * @param {number} dt - Delta time (seconds)
   * @param {object} controls - { left: bool, right: bool, jumpPressed: bool, dashPressed: bool }
   * @param {function} collisionTester - receives (x, y, w, h) returning collision type/bool.
   */
  update(dt, controls, collisionTester) {
    // Sideways movement - only change horizontal velocity
    if (controls.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    } else if (controls.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // Vertical collision/standing state must be reset each frame
    let wantJump = controls.jumpPressed;
    let landed = false;

    // Dashing
    if (controls.dashPressed && this.dashAvailable) {
      this.vx = this.facing * DASH_VELOCITY;
      this.dashAvailable = false;
    }

    // Apply gravity
    this.vy += GRAVITY * dt;

    // Predict next position for X and Y separately for AABB collision
    let nextX = this.x + this.vx * dt;
    let nextY = this.y + this.vy * dt;

    // --- Horizontal collision: allow sliding along platforms ---
    if (collisionTester && collisionTester(nextX, this.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
      // Try moving one pixel at a time towards obstacle for pixel-perfect stop
      let step = (this.vx > 0) ? 1 : -1;
      for (let i = 0; i < Math.abs(nextX - this.x); i++) {
        if (!collisionTester(this.x + step, this.y, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          this.x += step;
        } else {
          break;
        }
      }
      this.vx = 0;
      nextX = this.x;
    } else {
      this.x = nextX;
    }

    // --- Vertical collision: hit floor/platform from above (standing), or ceiling from below (head bump) ---
    let falling = this.vy > 0;
    if (collisionTester) {
      // Try moving one pixel at a time in Y
      let yStep = falling ? 1 : -1;
      let deltaY = nextY - this.y;
      let maxSteps = Math.abs(Math.round(deltaY));
      let didCollide = false;
      for (let i = 0; i < maxSteps; i++) {
        let testY = this.y + yStep;
        if (!collisionTester(this.x, testY, PLAYER_WIDTH, PLAYER_HEIGHT)) {
          this.y = testY;
        } else {
          didCollide = true;
          break;
        }
      }
      if (!didCollide) {
        this.y = nextY;
      }
      // Floor/platform from above (standing)
      if (falling && collisionTester(this.x, this.y + 1, PLAYER_WIDTH, PLAYER_HEIGHT)) {
        this.vy = 0;
        this.onGround = true;
        this.dashAvailable = true;
        this.hasDoubleJumped = false;
        landed = true;
      } else if (!falling && collisionTester(this.x, this.y - 1, PLAYER_WIDTH, PLAYER_HEIGHT)) {
        // Hitting head
        this.vy = 0;
      } else {
        this.onGround = false;
      }
    } else {
      this.y = nextY;
    }

    // Jumping (if on ground or double-jump available)
    if (wantJump) {
      if (this.onGround && landed) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
        this.hasDoubleJumped = false;
      } else if (!this.hasDoubleJumped) {
        this.vy = JUMP_VELOCITY * 0.92;
        this.hasDoubleJumped = true;
      }
    }

    // Clamp to left/right of screen
    if (this.x < 0) this.x = 0;
    if (this.x > 320 - PLAYER_WIDTH) this.x = 320 - PLAYER_WIDTH;
    // Clamp to top/bottom
    if (this.y < 0) this.y = 0;
    if (this.y > GROUND_Y - PLAYER_HEIGHT) this.y = GROUND_Y - PLAYER_HEIGHT;
  }

  // PUBLIC_INTERFACE
  /**
   * Stub – Hook for platform collision, used by the engine.
   */
  onCollide(entityType, entity) {
    // entityType could be 'platform', 'enemy', etc
    // TBA
  }
}
