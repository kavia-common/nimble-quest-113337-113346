import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import LEVELS from "./engine/levels";

// --- Constants ---
const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;
const PIXEL_SCALE = 2;
const PLAYER_W = 12, PLAYER_H = 14;
const ENEMY_W = 14, ENEMY_H = 12;
const GEM_RADIUS = 6;
const GROUND_HEIGHT = 80; // Doubled
const MOVE_SPEED = 128;   // Slightly increased for larger world
const JUMP_VEL = -260;
const GRAVITY = 980;

// --- Triple jump constant: maximum allowed jumps before landing ---
const MAX_JUMPS = 3;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Axis-aligned bounding box collision
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  // Tightly includes all sides, helps with pixel-accurate collision at edges/corners
  return (ax + aw) > bx && ax < (bx + bw) && (ay + ah) > by && ay < (by + bh);
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
  // Always ensure playerStart exists (robust for all LEVELS)
  let fallbackPlayerStart = LEVELS[curLevel]?.playerStart || { x: 35, y: 210 };

  // Triple jump fields: store persistent jumpCount in this ref (lives across re-renders)
  const player = useRef({
    x: fallbackPlayerStart.x,
    y: fallbackPlayerStart.y,
    vx: 0,
    vy: 0,
    onGround: false,
    jumpCount: 0     // Number of jumps performed since last landing
  });

  // --- Gems state (regenerate on level load) ---
  const [gems, setGems] = useState(
    LEVELS[curLevel].gems.map(g => ({ ...g, collected: false }))
  );

  // --- Enemy state (array of all enemies per level) ---
  const [enemies, setEnemies] = useState(
    LEVELS[curLevel].enemies && LEVELS[curLevel].enemies.length > 0
      ? LEVELS[curLevel].enemies.map(e => ({ ...e }))
      : [{ x: PLAYER_W, y: GAME_HEIGHT - ENEMY_H - 8, patrolMin: 0, patrolMax: GAME_WIDTH - ENEMY_W, dir: 1, speed: 45 }]
  );

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
      x: LEVELS[curLevel].playerStart?.x ?? 35,
      y: LEVELS[curLevel].playerStart?.y ?? 210,
      vx: 0,
      vy: 0,
      onGround: false
    };
    setGems(LEVELS[curLevel].gems.map(g => ({ ...g, collected: false })));
    setEnemies(
      LEVELS[curLevel].enemies && LEVELS[curLevel].enemies.length > 0
        ? LEVELS[curLevel].enemies.map(e => ({ ...e }))
        : [{ x: PLAYER_W, y: GAME_HEIGHT - ENEMY_H - 8, patrolMin: 0, patrolMax: GAME_WIDTH - ENEMY_W, dir: 1, speed: 45 }]
    );
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
        x: LEVELS[0].playerStart?.x ?? 35,
        y: LEVELS[0].playerStart?.y ?? 210,
        vx: 0,
        vy: 0,
        onGround: false
      };
      setGems(LEVELS[0].gems.map(g => ({ ...g, collected: false })));
      setEnemies(
        LEVELS[0].enemies && LEVELS[0].enemies.length > 0
          ? LEVELS[0].enemies.map(e => ({ ...e }))
          : [{ x: PLAYER_W, y: GAME_HEIGHT - ENEMY_H - 8, patrolMin: 0, patrolMax: GAME_WIDTH - ENEMY_W, dir: 1, speed: 45 }]
      );
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
        x: LEVELS[nextIdx].playerStart?.x ?? 35,
        y: LEVELS[nextIdx].playerStart?.y ?? 210,
        vx: 0,
        vy: 0,
        onGround: false
      };
      setGems(LEVELS[nextIdx].gems.map(g => ({ ...g, collected: false })));
      setEnemies(
        LEVELS[nextIdx].enemies && LEVELS[nextIdx].enemies.length > 0
          ? LEVELS[nextIdx].enemies.map(e => ({ ...e }))
          : [{ x: PLAYER_W, y: GAME_HEIGHT - ENEMY_H - 8, patrolMin: 0, patrolMax: GAME_WIDTH - ENEMY_W, dir: 1, speed: 45 }]
      );
    }, 50);
  }

  // --- On level or lives change: reset player, gems, enemy ---
  useEffect(() => {
    player.current = {
      x: LEVELS[curLevel].playerStart?.x ?? 35,
      y: LEVELS[curLevel].playerStart?.y ?? 210,
      vx: 0,
      vy: 0,
      onGround: false
    };
    setGems(LEVELS[curLevel].gems.map(g => ({ ...g, collected: false })));
    setEnemies(
      LEVELS[curLevel].enemies && LEVELS[curLevel].enemies.length > 0
        ? LEVELS[curLevel].enemies.map(e => ({ ...e }))
        : [{ x: PLAYER_W, y: GAME_HEIGHT - ENEMY_H - 8, patrolMin: 0, patrolMax: GAME_WIDTH - ENEMY_W, dir: 1, speed: 45 }]
    );
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
      setHud(h => ({
        ...h,
        msg: lives > 1 ? "Ouch! Life lost." : "Game over! Press R to restart.",
        gems: 0
      }));
    }

    function frame() {
      if (!running) return;
      const now = performance.now();
      let dt = clamp((now - lastTime) / 1000, 0, 0.045);
      lastTime = now;

      const L = LEVELS[curLevel];
      const p = player.current;

      // ENEMY ARRAY update: iterate all enemies and apply their simple logic if walker/hopper/chaser/projectile
      let nextEnemies = enemies.map(e => ({ ...e }));
      // Walker/hopper: patrol logic; chaser: nothing special here; projectile: nothing needed here
      for (let i = 0; i < nextEnemies.length; ++i) {
        let e = nextEnemies[i];
        if (e.type === "walker") {
          e.x += e.dir * (e.speed ?? 44) * dt;
          if (e.x < (e.patrolMin ?? 0)) {
            e.x = e.patrolMin ?? 0; e.dir = 1;
          }
          if (e.x > (e.patrolMax ?? (GAME_WIDTH - ENEMY_W))) {
            e.x = e.patrolMax ?? (GAME_WIDTH - ENEMY_W); e.dir = -1;
          }
        }
        if (e.type === "hopper") {
          // Simple vertical "hop" AI (could be expanded)
          e.jumpTimer = e.jumpTimer || 0;
          e.vy = e.vy || 0;
          e.jumpCooldown = e.jumpCooldown ?? 1.11;
          if (!e.onGround) e.vy += 440 * dt;
          e.y += e.vy * dt;
          if (e.y > GAME_HEIGHT - ENEMY_H - 8) {
            e.y = GAME_HEIGHT - ENEMY_H - 8;
            e.vy = 0; e.onGround = true;
          }
          e.jumpTimer -= dt;
          if (e.onGround && e.jumpTimer <= 0) {
            e.vy = e.jumpVy || -104;
            e.onGround = false;
            e.jumpTimer = e.jumpCooldown;
          }
        }
        if (e.type === "chaser") {
          let dx = p.x - e.x, dy = p.y - e.y;
          if (Math.abs(dx) < (e.activeRange ?? 100) && Math.abs(dy) < 56) {
            e.x += Math.sign(dx) * (e.speed ?? 65) * dt;
            if (e.x < 0) e.x = 0;
            if (e.x > GAME_WIDTH - ENEMY_W) e.x = GAME_WIDTH - ENEMY_W;
          }
        }
        // projectiles are not handled in this simplified demo
      }
      setEnemies(nextEnemies);

      // --- PLATFORM collision ---
      let isOnGround = false;
      let standPlatform = null;
      for (let pl of L.platforms) {
        if (
          (p.x + PLAYER_W) > (pl.x + 0.5) &&
          (p.x + 0.5) < (pl.x + pl.w) &&
          Math.abs((p.y + PLAYER_H) - pl.y) < 1.15 &&
          p.vy >= 0
        ) {
          if ((p.y + PLAYER_H) <= pl.y + pl.h) {
            p.y = pl.y - PLAYER_H;
            p.vy = 0;
            isOnGround = true;
            standPlatform = pl;
            break;
          }
        }
      }
      // Horizontal wall collision after vertical snap
      for (let pl of L.platforms) {
        if (
          p.y + PLAYER_H > pl.y + 2 &&
          p.y < pl.y + pl.h - 2 &&
          (p.x + PLAYER_W) > pl.x &&
          p.x < (pl.x + pl.w)
        ) {
          if (p.vx > 0) p.x = Math.min(p.x, pl.x - PLAYER_W - 0.01);
          if (p.vx < 0) p.x = Math.max(p.x, pl.x + pl.w + 0.01);
        }
      }

      // --- Movement controls, physics, and triple jump logic ---
      if (!levelComplete && !transitionTimer && !deathTimer) {
        if (controls.current.left) p.vx = -MOVE_SPEED;
        else if (controls.current.right) p.vx = MOVE_SPEED;
        else p.vx = 0;
        p.vy += GRAVITY * dt;

        if (controls.current.jumpPressed) {
          if (isOnGround) { p.vy = JUMP_VEL; p.jumpCount = 1; isOnGround = false; }
          else if (p.jumpCount < MAX_JUMPS) { p.vy = JUMP_VEL * 0.93; p.jumpCount += 1; }
        }
        controls.current.jumpPressed = false;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) p.x = 0;
        if (p.x > GAME_WIDTH - PLAYER_W) p.x = GAME_WIDTH - PLAYER_W;
        if (p.y < 0) p.y = 0;
      }
      if (p.y > GAME_HEIGHT + 36 && !levelComplete && !transitionTimer) {
        defeatPlayer();
        deathTimer = 1.0;
      }
      if (p.y + PLAYER_H >= GAME_HEIGHT && !levelComplete && !transitionTimer && !isOnGround) {
        p.y = GAME_HEIGHT - PLAYER_H;
        p.vy = 0;
        isOnGround = true;
      }
      if (isOnGround) p.jumpCount = 0;
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
        setHud(h => ({ ...h, gems: nCollected }));
      }

      // --- Enemy collision with ANY enemy in array ---
      if (
        !levelComplete && !transitionTimer && !deathTimer &&
        nextEnemies.some(e =>
          rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, e.x, e.y, ENEMY_W, ENEMY_H)
        )
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

      // --- CAMERA LOGIC ---
      // Calculate camera position so the player is centered, but camera does not show beyond level bounds
      const LEVEL_W = (L.platforms?.length
        ? Math.max(...L.platforms.map(pl => pl.x + pl.w), GAME_WIDTH)
        : GAME_WIDTH);
      const LEVEL_H = (L.platforms?.length
        ? Math.max(...L.platforms.map(pl => pl.y + pl.h), GAME_HEIGHT)
        : GAME_HEIGHT);

      // Center camera on player, but clamp so the visible view does not exceed the level bounds
      // (If the level is smaller than the view, just show from 0)
      let cameraX = Math.max(0, Math.min(
        (LEVEL_W > GAME_WIDTH ? (p.x + PLAYER_W / 2) - GAME_WIDTH / 2 : 0),
        LEVEL_W - GAME_WIDTH
      ));
      let cameraY = Math.max(0, Math.min(
        (LEVEL_H > GAME_HEIGHT ? (p.y + PLAYER_H / 2) - GAME_HEIGHT / 2 : 0),
        LEVEL_H - GAME_HEIGHT
      ));

      // --- DRAWING ---
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        // BG
        ctx.save();
        ctx.fillStyle = L.bgColor || L.bg || "#232535";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.restore();

        // Platforms
        ctx.save();
        for (let pl of L.platforms) {
          ctx.fillStyle = "#8fd462";
          ctx.fillRect(pl.x - cameraX, pl.y - cameraY, pl.w, pl.h);
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 2;
          ctx.strokeRect(pl.x - cameraX, pl.y - cameraY, pl.w, pl.h);
        }
        ctx.restore();

        // Gems
        for (let gem of newGems) {
          ctx.save();
          ctx.globalAlpha = gem.collected ? 0.2 : 1.0;
          ctx.fillStyle = gem.collected ? "#ddddbb" : "#ffd700";
          ctx.beginPath();
          ctx.arc(gem.x - cameraX, gem.y - cameraY, GEM_RADIUS, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        // Enemies: Draw each enemy
        if (Array.isArray(nextEnemies) && nextEnemies.length > 0) {
          for (let e of nextEnemies) {
            ctx.save();
            if (penaltyFlash > 0 && penaltyFlash % 2 === 0) ctx.globalAlpha = 0.4;
            if (ctx._modernSlimeImg === undefined) {
              ctx._modernSlimeImg = new window.Image();
              ctx._modernSlimeImg.src = require("./assets/img/slime_modern.png");
              ctx._modernSlimeImgLoaded = false;
              ctx._modernSlimeImg.onload = () => { ctx._modernSlimeImgLoaded = true; };
            }
            if (ctx._modernSlimeImg && ctx._modernSlimeImg.complete && ctx._modernSlimeImg.naturalWidth > 0) {
              ctx.drawImage(ctx._modernSlimeImg, e.x - cameraX, e.y - cameraY, ENEMY_W, ENEMY_H);
            } else {
              ctx.fillStyle = "#f47350";
              ctx.fillRect(e.x - cameraX, e.y - cameraY, ENEMY_W, ENEMY_H);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
          }
        }

        // Player
        ctx.save();
        if (penaltyFlash > 0) {
          ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(performance.now() * 0.08));
        }
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(Math.floor(p.x - cameraX), Math.floor(p.y - cameraY), PLAYER_W, PLAYER_H);
        // Shadow
        ctx.globalAlpha *= 0.13;
        ctx.fillStyle = "#111";
        ctx.fillRect(Math.floor(p.x - cameraX + 1), Math.floor(p.y - cameraY + PLAYER_H), PLAYER_W - 2, 3);
        ctx.restore();

        // HUD (drawn HUD stays screen-fixed)
        ctx.save();
        ctx.font = "bold 13px 'Press Start 2P', monospace";
        ctx.fillStyle = "#fffd";
        ctx.shadowColor = "#111";
        ctx.shadowBlur = 1.2;
        ctx.fillText(L.name || "", 10, 21);
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

        // Level complete overlay (centered relative to camera box, i.e. visual canvas)
        if (levelComplete || transitionTimer) {
          ctx.save();
          ctx.globalAlpha = 0.93;
          ctx.fillStyle = "#181824e6";
          ctx.fillRect(GAME_WIDTH/2-105, GAME_HEIGHT/2-20, 210, 40);
          ctx.strokeStyle = "#fff880";
          ctx.lineWidth = 3;
          ctx.strokeRect(GAME_WIDTH/2-105, GAME_HEIGHT/2-20, 210, 40);
          ctx.font = "17px 'Press Start 2P', monospace";
          ctx.fillStyle = "#ffd700";
          let msg =
            hud.msg ||
            (levelComplete
              ? "Level Complete! Next up..."
              : "");
          ctx.fillText(msg, GAME_WIDTH/2-85, GAME_HEIGHT/2+10);
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
  }, [curLevel, gems, lives, enemies, levelComplete, transitionTimer]);

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
