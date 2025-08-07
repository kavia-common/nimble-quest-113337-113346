import React, { useRef, useEffect } from "react";
import "./App.css";

/**
 * Minimal pixel-art platformer React app.
 * Single canvas, keyboard controls, core platform physics.
 * No menus, overlays, HUD, or extra UI.
 */

// Game constants
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const PIXEL_SCALE = 2;
const PLAYER_WIDTH = 12;
const PLAYER_HEIGHT = 14;
const GROUND_HEIGHT = 40;
const MOVE_SPEED = 90;
const JUMP_VELOCITY = -195;
const GRAVITY = 650;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// PUBLIC_INTERFACE
function App() {
  const canvasRef = useRef(null);

  // Player state
  const player = useRef({
    x: 24,
    y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: false
  });

  // Keyboard state (arrows, WASD, space)
  const controls = useRef({
    left: false,
    right: false,
    jumpPressed: false,
    jump: false
  });

  // Keyboard event handlers - minimal only
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") controls.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") controls.current.right = true;
      if ([" ", "Spacebar", "w", "W", "ArrowUp"].includes(e.key)) {
        // Buffer jump (single shot)
        if (!controls.current.jump) controls.current.jumpPressed = true;
        controls.current.jump = true;
      }
    }
    function handleKeyUp(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") controls.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") controls.current.right = false;
      if ([" ", "Spacebar", "w", "W", "ArrowUp"].includes(e.key)) {
        controls.current.jump = false;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();

    function frame() {
      if (!running) return;
      const now = performance.now();
      const dt = clamp((now - lastTime) / 1000, 0, 0.045);
      lastTime = now;

      // --- Update player physics ---
      const p = player.current;
      // Move left/right
      if (controls.current.left) {
        p.vx = -MOVE_SPEED;
      } else if (controls.current.right) {
        p.vx = MOVE_SPEED;
      } else {
        p.vx = 0;
      }

      // Gravity
      p.vy += GRAVITY * dt;

      // Jump (if on ground)
      if (controls.current.jumpPressed && p.onGround) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
      }
      controls.current.jumpPressed = false;

      // Integrate position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Collide with ground
      let groundY = GAME_HEIGHT - GROUND_HEIGHT;
      if (p.y + PLAYER_HEIGHT >= groundY) {
        p.y = groundY - PLAYER_HEIGHT;
        p.vy = 0;
        p.onGround = true;
      } else {
        p.onGround = false;
      }

      // Collide with world edges
      if (p.x < 0) p.x = 0;
      if (p.x > GAME_WIDTH - PLAYER_WIDTH) p.x = GAME_WIDTH - PLAYER_WIDTH;
      if (p.y < 0) p.y = 0;

      // --- Draw ---
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        // Background
        ctx.save();
        ctx.fillStyle = "#232535";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.restore();

        // Platform ground (draw as blocks, pixel-art style)
        ctx.save();
        ctx.fillStyle = "#8fd462";
        ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
        ctx.strokeStyle = "#fff880";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);

        // Draw additional simple floating platforms for basic proto level (optional: for demo)
        ctx.fillStyle = "#bbed98";
        ctx.fillRect(85, 130, 48, 8);
        ctx.strokeRect(85, 130, 48, 8);
        ctx.fillRect(200, 95, 35, 8);
        ctx.strokeRect(200, 95, 35, 8);
        ctx.restore();

        // --- Player (block pixel guy) ---
        ctx.save();
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), PLAYER_WIDTH, PLAYER_HEIGHT);
        // Shadow
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#111";
        ctx.fillRect(Math.floor(p.x + 1), Math.floor(p.y + PLAYER_HEIGHT), PLAYER_WIDTH - 2, 3);
        ctx.globalAlpha = 1;
        ctx.restore();

        // --- Debug: Player AABB ---
        ctx.save();
        ctx.strokeStyle = p.onGround ? "#27e827" : "#ff5555";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(Math.floor(p.x), Math.floor(p.y), PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.restore();

        // --- Controls ---
        ctx.save();
        ctx.font = "bold 13px 'Press Start 2P', monospace";
        ctx.fillStyle = "#fffd";
        ctx.shadowColor = "#111";
        ctx.shadowBlur = 1.2;
        ctx.fillText("Minimal Platformer", 10, 21);
        ctx.font = "9px monospace";
        ctx.fillStyle = "#ffd700";
        ctx.shadowBlur = 0;
        ctx.fillText("← → or A/D to move, Space/W/↑ to jump", 13, 33);
        ctx.restore();
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    // On unmount, stop loop
    return () => {
      running = false;
    };
  }, []);

  // Autofocus canvas for keyboard (for future: mobile/gamepad can be added)
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.focus();
  }, []);

  // Canvas physical size management (pixel-perfect retro scaling)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GAME_WIDTH;
      canvas.height = GAME_HEIGHT;
      canvas.style.width = `${GAME_WIDTH * PIXEL_SCALE}px`;
      canvas.style.height = `${GAME_HEIGHT * PIXEL_SCALE}px`;
      canvas.style.background = "#181824";
      canvas.style.imageRendering = "pixelated";
    }
  }, []);

  // Render only the canvas, centered vertically and horizontally
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "var(--px-bg, #181824)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        tabIndex={0}
        className="pixel-canvas"
        style={{
          outline: "none",
          imageRendering: "pixelated",
          marginTop: "32px"
        }}
        aria-label="Core platformer game canvas"
      />
    </div>
  );
}

export default App;
