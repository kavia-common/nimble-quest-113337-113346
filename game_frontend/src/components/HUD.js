import React from 'react';

// PUBLIC_INTERFACE
/**
 * HUD - Heads-Up Display for score, lives, gems, etc.
 */
const HUD = () => (
  <div className="hud" role="region" aria-label="game hud">
    <span className="hud-label" style={{ color: "#ffd700", textShadow: "2px 2px #ffb700" }}>
      SCORE
      <span className="hud-value" style={{ color: "#2ecc71", marginLeft: 10 }}>000000</span>
    </span>
    <span className="hud-label" style={{ color: "#f36d58", textShadow: "2px 2px #ff705d" }}>
      LIVES
      <span className="hud-value" style={{ color: "#fff", marginLeft: 10, textShadow: "1px 1px #222" }}>x3</span>
    </span>
    <span className="hud-label" style={{ color: "#28d6fa", textShadow: "2px 2px #85eaff" }}>
      GEMS
      <span className="hud-value" style={{ color: "#ffd6a3", marginLeft: 10 }}>00</span>
    </span>
  </div>
);

export default HUD;
