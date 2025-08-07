import React from 'react';

// PUBLIC_INTERFACE
/**
 * LeaderboardsOverlay - Robust, clean retro overlay for leaderboards.
 * Pixel-art retro appearance, perfect fit, visually polished.
 * @param {function} onClose - called on close
 */
const LeaderboardsOverlay = ({ onClose }) => (
  <div
    className="overlay leaderboards-overlay"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: "min(400px, 99vw)",
      minHeight: 170,
      zIndex: 52,
      background: "var(--px-window, #181824fc)",
      border: "4px solid var(--px-hud-border)",
      boxShadow: "0 0 0 8px var(--px-shadow),0 8px 0 var(--px-ui-shadow)",
      borderRadius: 0,
      padding: "26px 16px 17px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Press Start 2P',monospace",
      color: "var(--px-title)",
      textAlign: "center"
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Leaderboards"
  >
    <h2
      style={{
        color: "var(--px-title)",
        fontSize: "1.18rem",
        textShadow: "2px 2px var(--px-block-border),0 0 6px #fffd",
        marginBottom: 21,
        letterSpacing: 1.3
      }}
    >
      Leaderboards
    </h2>
    <div style={{
      width: "97%",
      minHeight: 80,
      background: "rgba(38,41,60,0.78)",
      border: "2px solid var(--px-border)",
      borderRadius: 0,
      boxShadow: "0 1px 0 var(--px-shadow)",
      color: "var(--px-text-main)",
      fontFamily: "monospace",
      fontSize: ".62rem",
      textAlign: "center",
      marginBottom: 18,
      padding: "9px 13px 13px"
    }}>
      <span style={{ color: "#ffd700"}}>🏆 </span>
      <div style={{paddingTop:3, color:"var(--px-text-main, #fffadf)"}}>
        <b>High Scores Coming Soon!</b>
        <br/>The top five players will be displayed here when connected to the score server.
      </div>
    </div>
    <button
      className="px-btn"
      style={{
        marginTop: 6,
        fontSize: ".91rem",
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

export default LeaderboardsOverlay;
