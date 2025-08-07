import React from 'react';

// PUBLIC_INTERFACE
/**
 * HUD - Heads-Up Display for score, lives, gems, etc.
 *
 * Props:
 *   - score {number}
 *   - lives {number}
 *   - gems {number}
 *   - maxGems {number}
 */
const HUD = ({ score = 0, lives = 3, gems = 0, maxGems = 0 }) => (
  <div className="hud" role="region" aria-label="game hud">
    <span className="hud-label" style={{ color: "#ffd700", textShadow: "2px 2px #ffb700" }}>
      SCORE
      <span className="hud-value" style={{ color: "#2ecc71", marginLeft: 10 }}>
        {String(score).padStart(6, "0")}
      </span>
    </span>
    <span className="hud-label" style={{ color: "#f36d58", textShadow: "2px 2px #ff705d" }}>
      LIVES
      <span className="hud-value" style={{ color: "#fff", marginLeft: 10, textShadow: "1px 1px #222" }}>
        ×{lives}
      </span>
    </span>
    <span className="hud-label" style={{ color: "#28d6fa", textShadow: "2px 2px #85eaff" }}>
      GEMS
      <span className="hud-value" style={{ color: "#ffd6a3", marginLeft: 10 }}>
        {gems}{typeof maxGems === "number" && maxGems > 0 ? `/${maxGems}` : ""}
      </span>
    </span>
  </div>
);

export default HUD;
