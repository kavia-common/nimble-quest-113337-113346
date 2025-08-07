import React, { useRef, useEffect } from 'react';
import GameCanvas from '../components/GameCanvas';
import Player from './Player';
import * as Physics from './Physics';

/**
 * GameEngine - Main orchestrator for game loop, rendering, and simulation.
 *
 * Handles main update loop, input, physics, and entity rendering.
 * Pixel-art: 320x180 virtual resolution, scales up for crisp aesthetic.
 */
// PUBLIC_INTERFACE
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const PIXEL_SCALE = 2;

const COLORS = {
  sky: '#9ad0ec',
  ground: '#3e4e3e',
  block: '#66e67e'
};

// Draws world, static blocks/platforms
function drawWorld(ctx) {
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

  // Demo: block tile
  ctx.fillStyle = COLORS.block;
  ctx.fillRect(100, GAME_HEIGHT - 56, 16, 16);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Keyboard mapping: Simple acrobatics/arrow/wasd
const KEYMAP = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  jump: [' ', 'Spacebar', 'w', 'W', 'ArrowUp'],
  dash: ['Shift', 'ShiftLeft', 'ShiftRight']
};

// PUBLIC_INTERFACE
const GameEngine = () => {
  const canvasRef = useRef();
  const playerRef = useRef(new Player());
  const controlsRef = useRef({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    dashPressed: false
  });

  // Keyboard listeners setup/teardown
  useEffect(() => {
    function handleKeyDown(e) {
      if (KEYMAP.left.includes(e.key)) controlsRef.current.left = true;
      if (KEYMAP.right.includes(e.key)) controlsRef.current.right = true;
      if (KEYMAP.jump.includes(e.key)) {
        if (!controlsRef.current.jump) controlsRef.current.jumpPressed = true;
        controlsRef.current.jump = true;
      }
      if (KEYMAP.dash.includes(e.key)) {
        if (!controlsRef.current.dash) controlsRef.current.dashPressed = true;
        controlsRef.current.dash = true;
      }
    }
    function handleKeyUp(e) {
      if (KEYMAP.left.includes(e.key)) controlsRef.current.left = false;
      if (KEYMAP.right.includes(e.key)) controlsRef.current.right = false;
      if (KEYMAP.jump.includes(e.key)) {
        controlsRef.current.jump = false;
        controlsRef.current.jumpPressed = false; // prevents repeat
      }
      if (KEYMAP.dash.includes(e.key)) {
        controlsRef.current.dash = false;
        controlsRef.current.dashPressed = false;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game/animation loop
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();

    function frame() {
      if (!running) return;
      const now = performance.now();
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      dt = clamp(dt, 0, 0.045); // Clamp for stability on bad frames

      // Physics & update
      const player = playerRef.current;
      const controls = controlsRef.current;

      // Pass just-pulsed jump/dash, reset after update
      const jumpPressed = controls.jumpPressed;
      const dashPressed = controls.dashPressed;
      player.update(
        dt,
        { left: controls.left, right: controls.right, jumpPressed, dashPressed },
        (x, y, w, h) => Physics.isCollidingWithGround(x, y, w, h)
        // (Stub: pass further for tilemap/entity collision test)
      );
      controlsRef.current.jumpPressed = false;
      controlsRef.current.dashPressed = false;

      // Render
      const ctx = canvasRef.current?.getContext();
      if (ctx) {
        // Clear/Redraw world
        drawWorld(ctx);
        // Draw platforms/blocks here in future

        // Draw player
        player.draw(ctx);
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    return () => { running = false; };
  }, []);

  // Autofocus canvas for keyboard input (optional UX improvement)
  useEffect(() => {
    if (canvasRef.current?.getCanvas) canvasRef.current.getCanvas().focus();
  }, []);

  return (
    <div className="game-engine" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <GameCanvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        scale={PIXEL_SCALE}
        tabIndex={0}
      />
      <div style={{
        marginTop: '8px',
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#85c1e9',
        opacity: 0.7,
      }}>
        Use ← → (A/D) to move, Space/W/↑ to jump, Shift to dash (stub). <span role="img" aria-label="controller">🎮</span>
      </div>
    </div>
  );
};

export default GameEngine;
