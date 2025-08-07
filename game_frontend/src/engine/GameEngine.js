import React, { useRef, useEffect, useState } from 'react';
import GameCanvas from '../components/GameCanvas';
import Player from './Player';
import * as Physics from './Physics';
import LEVELS from './levels';

/**
 * GameEngine - Main orchestrator for multi-level loop, rendering, and simulation.
 * 
 * Expands to support:
 *  - Multiple levels (level data/array)
 *  - Per-level platform/entity rendering
 *  - Goal checking: collect all gems, reach exit
 *  - Level transition UI (next level prompt, win, restart, etc.)
 *  - Sample enemies stub (walker/hopper to wire in future)
 */

const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const PIXEL_SCALE = 2;

const COLORS = {
  fallbackSky: '#9ad0ec',
  ground: '#3e4e3e',
  block: '#66e67e',
  exit: '#ef5bc2'
};

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

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

// PUBLIC_INTERFACE
const GameEngine = () => {
  const canvasRef = useRef();
  const [levelIdx, setLevelIdx] = useState(0);
  const [levelState, setLevelState] = useState({
    gems: [],
    completed: false,
    transitioning: false,
    message: ''
  });
  const [forceRerender, setForceRerender] = useState(0); // used to trigger UI rerender on some state changes

  // playerRef must be reset per level
  const playerRef = useRef(new Player({ x: 16, y: 120 }));

  // re-init state when level changes
  useEffect(() => {
    if (LEVELS[levelIdx]) {
      // Deep copy gems to allow collection state
      const gemCopies = LEVELS[levelIdx].gems.map(g => ({ ...g, collected: false }));
      setLevelState({
        gems: gemCopies,
        completed: false,
        transitioning: false,
        message: ''
      });
      // Reset player
      playerRef.current = new Player({ x: 16, y: 120 });
    }
  }, [levelIdx]);

  // Controls
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
        controlsRef.current.jumpPressed = false;
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

  // Checks for gem collection and exit
  function processLevelLogic(player, curLevel, gems, setGems, onLevelComplete, updateCount) {
    let foundGem = false;
    const px = player.x + 3, py = player.y + 7;

    // Collect gems if touching (small radius for precision)
    gems.forEach((gem, i) => {
      if (!gem.collected &&
          Math.abs(px - gem.x) < 10 &&
          Math.abs(py - gem.y) < 12) {
        gem.collected = true;
        foundGem = true;
        setGems(gems.slice());
        setForceRerender(n => n+1); // force react update (primitive state)
      }
    });

    // All gems collected + player at exit -> beat level
    if (gems.every(g => g.collected)) {
      // Exit detection
      if (
        rectsOverlap(
          player.x, player.y, 12, 14,
          curLevel.exit.x, curLevel.exit.y, curLevel.exit.w, curLevel.exit.h
        )) {
        onLevelComplete();
      }
    }
  }

  // Draws platforms, exit, gems, etc. for the level
  function drawLevel(ctx, curLevel, gems, completed) {
    ctx.fillStyle = curLevel.bgColor || COLORS.fallbackSky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw platforms
    curLevel.platforms.forEach(pl => {
      ctx.fillStyle = '#88bc7f';
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
      ctx.strokeStyle = '#fff880';
      ctx.lineWidth = 1;
      ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
    });

    // Draw exit
    ctx.fillStyle = completed ? '#cd7bff' : COLORS.exit;
    ctx.fillRect(curLevel.exit.x, curLevel.exit.y, curLevel.exit.w, curLevel.exit.h);
    ctx.strokeStyle = '#fffd';
    ctx.strokeRect(curLevel.exit.x, curLevel.exit.y, curLevel.exit.w, curLevel.exit.h);

    // Draw gems
    gems.forEach(gem => {
      ctx.save();
      ctx.globalAlpha = gem.collected ? 0.20 : 1.0;
      ctx.fillStyle = gem.collected ? '#ddc97b' : '#ffd700';
      ctx.beginPath();
      ctx.arc(gem.x, gem.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff880';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });

    // Demo: Draw enemies stub
    curLevel.enemies.forEach(en => {
      ctx.save();
      if (en.type === "walker") {
        ctx.fillStyle = '#f47350';
        ctx.fillRect(en.x, en.y, 14, 12);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(en.x, en.y, 14, 12);
      } else if (en.type === "hopper") {
        ctx.fillStyle = '#53b0ef';
        ctx.fillRect(en.x, en.y, 12, 13);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(en.x, en.y, 12, 13);
      }
      ctx.restore();
    });
  }

  // Main game/animation loop -- handles per-level render and logic
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();

    function frame() {
      if (!running) return;
      if (!LEVELS[levelIdx]) return; // level bounds check
      if (levelState.transitioning) return; // pause during message

      const now = performance.now();
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      dt = clamp(dt, 0, 0.045);

      const curLevel = LEVELS[levelIdx];
      const controls = controlsRef.current;
      const player = playerRef.current;

      // Update player with per-level ground/platform collision
      player.update(
        dt,
        {
          left: controls.left,
          right: controls.right,
          jumpPressed: controls.jumpPressed,
          dashPressed: controls.dashPressed
        },
        (x, y, w, h) => {
          // collide with any platforms or ground
          // test overlap for any platform
          return curLevel.platforms.some(pl =>
            rectsOverlap(x, y, w, h, pl.x, pl.y, pl.w, pl.h)
          );
        }
      );
      controlsRef.current.jumpPressed = false;
      controlsRef.current.dashPressed = false;

      // Level logic (gems, exit, etc.)
      processLevelLogic(
        player,
        curLevel,
        levelState.gems,
        (newGems) => setLevelState(ls => ({ ...ls, gems: newGems })),
        () => {
          // Level complete!
          setLevelState(ls => ({ ...ls, completed: true, transitioning: true, message: 'Level Complete!' }));
          // Next level after brief pause
          setTimeout(() => {
            if (levelIdx + 1 < LEVELS.length) {
              setLevelIdx(levelIdx + 1);
            } else {
              setLevelState({
                ...levelState,
                completed: true,
                transitioning: true,
                message: "All Levels Complete! 🎉"
              });
            }
          }, 1800);
        },
        setForceRerender
      );

      // Render everything
      const ctx = canvasRef.current?.getContext();
      if (ctx) {
        drawLevel(ctx, curLevel, levelState.gems, levelState.completed);

        // Draw player
        player.draw(ctx);

        // Draw current level name label
        ctx.save();
        ctx.font = "bold 13px 'Press Start 2P', monospace";
        ctx.fillStyle = "#fffd";
        ctx.shadowColor = "#111";
        ctx.shadowBlur = 1.5;
        ctx.fillText(curLevel.name, 14, 21);
        ctx.font = "9px monospace";
        ctx.fillStyle = "#ffd700";
        ctx.shadowBlur = 0;
        ctx.fillText(curLevel.objective || "", 17, 33);
        ctx.restore();

        // Completion/transition message overlay
        if (levelState.transitioning && levelState.message) {
          ctx.save();
          ctx.globalAlpha = 0.91;
          ctx.fillStyle = "#181824e6";
          ctx.fillRect(30, 60, 260, 50);
          ctx.strokeStyle = "#fffd";
          ctx.lineWidth = 3;
          ctx.strokeRect(30, 60, 260, 50);
          ctx.font = "20px 'Press Start 2P', monospace";
          ctx.fillStyle = "#ffd700";
          ctx.fillText(levelState.message, 52, 90);
          ctx.restore();
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { running = false; };
    // include levelIdx and levelState as deps so changes force new effect/memory
    // eslint-disable-next-line
  }, [levelIdx, levelState.transitioning]);

  // Autofocus canvas for keyboard input (optional UX improvement)
  useEffect(() => {
    if (canvasRef.current?.getCanvas) canvasRef.current.getCanvas().focus();
  }, [levelIdx]);

  // Restart level logic (future: loss/fail or player-requested)
  const restartLevel = () => {
    setLevelIdx(lidx => lidx);
  };

  // Render main engine UI + level transition info
  const curLevel = LEVELS[levelIdx];
  return (
    <div className="game-engine" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
        {curLevel.name} | <b>{(levelState.gems.filter(g => g.collected).length)} / {levelState.gems.length} Gems</b>
        {" "} | Level {levelIdx + 1} of {LEVELS.length}
        <br />
        {curLevel.objective && <span style={{ color: "#ddd" }}>{curLevel.objective}</span>}
        {!levelState.completed && <span>
          {" "}Use ← → (A/D) to move, Space/W/↑ to jump, Shift to dash. <span role="img" aria-label="controller">🎮</span>
        </span>}
        {levelState.completed &&
          <div style={{
            color: "#ffd700", fontWeight: 700, marginTop: 8, fontSize: "1.1em"
          }}>
            Level Complete! {levelIdx + 1 < LEVELS.length ? "Get ready for the next..." : "You win!"}
          </div>
        }
      </div>
      {levelState.transitioning && (
        <div style={{
          position: 'absolute',
          top: 65, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          background: '#181824e6',
          color: '#ffd700',
          border: '4px solid #fff880',
          minWidth: 270,
          padding: '18px 23px',
          fontSize: 19,
          fontFamily: "'Press Start 2P', monospace",
          textAlign: 'center',
          boxShadow: '0 0 13px #17172477'
        }}>
          {levelState.message}
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <button
          className="px-btn"
          style={{ fontSize: "1rem", marginTop: 4, padding: "2px 25px" }}
          onClick={restartLevel}
        >
          Restart Level
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
