import React, { useRef, useEffect, useState } from 'react';
import GameCanvas from '../components/GameCanvas';
import Player from './Player';
import * as Physics from './Physics';
import LEVELS from './levels';
import { createEnemyInstance, updateEnemies } from './Enemy';
import { VisualEffects, ParallaxBackground } from './VisualEffects';

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

/*
 * --- GAME DIMENSIONS: Expanded World for XL Levels ---
 * All gameplay and rendering constants updated accordingly.
 */
const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;
const PIXEL_SCALE = 2;

const COLORS = {
  fallbackSky: '#9ad0ec',
  ground: '#3e4e3e',
  block: '#66e67e',
  exit: '#ef5bc2'
};

// Load parallax background layers (stub: replace with real images as needed)
const backgroundAssets = [];
let loadedBGImgs = [];

// Example: You may later place rich backgrounds in src/assets/img/bg_*.png
function loadParallaxBGImages() {
  // Preload up to three layers for parallax, real assets should be added here
  if (!backgroundAssets.length) {
    ['bg_layer0', 'bg_layer1', 'bg_layer2'].forEach((base, idx) => {
      const img = new window.Image();
      // For now, fallback to color stripes or gradients. Replace with pixel-art .pngs to upgrade.
      img.src = '';
      if (!img.src) {
        // Fallback: draw a gradient to canvas, then export as image
        const c = document.createElement('canvas');
        c.width = 800; c.height = 180;
        const ctx = c.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 0, 180);
        if (idx === 0) {
          g.addColorStop(0, '#1e242c'); g.addColorStop(1, '#7cada5');
        } else if (idx === 1) {
          g.addColorStop(0, 'rgba(38,137,179,0.83)'); g.addColorStop(1, 'rgba(221,210,172,0.14)');
        } else {
          g.addColorStop(0, 'rgba(215, 226, 255, .14)'); g.addColorStop(1, '#18182400');
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 800, 180);
        img.src = c.toDataURL();
      }
      backgroundAssets.push({ img, speed: 0.12 + 0.13 * idx, repeat: 'x' });
    });
    loadedBGImgs = backgroundAssets;
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// --- Visual enhancement state (setup once and on level change) ---
let parallaxBG = null;
function getOrInitParallaxBG(width, height) {
  if (!loadedBGImgs.length) loadParallaxBGImages();
  if (!parallaxBG) {
    parallaxBG = new ParallaxBackground(loadedBGImgs, width, height);
  }
  return parallaxBG;
}

// Keyboard mapping: Simple acrobatics/arrow/wasd
const KEYMAP = {
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  jump: [' ', 'Spacebar', 'w', 'W', 'ArrowUp'],
  dash: ['Shift', 'ShiftLeft', 'ShiftRight'],
  glide: ['z', 'Z'] // Use Z as the gliding key (can be changed)
};

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

/**
 * GameEngine - Main orchestrator for multi-level loop, rendering, and simulation.
 * Props:
 *   - lives, score, gems, maxGems, level: Top-level persistent values (display only)
 *   - onGameStateUpdate({score, lives, gems, maxGems, level}): callback when any state value changes
 *   - onGameOver(), onNextLevel({levelName}), onAllLevelsComplete()
 *   - gameFlowOverlay: parent-controlled overlay for game over/level complete, disables gameplay if set
 *   - onDismissOverlay: handler to clear overlay
 */
const GameEngine = ({
  lives = 3,
  score = 0,
  gems = 0,
  maxGems = 0,
  level = 0,
  onGameStateUpdate,
  onGameOver,
  onNextLevel,
  onAllLevelsComplete,
  gameFlowOverlay,
  onDismissOverlay
}) => {
  const canvasRef = useRef();
  const [levelIdx, setLevelIdx] = useState(level || 0);
  const [levelState, setLevelState] = useState({
    gems: [],
    completed: false,
    transitioning: false,
    message: ''
  });
  const [forceRerender, setForceRerender] = useState(0); // used to trigger UI rerender on some state changes

  // Player state: persists for lives/score
  const playerRef = useRef(new Player({ x: 16, y: 120 }));

  // Top-level persistent counters per run
  const [pLives, setPLives] = useState(lives);
  const [pScore, setPScore] = useState(score);
  const [pGems, setPGems] = useState(gems);
  const [pMaxGems, setPMaxGems] = useState(maxGems);

  // On level change: reset local state, set maxGems, but keep persistent values
  useEffect(() => {
    if (LEVELS[levelIdx]) {
      const gemCopies = LEVELS[levelIdx].gems.map(g => ({ ...g, collected: false }));
      setLevelState({
        gems: gemCopies,
        completed: false,
        transitioning: false,
        message: ''
      });
      setPMaxGems(LEVELS[levelIdx].gems.length);
      // Reset player
      playerRef.current = new Player({ x: 16, y: 120 });
    }
    // Report to top-level that level index changed (with persisted counters)
    if (onGameStateUpdate)
      onGameStateUpdate({
        score: pScore,
        lives: pLives,
        gems: 0,
        maxGems: LEVELS[levelIdx]?.gems.length ?? 0,
        level: levelIdx
      });
    // eslint-disable-next-line
  }, [levelIdx]);

  // Controls
  const controlsRef = useRef({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    dashPressed: false,
    glide: false // <--- New state for gliding
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
      if (KEYMAP.glide.includes(e.key)) {
        controlsRef.current.glide = true;
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
      if (KEYMAP.glide.includes(e.key)) {
        controlsRef.current.glide = false;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Checks for gem collection and exit, and returns relevant event triggers.
  function processLevelLogic(player, curLevel, gemsArr, setGems, onLevelComplete, updateCount) {
    let foundGem = false;

    // --- Accurate collectible (gem) AABB collision using player.overlapsRect ---
    gemsArr.forEach((gem) => {
      if (!gem.collected && player.overlapsRect(gem.x - 6, gem.y - 6, 12, 12)) {
        gem.collected = true;
        foundGem = true;
        setGems(gemsArr.slice());
        setForceRerender(n => n + 1);
        setPGems(prev => {
          const newVal = prev + 1;
          if (onGameStateUpdate)
            onGameStateUpdate({ score: pScore, lives: pLives, gems: newVal, maxGems: pMaxGems, level: levelIdx });
          return newVal;
        });
        setPScore(prevS => {
          const nextS = prevS + 250;
          if (onGameStateUpdate)
            onGameStateUpdate({ score: nextS, lives: pLives, gems: pGems + 1, maxGems: pMaxGems, level: levelIdx });
          return nextS;
        });
      }
    });

    // --- Exit completion if all gems collected and player overlaps exit ---
    if (gemsArr.every(g => g.collected)) {
      if (
        player.overlapsRect(curLevel.exit.x, curLevel.exit.y, curLevel.exit.w, curLevel.exit.h)
      ) {
        onLevelComplete();
      }
    }
  }

  // Draws platforms, exit, gems, etc. for the level
  function drawLevel(ctx, curLevel, gems, completed, enemyState, projectiles) {
    // ---- NEW: draw multi-layer parallax or static background ----
    if (!parallaxBG) parallaxBG = getOrInitParallaxBG(GAME_WIDTH, GAME_HEIGHT);
    if (parallaxBG && typeof parallaxBG.draw === "function") {
      // Optionally, scrollX could be hooked to player.x for side-scrolling
      const scrollDX = 0; // For now: 0, for world1, later tie to camera
      parallaxBG.draw(ctx, scrollDX);
    } else {
      ctx.fillStyle = curLevel.bgColor || COLORS.fallbackSky;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

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

    // Draw enemies
    // Enemies should have per-type animation and visuals
    // cache loaded image outside loop
    if (!ctx._modernSlimeImg) {
      ctx._modernSlimeImg = new window.Image();
      ctx._modernSlimeImg.src = require("../assets/img/slime_modern.png");
      ctx._modernSlimeImgLoaded = false;
      ctx._modernSlimeImg.onload = () => { ctx._modernSlimeImgLoaded = true; };
    }
    enemyState.forEach(en => {
      ctx.save();
      if (en.type === "walker") {
        // Modern pixel-art slime
        if (ctx._modernSlimeImg && ctx._modernSlimeImg.complete && ctx._modernSlimeImg.naturalWidth > 0) {
          ctx.drawImage(ctx._modernSlimeImg, en.x, en.y, 14, 12);
        } else {
          // fallback: colored rectangle while image loads
          ctx.fillStyle = "#f47350";
          ctx.fillRect(en.x, en.y, 14, 12);
        }
      } else if (en.type === "hopper") {
        ctx.fillStyle = "#53b0ef";
        ctx.fillRect(en.x, en.y, 12, 13);
        // simple frog eyes
        ctx.fillStyle = "#fff";
        ctx.fillRect(en.x+2, en.y+2, 2, 2);
        ctx.fillRect(en.x+8, en.y+2, 2, 2);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(en.x, en.y, 12, 13);
      } else if (en.type === "chaser") {
        ctx.fillStyle = "#b359fe";
        ctx.fillRect(en.x, en.y, 14, 12);
        ctx.fillStyle = "#222";
        ctx.fillRect(en.x+6, en.y+4, 2, 2); // single pixel nose, "ghost"
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(en.x, en.y, 14, 12);
      } else if (en.type === "projectile") {
        ctx.fillStyle = "#ff951d";
        ctx.beginPath();
        ctx.arc(en.x+7, en.y+7, 7, 0, 2*Math.PI); // round thrower
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
      ctx.restore();
    });

    // Projectiles (round bullets, fireballs)
    projectiles.forEach(proj => {
      ctx.save();
      ctx.fillStyle = "#ffed33";
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c88e25";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  }

  // --- ENEMY LOGIC/RENDER STATE ---
  // Expanded enemies system: walker (patrol), chaser (AI pursue), hopper (jumping), projectile-shooter
  const [enemiesState, setEnemiesState] = useState([]);
  // Projectiles from projectile-throwers
  const [projectiles, setProjectiles] = useState([]);

  // Initialize enemy state per-level, with proper state for each enemy type
  useEffect(() => {
    if (!LEVELS[levelIdx]) return;
    // Instantiate autonomous AI per enemy (use new Enemy.js logic where possible)
    setEnemiesState(
      LEVELS[levelIdx].enemies.map(e => {
        // Use new AI classes for walker (slime)
        return createEnemyInstance({ ...e });
      })
    );
    setProjectiles([]);
  }, [levelIdx]);

  // Main game/animation loop -- all logic for AI, player, collisions, rendering
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();
    let defeatTimeoutHandle = null;
    let defeatFlash = false;

    function defeatPlayer() {
      if (defeatTimeoutHandle) return;
      defeatFlash = true;
      setLevelState(ls => ({
        ...ls,
        transitioning: true,
        message: pLives > 1
          ? "Defeated! Life lost..."
          : "Defeated! Final life..."
      }));
      setPLives(l => {
        const nextLives = Math.max(0, l - 1);
        if (onGameStateUpdate)
          onGameStateUpdate({ score: pScore, lives: nextLives, gems: pGems, maxGems: pMaxGems, level: levelIdx });
        return nextLives;
      });
      defeatTimeoutHandle = setTimeout(() => {
        // End game if out of lives, else replay level
        if (pLives - 1 <= 0) {
          if (onGameOver) onGameOver();
        } else {
          // --- Restart level: Construct a fresh Player instance to restore jump/dash state ---
          playerRef.current = new Player({ x: 16, y: 120 });
          setLevelIdx(idx => idx); // triggers useEffect; also resets levelState, etc.
          setPScore(prevS => prevS); // score persists
          setPGems(0); // reset collected for level
        }
      }, 1700);
    }

    function frame() {
      if (!running) return;
      if (!LEVELS[levelIdx]) return;
      if (levelState.transitioning) return;

      const now = performance.now();
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      dt = clamp(dt, 0, 0.045);

      const curLevel = LEVELS[levelIdx];
      const controls = controlsRef.current;
      const player = playerRef.current;

      // --- ENEMY AI UPDATE & PROJECTILES ---
      // Deep-clone for stateful update
      let newEnemies = enemiesState.map(en => {
        // If using new AI class, keep as is. If plain object, clone.
        if (typeof en.update === "function") {
          return en;
        } else {
          return { ...en };
        }
      });
      let newProjectiles = projectiles.map(p => ({ ...p }));

      // Add: autonomous enemy movement (slime AI)
      updateEnemies(newEnemies, dt);

      for (let en of newEnemies) {
        // PATROLLER/WALKER: Moves back and forth horizontally between patrolMin/patrolMax
        if (en.type === "walker") {
          en.x += en.dir * (en.speed ?? 36) * dt;
          en.x = clamp(en.x, en.patrolMin ?? 0, en.patrolMax ?? GAME_WIDTH - 14);
          if ((en.dir === 1 && en.x >= (en.patrolMax ?? GAME_WIDTH - 14)) ||
              (en.dir === -1 && en.x <= (en.patrolMin ?? 0))) en.dir *= -1;
        }
        // HOPPER (JUMPING ENEMY): Jump when timer runs out, changes direction, simple platform ground logic
        else if (en.type === "hopper") {
          // Timer ticks down
          en.jumpTimer -= dt;
          // Basic gravity if in air
          if (!en.vy) en.vy = 0;
          if (!en.onGround) en.vy += 440 * dt;
          let nextY = en.y + en.vy * dt;
          let grounded = false;
          // Platform/platforms collision only below (landing)
          for (let pl of curLevel.platforms) {
            if (
              en.x + 11 > pl.x &&
              en.x < pl.x + pl.w &&
              nextY + 13 > pl.y &&
              en.y+10 < pl.y &&
              nextY + 13 <= pl.y + pl.h
            ) {
              grounded = true;
              nextY = pl.y - 13;
              en.vy = 0;
              break;
            }
          }
          // World ground (bottom edge)
          if (nextY + 13 > GAME_HEIGHT - 20) {
            grounded = true;
            nextY = GAME_HEIGHT - 20 - 13;
            en.vy = 0;
          }
          en.onGround = grounded;
          en.y = nextY;

          // When grounded and timer expired, jump and reverse direction
          if (en.onGround && en.jumpTimer <= 0) {
            en.vy = en.jumpVy || -110;
            en.dir *= -1;
            en.jumpTimer = en.jumpCooldown || 1.3;
            en.x += en.dir * 12;
            en.x = clamp(en.x, 0, GAME_WIDTH-12);
          } else if (!en.onGround) {
            en.x += en.dir * 44 * dt;
            en.x = clamp(en.x, 0, GAME_WIDTH-12);
          }
        }
        // CHASER (PURSUER): Moves toward player if within horizontal range + similar vertical level
        else if (en.type === "chaser") {
          let dx = player.x - en.x;
          let dy = Math.abs(player.y - en.y);
          if (Math.abs(dx) < (en.activeRange ?? 90) && dy < 30) {
            en.x += Math.sign(dx) * (en.speed ?? 52) * dt;
            en.x = clamp(en.x, 0, GAME_WIDTH-14);
          }
        }
        // PROJECTILE-SHOOTING ENEMY: Fires projectiles at intervals in its dir
        else if (en.type === "projectile") {
          en.t = en.t ? en.t + dt : dt;
          if (!en.cooldown) en.cooldown = 2.5;
          if (en.t >= en.cooldown) {
            newProjectiles.push({
              x: en.x+7,
              y: en.y+10,
              vx: (en.dir??1) * 110,
              vy: 0,
              t: 0
            });
            en.t = 0;
          }
        }
      }

      // Move projectiles, remove out-of-bounds
      for (let i = 0; i < newProjectiles.length; ++i) {
        let p = newProjectiles[i];
        p.x += p.vx * dt;
        p.y += (p.vy ?? 0) * dt;
      }
      newProjectiles = newProjectiles.filter(p => p.x > -10 && p.x < GAME_WIDTH+10);

      setEnemiesState(newEnemies);
      setProjectiles(newProjectiles);

      // PLAYER UPDATE (including platform collision)
      // Update player using improved flush-ground/platform logic. Pass platform list for physics utility.
      player.update(
        dt,
        {
          left: controls.left,
          right: controls.right,
          jumpPressed: controls.jumpPressed,
          dashPressed: controls.dashPressed,
          glide: controls.glide // Pass current gliding state
        },
        // Custom collision tester — allow pixel-perfect AABB resolution
        (x, y, w, h) => {
          // Classic: check if player-box overlaps with any level platform
          for (let pl of curLevel.platforms) {
            if (
              x < pl.x + pl.w &&
              x + w > pl.x &&
              y < pl.y + pl.h &&
              y + h > pl.y
            ) {
              // For debugging, highlight which platform was touched
              player._debugLastCollidePlatform = pl;
              return true;
            }
          }
          player._debugLastCollidePlatform = null;
          return false;
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
          // Level complete, score bonus
          setPScore(prevS => {
            const nextS = prevS + 1000;
            if (onGameStateUpdate)
              onGameStateUpdate({ score: nextS, lives: pLives, gems: pGems, maxGems: pMaxGems, level: levelIdx });
            return nextS;
          });
          setLevelState(ls => ({ ...ls, completed: true, transitioning: true, message: 'Level Complete!' }));
          if (onNextLevel && levelIdx + 1 < LEVELS.length) {
            onNextLevel({ levelName: LEVELS[levelIdx + 1].name });
          } else if (onAllLevelsComplete && levelIdx + 1 >= LEVELS.length) {
            onAllLevelsComplete();
          }
          // Delay actual transition, overlay is handled externally
          setTimeout(() => {
            if (levelIdx + 1 < LEVELS.length) {
              setPLives(l => l); // carry lives
              setLevelIdx(levelIdx + 1);
              setPGems(0); // new level, reset gems
            }
          }, 1900);
        },
        setForceRerender
      );

      // --- FALLING OFF MAP = DEATH ---
      // Detect if player has fallen too far below level; trigger defeat if so.
      const FALL_DEATH_Y = GAME_HEIGHT + 32;
      if (!levelState.completed && !levelState.transitioning && player.y > FALL_DEATH_Y) {
        defeatPlayer();
      }

      // ENEMY & PROJECTILE COLLISION with player
      // (If player collides with any enemy or projectile, defeat)
      let px = player.x, py = player.y, pw = 12, ph = 14;
      if (!levelState.completed && !levelState.transitioning) {
        for (let en of newEnemies) {
          let ew = (en.type === "hopper") ? 12 : 14;
          let eh = (en.type === "hopper") ? 13 : 12;
          if (["walker", "hopper", "chaser"].includes(en.type)
            && rectsOverlap(px, py, pw, ph, en.x, en.y, ew, eh)) {
            defeatPlayer();
            break;
          }
        }
        for (let p of newProjectiles) {
          if (rectsOverlap(px, py, pw, ph, p.x - 3, p.y - 3, 7, 7)) {
            defeatPlayer();
            break;
          }
        }
      }

      // --- RENDERING ---
      const ctx = canvasRef.current?.getContext();
      if (ctx) {
        // defeat flash effect
        if (defeatFlash) {
          ctx.save();
          ctx.globalAlpha = 0.45 + 0.35 * Math.abs(Math.sin(performance.now()*0.008));
          ctx.fillStyle = "#e74c3ca9";
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
          ctx.restore();
        }

        drawLevel(ctx, curLevel, levelState.gems, levelState.completed, newEnemies, newProjectiles);

        // Draw player (after enemies for "in front" effect)
        player.draw(ctx);

        // --- DEBUG: Draw platforms and gem hitboxes ---
        const debug = true;
        if (debug) {
          // Platform AABBs
          ctx.save();
          ctx.strokeStyle = "#2287d6";
          ctx.lineWidth = 1;
          for (let pl of curLevel.platforms) {
            ctx.setLineDash([1,2]);
            ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
          }
          ctx.restore();

          // Collectible (gem) bounding boxes
          ctx.save();
          levelState.gems.forEach(gem => {
            ctx.setLineDash([2,2]);
            ctx.strokeStyle = gem.collected ? "#e67e2299" : "#ff32d7";
            ctx.globalAlpha = 0.9;
            ctx.strokeRect(gem.x - 6, gem.y - 6, 12, 12);
          });
          ctx.restore();
        }

        // Draw meta labels
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

        // --- MODERN-RETRO FINAL: CRT/Scanline/Palette Postprocessing ---
        // (Optional: toggle with future user settings)
        if (typeof VisualEffects?.applyCRTPass === "function") {
          VisualEffects.applyCRTPass(ctx.canvas, { strength: 0.23, scanlineOpacity: 0.19, bloom: 0.08 });
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { 
      running = false;
      if (defeatTimeoutHandle) clearTimeout(defeatTimeoutHandle);
    };
    // eslint-disable-next-line
  }, [levelIdx, levelState.transitioning]);

  // Autofocus canvas for keyboard input (optional UX improvement)
  useEffect(() => {
    if (canvasRef.current?.getCanvas) canvasRef.current.getCanvas().focus();
  }, [levelIdx]);

  // Restart level logic
  const restartLevel = () => {
    if (!gameFlowOverlay) setLevelIdx(lidx => lidx);
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
      {levelState.transitioning && !gameFlowOverlay && (
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
          disabled={!!gameFlowOverlay}
        >
          Restart Level
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
