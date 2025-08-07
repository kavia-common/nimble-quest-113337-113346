import React from 'react';

// PUBLIC_INTERFACE
/**
 * AchievementsOverlay - Robust, clean retro overlay for achievements/unlocks.
 * Pixel-art retro design, centered overlay that fits all containers.
 * @param {function} onClose - called when user closes overlay
 */
const AchievementsOverlay = ({ onClose }) => (
  <div
    className="overlay achievements-overlay"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: "min(380px, 96vw)",
      minHeight: 156,
      zIndex: 52,
      background: "var(--px-window, #181824)",
      border: "4px solid var(--px-hud-border)",
      boxShadow: "0 0 0 8px var(--px-shadow), 0 8px 0 var(--px-ui-shadow)",
      borderRadius: 0,
      padding: "27px 24px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Press Start 2P',monospace",
      color: "var(--px-title)",
      textAlign: "center"
    }}
    role="dialog"
    aria-modal="true"
    aria-label="Achievements"
  >
    <h2
      style={{
        color: "var(--px-title)",
        fontSize: "1.35rem",
        textShadow: "3px 3px var(--px-block-border),0 0 7px #fffd",
        marginBottom: 22,
        letterSpacing: 1.3
      }}
    >
      Achievements
    </h2>
    <div style={{
      width: "97%",
      minHeight: 70,
      background: "rgba(38,41,60,0.78)",
      border: "2px solid var(--px-border)",
      borderRadius: 0,
      boxShadow: "0 2px 0 var(--px-shadow)",
      color: "var(--px-text-main)",
      fontFamily: "monospace",
      fontWeight: 400,
      fontSize: ".62rem",
      textAlign: "center",
      marginBottom: 18,
      padding: "11px 11px 13px"
    }}>
      <span style={{color: "#ffd700"}}>🎯</span>
      <div style={{paddingTop:2, color:"var(--px-text-main, #fffadf)"}}>
        Unlock achievements as you collect gems, finish levels, and discover secrets!<br /><br/>
        <i>Sample: "Gem Collector", "First Victory", "Secret Finder" (UI only, not hooked up)</i>
      </div>
    </div>
    <button
      className="px-btn"
      style={{
        marginTop: 8,
        fontSize: ".97rem",
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

export default AchievementsOverlay;
