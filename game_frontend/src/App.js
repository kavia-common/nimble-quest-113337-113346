import React, { useRef, useEffect, useState } from "react";
import "./App.css";

/**
 * Minimal pixel-art platformer with:
 * - Collectible gems per level (disappear on touch, count toward total)
 * - One patrolling enemy (touch = reset/penalty)
 * - Two simple levels (objectives, level switching, state reset)
 * - Keyboard controls (arrows, WASD, space)
 * All logic self-contained in this single file for the base prototype.
 */

// --- Constants ---
const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const PIXEL_SCALE = 2;
const PLAYER_W = 12, PLAYER_H = 14;
const ENEMY_W = 14, ENEMY_H = 12;
const GEM_RADIUS = 6;
const GROUND_HEIGHT = 40;
const MOVE_SPEED = 90;
const JUMP_VEL = -195;
const GRAVITY = 650;

// --- Levels Definition (2 levels) ---
const LEVELS = [
  {
    name: "Level 1: The Garden Gate",
    platforms: [
      { x: 0, y: 140, w: 320, h: 40 }, // ground
      { x: 85, y: 130, w: 48, h: 8 },
      { x: 200, y: 95, w: 35, h: 8 }
    ],
    gems: [
      { x: 110, y: 124 },
      { x: 220, y: 140 },
      { x: 215, y: 103 }
    ],
    enemy: {
      x: 160, y: 128, patrolMin: 85, patrolMax: 170, dir: 1, speed: 38
    },
    playerStart: { x: 24, y: 100 },
    bg: "#232535"
  },
  {
    name: "Level 2: Ruins and Relics",
    platforms: [
      { x: 0, y: 140, w: 140, h: 40 },    // left ground
      { x: 170, y: 150, w: 150, h: 30 },  // right ground (a little higher)
      { x: 50, y: 112, w: 36, h: 8 },
      { x: 202, y: 95, w: 40, h: 8 },
      { x: 266, y: 125, w: 35, h: 8 }
    ],
    gems: [
      { x: 65, y: 100 },
      { x: 218, y: 103 },
      { x: 279, y: 127 }
    ],
    enemy: {
      x: 220, y: 120, patrolMin: 210, patrolMax: 290, dir: -1, speed: 42
    },
    playerStart: { x: 23, y: 80 },
    bg: "#344960"
  }
];

// --- Helper functions ---

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Axis-aligned bounding box collision
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
// Circle-rect overlap (for player-gem)
function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

