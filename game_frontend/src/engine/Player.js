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
    // Sideways
    if (controls.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    } else if (controls.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // Jumping (if on ground or double-jump available)
    if (controls.jumpPressed) {
      if (this.onGround) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
        this.hasDoubleJumped = false;
      } else if (!this.hasDoubleJumped) {
        this.vy = JUMP_VELOCITY * 0.92; // Slightly weaker double jump
        this.hasDoubleJumped = true;
      }
      // else: no jump.
    }

    // Dashing (stub)
    if (controls.dashPressed && this.dashAvailable) {
      this.vx = this.facing * DASH_VELOCITY;
      this.dashAvailable = false;
      // TODO: Complete dash logic (distance/timer, invincibility frames etc.)
    }

    // Apply gravity
    this.vy += GRAVITY * dt;

    // Motion
    let nextX = this.x + this.vx * dt;
    let nextY = this.y + this.vy * dt;

    // Ground collision (temporary: world ground, later via Physics)
    if (nextY + PLAYER_HEIGHT >= GROUND_Y) {
      nextY = GROUND_Y - PLAYER_HEIGHT;
      this.vy = 0;
      this.onGround = true;
      this.dashAvailable = true; // reset dash when grounded
      this.hasDoubleJumped = false;
    } else {
      this.onGround = false;
    }

    // Future: test platform collisions, wall, ceiling
    // if (collisionTester) ...

    this.x = nextX;
    this.y = nextY;
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
