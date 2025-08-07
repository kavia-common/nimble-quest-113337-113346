// PUBLIC_INTERFACE
import React, { useState, useEffect } from 'react';
import './App.css';

// Main scaffolding imports
import GameLayout from './components/GameLayout';
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import HUD from './components/HUD';
import SettingsOverlay from './components/SettingsOverlay';
import AchievementsOverlay from './components/AchievementsOverlay';
import LeaderboardsOverlay from './components/LeaderboardsOverlay';
import GameEngine from './engine/GameEngine';

function App() {
  const [theme, setTheme] = useState('light');
  const [overlay, setOverlay] = useState(null); // null, overlay name, or game overlays
  const [screen, setScreen] = useState('menu'); // 'menu', 'levelselect', 'game'

  // Persistent, top-level game state for score, lives, collectibles
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gems, setGems] = useState(0);
  const [maxGems, setMaxGems] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  // Overlay mode for game stages: 'gameover', 'nextlevel', etc
  const [gameFlowOverlay, setGameFlowOverlay] = useState(null);
  const [gameOverlayMessage, setGameOverlayMessage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  // Navigation/progression handlers
  const handleStartGame = () => {
    // reset persistent fields on new game
    setScore(0);
    setLives(3);
    setGems(0);
    setMaxGems(0);
    setCurrentLevel(0);
    setGameFlowOverlay(null);
    setGameOverlayMessage("");
    setScreen('game');
  };

  const handleShowLevelSelect = () => {
    setScreen('levelselect');
  };

  const handleReturnToMenu = () => {
    setScreen('menu');
    setGameFlowOverlay(null);
  };

  const showOverlay = o => setOverlay(o);
  const closeOverlay = () => setOverlay(null);

  // These are called by GameEngine to update state/hud values
  const handleGameStateUpdate = ({score: nextScore, lives: nextLives, gems: nextGems, maxGems: nextMaxGems, level: nextLevel}) => {
    setScore(nextScore);
    setLives(nextLives);
    setGems(nextGems);
    setMaxGems(nextMaxGems);
    setCurrentLevel(nextLevel);
  };

  // Triggered by GameEngine events
  const handleGameOver = () => {
    setGameFlowOverlay('gameover');
    setGameOverlayMessage("Game Over");
  };

  const handleNextLevel = ({levelName}) => {
    setGameFlowOverlay('nextlevel');
    setGameOverlayMessage(`Level Complete! ${levelName ? 'Next: ' + levelName : ''}`);
    // Automatically clear overlay after a short moment (if desired)
  };

  const handleResumeAfterOverlay = () => {
    setGameFlowOverlay(null);
  };

  // Allow GameEngine to request a return to menu when all levels complete, etc.
  const handleAllLevelsComplete = () => {
    setGameFlowOverlay('allcomplete');
    setGameOverlayMessage("All Levels Complete!\nCongratulations!");
  };

  // Props to pass to GameEngine
  const gameEngineProps = {
    onGameStateUpdate: handleGameStateUpdate,
    onGameOver: handleGameOver,
    onNextLevel: handleNextLevel,
    onAllLevelsComplete: handleAllLevelsComplete,
    lives,
    score,
    gems,
    maxGems,
    level: currentLevel,
    gameFlowOverlay,
    onDismissOverlay: handleResumeAfterOverlay,
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
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
            // Future: add onSelectLevel
          />
        )}
        {screen === 'game' && (
          <>
            <HUD score={score} lives={lives} gems={gems} maxGems={maxGems} />
            <GameEngine {...gameEngineProps} />
            {/* Overlays for game over, next level, etc. */}
            {gameFlowOverlay && (
              <div className="overlay" style={{
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
                <div style={{marginBottom:16}}>{gameOverlayMessage}</div>
                <button
                  className="px-btn"
                  style={{marginTop:18, fontSize:"1rem"}}
                  autoFocus
                  tabIndex={0}
                  onClick={
                    gameFlowOverlay === 'gameover' ? handleReturnToMenu
                    : handleResumeAfterOverlay
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
        {/* Overlay Stubs: Show only when overlay state is set */}
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
    </div>
  );
}

export default App;
