import React from 'react';

// PUBLIC_INTERFACE
/**
 * SettingsOverlay - Clean, robust retro overlay for player options.
 * Adopts pixel-art modern-retro look, perfect content fit, visual polish.
 * @param {function} onClose - called when user closes overlay
 */
const SettingsOverlay = ({ onClose }) => (
  <div
    className="overlay settings-overlay"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: "min(360px, 98vw)",
      minHeight: 150,
      zIndex: 52,
      background: "var(--px-window, #181824fa)",
      border: "4px solid var(--px-hud-border)",
      boxShadow: "0 0 0 7px var(--px-shadow),0 7px 0 var(--px-ui-shadow)",
      borderRadius: 0,
      padding: "26px 15px 15px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Press Start 2P',monospace",
      color: "var(--px-title)",
      textAlign: "center"
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Settings"
  >
    <h2
      style={{
        color: "var(--px-title)",
        fontSize: "1.1rem",
        textShadow: "2px 2px var(--px-block-border),0 0 5px #fffd",
        marginBottom: 17,
        letterSpacing: 1.1
      }}
    >
      Settings
    </h2>
    <div style={{
      width: "95%",
      minHeight: 60,
      background: "rgba(38,41,60,0.78)",
      border: "2px solid var(--px-border)",
      borderRadius: 0,
      boxShadow: "0 1px 0 var(--px-shadow)",
      color: "var(--px-text-main)",
      fontFamily: "monospace",
      fontSize: ".67rem",
      textAlign: "center",
      marginBottom: 12,
      padding: "6px 9px 12px"
    }}>
      <span style={{ color: "#ffd700"}}>⚙️</span>
      <div style={{ paddingTop: 2, color: "var(--px-text-main, #fffadf)" }}>
        Settings coming soon! <br />
        You’ll be able to customize sound, controls, and other preferences here for your pixel-platform adventure.
      </div>
    </div>
    <button
      className="px-btn"
      style={{
        marginTop: 8,
        fontSize: ".92rem",
        background: "var(--px-button)",
        color: "var(--px-title)"
      }}
      tabIndex={0}
      autoFocus
      onClick={onClose}
    >
      Close
    </button>
  </div>
);

export default SettingsOverlay;
