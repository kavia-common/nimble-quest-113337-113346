import React, { useRef, useEffect } from 'react';
import GameCanvas from '../components/GameCanvas';

/**
 * GameEngine - Main orchestrator for game loop, rendering, and simulation.
 *
 * Renders a pixel-art placeholder scene (basic sky, ground, tile, player block).
 * Prepares structure for upcoming entity/level logic.
 *
 * The logical canvas is 320x180 ("16:9 quarter-HD" for crisp scaling at ×2/×3), scaling up for retro effects.
 */
// PUBLIC_INTERFACE
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const PIXEL_SCALE = 2;

const COLORS = {
  sky: '#9ad0ec',
  ground: '#3e4e3e',
  block: '#66e67e',
  player: '#ffd700',
};

function drawPlaceholderScene(ctx) {
  // Fill sky
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Draw ground (bottom 40px)
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

  // Draw a "block" tile as a reference (pixel-art: 16x16 px)
  ctx.fillStyle = COLORS.block;
  ctx.fillRect(100, GAME_HEIGHT - 56, 16, 16);

  // Draw "player" as square (pixel-art: 12x14 px), standing on ground
  ctx.fillStyle = COLORS.player;
  ctx.fillRect(150, GAME_HEIGHT - 54, 12, 14);

  // Draw "shadow" below player for a subtle effect
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#222';
  ctx.fillRect(151, GAME_HEIGHT - 41, 10, 3);
  ctx.globalAlpha = 1;
}

// PUBLIC_INTERFACE
const GameEngine = () => {
  const canvasRef = useRef();

  useEffect(() => {
    let running = true;
    let lastTime = performance.now();
    const frame = () => {
      if (!running) return;
      // Compute dt (for animation/future logic)
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Drawing
      const ctx = canvasRef.current?.getContext();
      if (ctx) {
        // Rendering placeholder pixel-art scene
        drawPlaceholderScene(ctx);
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
    return () => { running = false; };
  }, []);

  return (
    <div className="game-engine" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <GameCanvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        scale={PIXEL_SCALE}
      />
      <div style={{
        marginTop: '8px',
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#85c1e9',
        opacity: 0.7,
      }}>
        Pixel-art render demo – engine ready! <span role="img" aria-label="controller">🎮</span>
      </div>
    </div>
  );
};

export default GameEngine;
