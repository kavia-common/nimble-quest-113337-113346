import React from 'react';

// PUBLIC_INTERFACE
/**
 * LevelSelect - Robust, modern-retro overlay for choosing game levels.
 * Visually polished, pixel-art fitting, clean, and easily extensible.
 * @param {function} onBack - called when returning to menu
 */
const LevelSelect = ({ onBack }) => (
  <div
    className="level-select"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: "min(370px, 98vw)",
      minHeight: 150,
      zIndex: 47,
      background: "var(--px-window, #181824)",
      border: "4px solid var(--px-hud-border)",
      boxShadow: "0 0 0 8px var(--px-shadow),0 8px 0 var(--px-ui-shadow)",
      borderRadius: 0,
      padding: "25px 24px 22px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Press Start 2P',monospace",
      color: "var(--px-title)"
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Level Select"
  >
    <h2
      style={{
        color: "var(--px-title)",
        fontSize: "1.18rem",
        textShadow: "3px 3px var(--px-block-border),0 0 8px #fffd",
        marginBottom: 18,
        letterSpacing: 1.1
      }}
    >
      Level Select
    </h2>
    <div style={{
      width: "96%",
      minHeight: 50,
      background: "rgba(38,41,60,0.8)",
      border: "2px solid var(--px-border)",
      borderRadius: 0,
      boxShadow: "0 1px 0 var(--px-shadow)",
      color: "var(--px-text-main)",
      fontFamily: "monospace",
      fontSize: ".6rem",
      textAlign: "center",
      marginBottom: 16,
      padding: "8px 8px 10px"
    }}>
      <span style={{ color: "#ffd700" }}>🗺️</span>
      <div style={{ paddingTop: 1, color: "var(--px-text-main, #fffadf)" }}>
        Level select coming soon! Choose your own path across worlds in the full game.<br />
        <i>Sample: "1-1 The Garden", "1-2 Overgrown Ruins", "1-3 Old Walls"…</i>
      </div>
    </div>
    <button
      className="px-btn"
      style={{
        marginTop: 5,
        fontSize: "0.89rem",
        background: "var(--px-button)",
        color: "var(--px-title)"
      }}
      tabIndex={0}
      autoFocus
      onClick={onBack}
    >
      Back to Menu
    </button>
  </div>
);

export default LevelSelect;
