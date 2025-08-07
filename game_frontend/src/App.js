import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import GameLayout from './components/GameLayout';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import HUD from './components/HUD';
import SettingsOverlay from './components/SettingsOverlay';
import AchievementsOverlay from './components/AchievementsOverlay';
import LeaderboardsOverlay from './components/LeaderboardsOverlay';
import GameEngine from './engine/GameEngine';

// PUBLIC_INTERFACE
/**
 * App - Main entry for pixel-art platformer. Handles top-level state and screen orchestration.
 * - Robust against crash: all state paths validated, errors caught.
 * - Fully extensible for new overlays, screens, and integration hooks.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [overlay, setOverlay] = useState(null); // 'settings', 'achievements', 'leaderboards', etc.
  const [screen, setScreen] = useState('menu'); // 'menu', 'levelselect', 'game'

  // Persistent game state for progress & scoring
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gems, setGems] = useState(0);
  const [maxGems, setMaxGems] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  // Gameflow overlays: e.g. game over, level complete, all complete
  const [gameFlowOverlay, setGameFlowOverlay] = useState(null);
  const [gameOverlayMessage, setGameOverlayMessage] = useState("");

  // Crash-safe: all effect hooks are wrapped
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      // Ignore theme change error for robustness.
    }
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // PUBLIC_INTERFACE - Main menu flow handlers
  const handleStartGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setGems(0);
    setMaxGems(0);
    setCurrentLevel(0);
    setGameFlowOverlay(null);
    setGameOverlayMessage("");
    setScreen('game');
  }, []);
  const handleShowLevelSelect = useCallback(() => setScreen('levelselect'), []);
  const handleReturnToMenu = useCallback(() => {
    setScreen('menu');
    setGameFlowOverlay(null);
    setOverlay(null);
  }, []);
  const showOverlay = useCallback((o) => setOverlay(o), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  // Updates from GameEngine
  const handleGameStateUpdate = useCallback(
    ({ score: nextScore, lives: nextLives, gems: nextGems, maxGems: nextMaxGems, level: nextLevel }) => {
      setScore(typeof nextScore === "number" ? nextScore : 0);
      setLives(typeof nextLives === "number" ? nextLives : 0);
      setGems(typeof nextGems === "number" ? nextGems : 0);
      setMaxGems(typeof nextMaxGems === "number" ? nextMaxGems : 0);
      setCurrentLevel(typeof nextLevel === "number" ? nextLevel : 0);
    }, []);

  // GameFlow event handlers (robust: safe checks)
  const handleGameOver = useCallback(() => {
    setGameFlowOverlay('gameover');
    setGameOverlayMessage("Game Over");
  }, []);
  const handleNextLevel = useCallback(({ levelName }) => {
    setGameFlowOverlay('nextlevel');
    setGameOverlayMessage(`Level Complete!${levelName ? " Next: " + levelName : ""}`);
  }, []);
  const handleResumeAfterOverlay = useCallback(() => setGameFlowOverlay(null), []);
  const handleAllLevelsComplete = useCallback(() => {
    setGameFlowOverlay('allcomplete');
    setGameOverlayMessage("All Levels Complete!\nCongratulations!");
  }, []);

  // All engine hooks passed as props
  const gameEngineProps = {
    onGameStateUpdate: handleGameStateUpdate,
    onGameOver: handleGameOver,
    onNextLevel: handleNextLevel,
    onAllLevelsComplete: handleAllLevelsComplete,
    lives, score, gems, maxGems, level: currentLevel,
    gameFlowOverlay,
    onDismissOverlay: handleResumeAfterOverlay,
  };

  // Robust error fallback render if screen/overlay is corrupt.
  let content = null;
  try {
    content = (
      <GameLayout screen={screen}>
        {screen === 'menu' && (
          <MainMenu
            onStartGame={handleStartGame}
            onShowSettings={() => showOverlay('settings')}
            onShowAchievements={() => showOverlay('achievements')}
            onShowLeaderboards={() => showOverlay('leaderboards')}
            onShowLevelSelect={handleShowLevelSelect}
          />
        )}
        {screen === 'levelselect' && (
          <LevelSelect
            onBack={handleReturnToMenu}
            // onSelectLevel: to be expanded in future.
          />
        )}
        {screen === 'game' && (
          <>
            <HUD score={score} lives={lives} gems={gems} maxGems={maxGems} />
            <GameEngine {...gameEngineProps} />
            {gameFlowOverlay && (
              <div className="overlay"
                style={{
                  position: "fixed", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  minWidth: 280, minHeight: 100, zIndex: 50,
                  background: 'var(--px-window, #222d)',
                  border: '4px solid var(--px-hud-border, #8cf)',
                  boxShadow: '0 0 20px #3339',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Press Start 2P',monospace",
                  color: '#ffd700',
                  textAlign: "center",
                  fontSize: 22,
                  padding: "30px 18px",
                }}>
                <div style={{ marginBottom: 16, whiteSpace: "pre-line" }}>{gameOverlayMessage}</div>
                <button
                  className="px-btn"
                  style={{ marginTop: 18, fontSize: "1rem" }}
                  autoFocus
                  tabIndex={0}
                  onClick={
                    gameFlowOverlay === 'gameover' ? handleReturnToMenu :
                      handleResumeAfterOverlay
                  }
                >
                  {gameFlowOverlay === 'gameover'
                    ? 'Return to Menu'
                    : (gameFlowOverlay === "allcomplete" ? '🎉 Menu' : 'Continue')}
                </button>
              </div>
            )}
          </>
        )}
        {overlay === 'settings' && (
          <SettingsOverlay onClose={closeOverlay} />
        )}
        {overlay === 'achievements' && (
          <AchievementsOverlay onClose={closeOverlay} />
        )}
        {overlay === 'leaderboards' && (
          <LeaderboardsOverlay onClose={closeOverlay} />
        )}
      </GameLayout>
    );
  } catch (e) {
    // Robust error fallback UI
    content = (
      <div style={{
        color: "#ffd6a3", background: "#401020", border: "3px solid #fc4", padding: 22,
        fontFamily: "'Press Start 2P', monospace"
      }}>
        <h2>Oops! The game encountered a crash.</h2>
        <div style={{ color: "#fff" }}>Please reload or return to the menu.<br />Error: <span style={{ color: "#fb6" }}>{e.message}</span></div>
        <button className="px-btn" style={{ marginTop: 16 }} onClick={handleReturnToMenu}>Return to Menu</button>
      </div>
    );
  }

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      {content}
    </div>
  );
}

export default App;
