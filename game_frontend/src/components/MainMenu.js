import React from 'react';

// PUBLIC_INTERFACE
/**
 * MainMenu - Main navigation menu for the game
 * Shows start, settings, achievements, and leaderboards entry points.
 *
 * Props:
 * - onStartGame: function() -> called to start the game
 * - onShowSettings: function() -> called to show settings overlay
 * - onShowAchievements: function() -> called to show achievements overlay
 * - onShowLeaderboards: function() -> called to show leaderboards overlay
 * - onShowLevelSelect: function() -> called to go to level select
 */
const MainMenu = ({
  onStartGame,
  onShowSettings,
  onShowAchievements,
  onShowLeaderboards,
  onShowLevelSelect
}) => (
  <div className="main-menu" style={{ textAlign: 'center' }}>
    <h1 className="px-title px-shadow-text" style={{ marginBottom: 36, marginTop: 8 }}>
      Nimble Quest
    </h1>
    <button
      className="px-btn px-btn-large"
      style={{
        fontSize: '1.13rem',
        fontWeight: 'bold',
        width: 200,
        marginBottom: 18,
        background: 'var(--px-button)',
        color: 'var(--px-title)'
      }}
      onClick={onStartGame}
      autoFocus
      tabIndex={0}
    >
      ▶ Start Game
    </button>
    <div style={{ marginTop: 24 }}>
      <button
        className="px-btn"
        style={{ width: 170, marginBottom: 12 }}
        onClick={onShowLevelSelect}
      >
        Select Level
      </button>
      <button
        className="px-btn"
        style={{ width: 170, marginBottom: 12 }}
        onClick={onShowAchievements}
      >
        Achievements
      </button>
      <button
        className="px-btn"
        style={{ width: 170, marginBottom: 12 }}
        onClick={onShowLeaderboards}
      >
        Leaderboards
      </button>
      <button
        className="px-btn"
        style={{ width: 170, marginBottom: 0 }}
        onClick={onShowSettings}
      >
        Settings
      </button>
    </div>
    <div style={{ fontSize: '0.75em', color: 'var(--px-text-secondary)', marginTop: 32, letterSpacing: 0.5 }}>
      <span role="img" aria-label="joystick">🕹️</span> Classic Pixel Platformer Adventure <span role="img" aria-label="sparkles">✨</span>
    </div>
  </div>
);

export default MainMenu;
