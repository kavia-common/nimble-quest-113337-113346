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

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [overlay, setOverlay] = useState(null); // null, 'settings', 'achievements', 'leaderboards'
  const [screen, setScreen] = useState('menu'); // 'menu', 'levelselect', 'game'

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
    setScreen('game');
  };

  const handleShowLevelSelect = () => {
    setScreen('levelselect');
  };

  const handleReturnToMenu = () => {
    setScreen('menu');
  };

  const showOverlay = o => setOverlay(o);
  const closeOverlay = () => setOverlay(null);

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
            <HUD />
            <GameEngine />
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