// --- PUBLIC_INTERFACE ---
function App() {
  const canvasRef = useRef(null);

  // --- Level state ---
  const [curLevel, setCurLevel] = useState(0);
  const [transitionTimer, setTransitionTimer] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  // For UI feedback
  const [hud, setHud] = useState({ gems: 0, lives: 3, msg: "", allGems: 0 });

  // --- Player state ---
  const player = useRef({
    x: LEVELS[curLevel].playerStart.x,
    y: LEVELS[curLevel].playerStart.y,
    vx: 0,
    vy: 0,
    onGround: false
  });

  // --- Gems state (regenerate on level load) ---
  const [gems, setGems] = useState(
    LEVELS[curLevel].gems.map(g => ({ ...g, collected: false }))
  );
  
  // --- Enemy state (single patrol enemy per level) ---
  const [enemy, setEnemy] = useState({ ...LEVELS[curLevel].enemy });

  // --- Lives count (reset on entire game restart) ---
  const [lives, setLives] = useState(3);

  // --- Controls state ---
  const controls = useRef({
    left: false,
    right: false,
    jumpPressed: false,
    jump: false
  });

  // --- Handle keyboard events ---
  useEffect(() => {
    function handleKeyDown(e) {
      if (["ArrowLeft", "a", "A"].includes(e.key)) controls.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) controls.current.right = true;
      if ([" ", "Spacebar", "w", "W", "ArrowUp"].includes(e.key)) {
        if (!controls.current.jump) controls.current.jumpPressed = true;
        controls.current.jump = true;
      }
      // Restart trigger, only if level is complete
      if ((e.key === "Enter" || e.key === "n" || e.key === "N") && levelComplete) {
        startNextLevel();
      }
      if ((e.key === "r" || e.key === "R") && !transitionTimer) {
        restartLevel();
      }
    }
    function handleKeyUp(e) {
      if (["ArrowLeft", "a", "A"].includes(e.key)) controls.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) controls.current.right = false;
      if ([" ", "Spacebar", "w", "W", "ArrowUp"].includes(e.key)) controls.current.jump = false;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelComplete, transitionTimer]);

  // --- Restart the current level ---
  function restartLevel() {
    setHud((h) => ({ ...h, msg: "" }));
    player.current = {
      x: LEVELS[curLevel].playerStart.x,
      y: LEVELS[curLevel].playerStart.y,
      vx: 0,
      vy: 0,
      onGround: false
    };
    setGems(LEVELS[curLevel].gems.map(g => ({ ...g, collected: false })));
    setEnemy({ ...LEVELS[curLevel].enemy });
    setLevelComplete(false);
    setTransitionTimer(0);
  }

  // --- Move to the next level ---
  function startNextLevel() {
    let nextIdx = curLevel + 1;
    if (nextIdx >= LEVELS.length) {
      // All levels complete
      setHud(h => ({
        ...h,
        msg: "Game complete! Press R to restart.",
        gems: 0
      }));
      setCurLevel(0);
      setLives(3);
      player.current = {
        x: LEVELS[0].playerStart.x,
        y: LEVELS[0].playerStart.y,
        vx: 0,
        vy: 0,
        onGround: false
      };
      setGems(LEVELS[0].gems.map(g => ({ ...g, collected: false })));
      setEnemy({ ...LEVELS[0].enemy });
      setLevelComplete(false);
      setTransitionTimer(0);
      return;
    }

    setCurLevel(nextIdx);
    setHud(h => ({
      ...h,
      msg: "",
      gems: 0
    }));
    setLevelComplete(false);
    setTransitionTimer(0);
    setTimeout(() => {
      player.current = {
        x: LEVELS[nextIdx].playerStart.x,
        y: LEVELS[nextIdx].playerStart.y,
        vx: 0,
        vy: 0,
        onGround: false
      };
      setGems(LEVELS[nextIdx].gems.map(g => ({ ...g, collected: false })));
      setEnemy({ ...LEVELS[nextIdx].enemy });
    }, 50);
  }

  // --- On level or lives change: reset player, gems, enemy ---
  useEffect(() => {
    player.current = {
      x: LEVELS[curLevel].playerStart.x,
      y: LEVELS[curLevel].playerStart.y,
      vx: 0,
      vy: 0,
      onGround: false
    };
    setGems(LEVELS[curLevel].gems.map(g => ({ ...g, collected: false })));
    setEnemy({ ...LEVELS[curLevel].enemy });
    setHud(h => ({
      ...h,
      allGems: LEVELS[curLevel].gems.length,
      gems: 0,
      msg: ""
    }));
    setLevelComplete(false);
    setTransitionTimer(0);
    // eslint-disable-next-line
  }, [curLevel, lives]);

  // --- Main game loop logic and rendering ---
  useEffect(() => {
    let running = true;
    let lastTime = performance.now();
    let deathTimer = 0; // defeat delay
    let penaltyFlash = 0; // penalty flash counter
    let firstComplete = false;

    // PUBLIC_INTERFACE
    function defeatPlayer() {
      // Handles defeat: decrements life, triggers death timer, sets HUD
      setHud(h => ({
        ...h,
        msg: lives > 1 ? "Ouch! Life lost." : "Game over! Press R to restart.",
        gems: 0
      }));
      // Death/restart fully handled in main loop via deathTimer, so just flag here
    }

    function frame() {
      if (!running) return;
      const now = performance.now();
      let dt = clamp((now - lastTime) / 1000, 0, 0.045);
      lastTime = now;

      // References for easy access
      const L = LEVELS[curLevel];
      const p = player.current;

      // --- ENEMY update: simple patrol logic ---
      let nextEnemy = { ...enemy };
      nextEnemy.x += nextEnemy.dir * nextEnemy.speed * dt;
      if (nextEnemy.x < nextEnemy.patrolMin) {
        nextEnemy.x = nextEnemy.patrolMin;
        nextEnemy.dir = 1;
      }
      if (nextEnemy.x > nextEnemy.patrolMax) {
        nextEnemy.x = nextEnemy.patrolMax;
        nextEnemy.dir = -1;
      }
      setEnemy(nextEnemy);

      // --- PLATFORM collision: find platform we're standing on
      let isOnGround = false;
      let groundY = GAME_HEIGHT;
      for (let pl of L.platforms) {
        if (
          p.x + PLAYER_W > pl.x &&
          p.x < pl.x + pl.w &&
          Math.abs(p.y + PLAYER_H - pl.y) < 1 &&
          p.vy >= 0 &&
          p.y + PLAYER_H <= pl.y + pl.h
        ) {
          // Set player flush on top of platform
          p.y = pl.y - PLAYER_H;
          p.vy = 0;
          isOnGround = true;
          groundY = pl.y;
        }
        // Handle horizontal wall-like stops (slippery)
        if (
          p.y + PLAYER_H > pl.y + 2 &&
          p.y < pl.y + pl.h - 2 &&
          p.x + PLAYER_W > pl.x &&
          p.x < pl.x + pl.w
        ) {
          // If moving right
          if (p.vx > 0) p.x = Math.min(p.x, pl.x - PLAYER_W);
          // If moving left
          if (p.vx < 0) p.x = Math.max(p.x, pl.x + pl.w);
        }
      }

      // --- Movement controls & physics ---
      if (!levelComplete && !transitionTimer && !deathTimer) {
        // Horizontal
        if (controls.current.left) {
          p.vx = -MOVE_SPEED;
        } else if (controls.current.right) {
          p.vx = MOVE_SPEED;
        } else {
          p.vx = 0;
        }
        // Gravity
        p.vy += GRAVITY * dt;

        // Jump
        if (controls.current.jumpPressed && isOnGround) {
          p.vy = JUMP_VEL;
          isOnGround = false;
        }
        controls.current.jumpPressed = false;

        // Integrate position
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Clamp world bounds
        if (p.x < 0) p.x = 0;
        if (p.x > GAME_WIDTH - PLAYER_W) p.x = GAME_WIDTH - PLAYER_W;
        if (p.y < 0) p.y = 0;
      }

      // --- Land on ground if falling ---
      // If player below ground, snap and stop (fail below screen = death)
      if (p.y > GAME_HEIGHT + 36 && !levelComplete && !transitionTimer) {
        defeatPlayer();
        deathTimer = 1.0;
      }
      if (p.y + PLAYER_H >= GAME_HEIGHT && !levelComplete && !transitionTimer) {
        p.y = GAME_HEIGHT - PLAYER_H;
        p.vy = 0;
        isOnGround = true;
      }


      p.onGround = isOnGround;

      // --- GEM pickup logic ---
      let gCollectedNow = false;
      let newGems = gems.map(gem =>
        gem.collected ? gem : (
          (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, gem.x - GEM_RADIUS, gem.y - GEM_RADIUS, GEM_RADIUS * 2, GEM_RADIUS * 2)) ?
            (gCollectedNow = true, { ...gem, collected: true }) : gem
        )
      );
      if (gCollectedNow) {
        let nCollected = newGems.filter(g => g.collected).length;
        setGems(newGems);
        setHud(h => ({
          ...h,
          gems: nCollected
        }));
      }

      // --- PENALTY/RESET on enemy collision (walk into enemy = lose life, reset level) ---
      if (
        !levelComplete && !transitionTimer && !deathTimer &&
        rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, nextEnemy.x, nextEnemy.y, ENEMY_W, ENEMY_H)
      ) {
        penaltyFlash = 16;
        defeatPlayer();
        deathTimer = 1.0;
      }

      // --- LEVEL COMPLETE: Collect all gems, trigger transition after brief pause ---
      let allCollected = newGems.every(g => g.collected);
      if (
        allCollected &&
        !levelComplete &&
        !firstComplete &&
        !transitionTimer &&
        !deathTimer
      ) {
        setLevelComplete(true);
        setHud(h => ({
          ...h,
          msg: "All gems collected! Next level in 2s..."
        }));
        setTimeout(() => setTransitionTimer(2), 200);
        setTimeout(() => { setTransitionTimer(0); startNextLevel(); }, 2200);
        firstComplete = true;
        return requestAnimationFrame(frame);
      }

      // --- Death (lose life) ---
      if (deathTimer > 0) {
        penaltyFlash--;
        deathTimer -= dt;
        if (deathTimer <= 0) {
          let h = hud;
          let remaining = lives - 1;
          setLives(remaining);
          if (remaining > 0) {
            setHud({ ...h, msg: "Ouch! Life lost.", gems: 0 });
            restartLevel();
          } else {
            setHud({ ...h, msg: "Game over! Press R to restart.", gems: 0 });
            setLevelComplete(false);
            setTransitionTimer(0);
            setCurLevel(0);
            setLives(3);
          }
          return;
        }
      }

      // --- DRAWING ---
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        // BG
        ctx.save();
        ctx.fillStyle = L.bg;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.restore();

        // Platforms
        ctx.save();
        for (let pl of L.platforms) {
          ctx.fillStyle = "#8fd462";
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 2;
          ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
        }
        ctx.restore();

        // Gems
        for (let gem of newGems) {
          ctx.save();
          ctx.globalAlpha = gem.collected ? 0.2 : 1.0;
          ctx.fillStyle = gem.collected ? "#ddddbb" : "#ffd700";
          ctx.beginPath();
          ctx.arc(gem.x, gem.y, GEM_RADIUS, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        // Enemy
        ctx.save();
        if (penaltyFlash > 0 && penaltyFlash % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }
        // Try to use sprite if available, else draw a retro blob
        // (the user can add a sprite at src/assets/img/slime_modern.png)
        if (ctx._modernSlimeImg === undefined) {
          ctx._modernSlimeImg = new window.Image();
          ctx._modernSlimeImg.src = require("./assets/img/slime_modern.png");
          ctx._modernSlimeImgLoaded = false;
          ctx._modernSlimeImg.onload = () => {
            ctx._modernSlimeImgLoaded = true;
          };
        }
        if (ctx._modernSlimeImg && ctx._modernSlimeImg.complete && ctx._modernSlimeImg.naturalWidth > 0) {
          ctx.drawImage(ctx._modernSlimeImg, nextEnemy.x, nextEnemy.y, ENEMY_W, ENEMY_H);
        } else {
          ctx.fillStyle = "#f47350";
          ctx.fillRect(nextEnemy.x, nextEnemy.y, ENEMY_W, ENEMY_H);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Player
        ctx.save();
        if (penaltyFlash > 0) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() * 0.08));
        }
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), PLAYER_W, PLAYER_H);
        // Shadow
        ctx.globalAlpha *= 0.13;
        ctx.fillStyle = "#111";
        ctx.fillRect(Math.floor(p.x + 1), Math.floor(p.y + PLAYER_H), PLAYER_W - 2, 3);
        ctx.restore();

        // HUD
        ctx.save();
        ctx.font = "bold 13px 'Press Start 2P', monospace";
        ctx.fillStyle = "#fffd";
        ctx.shadowColor = "#111";
        ctx.shadowBlur = 1.2;
        ctx.fillText(L.name, 10, 21);
        ctx.font = "9px monospace";
        ctx.fillStyle = "#ffd700";
        ctx.shadowBlur = 0;
        ctx.fillText("← → (A/D) move, Space/W/↑ jump, R restart", 12, 36);
        ctx.restore();

        // Top HUD bar (gems/lives/status)
        ctx.save();
        ctx.font = "bold 12px 'Press Start 2P', monospace";
        ctx.fillStyle = "#ddd";
        ctx.shadowColor = "#232";
        ctx.shadowBlur = 1.5;
        ctx.fillText(
          `Gems: ${newGems.filter(g => g.collected).length}/${newGems.length}   Lives: ${lives}`,
          10,
          60
        );
        if (hud.msg) {
          ctx.font = "bold 15px 'Press Start 2P', monospace";
          ctx.fillStyle = "#e67e22";
          ctx.fillText(hud.msg, 42, 100);
        }
        ctx.restore();

        // Level complete overlay
        if (levelComplete || transitionTimer) {
          ctx.save();
          ctx.globalAlpha = 0.93;
          ctx.fillStyle = "#181824e6";
          ctx.fillRect(50, 75, 210, 40);
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 3;
          ctx.strokeRect(50, 75, 210, 40);
          ctx.font = "17px 'Press Start 2P', monospace";
          ctx.fillStyle = "#ffd700";
          let msg =
            hud.msg ||
            (levelComplete
              ? "Level Complete! Next up..."
              : "");
          ctx.fillText(msg, 60, 105);
          ctx.restore();
        }
      }
      if (running) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    return () => {
      running = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curLevel, gems, lives, enemy, levelComplete, transitionTimer]);
  
  // On mount: focus canvas for keyboard
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.focus();
  }, [curLevel]);

  // Style for fullscreen game
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
        aria-label="Platformer canvas with levels, gems, enemy"
      />
      <button
        className="px-btn"
        style={{ fontSize: "1rem", marginTop: 12, padding: "2px 25px" }}
        onClick={restartLevel}
        disabled={!!transitionTimer}
      >
        Restart Level
      </button>
      <div style={{ marginTop: 10, color: "#aaa", fontSize: 12, fontFamily: "monospace", opacity: .6 }}>
        Tip: Collect all gems. Avoid the enemy!
      </div>
    </div>
  );
}

export default App;
