import React from 'react';

/**
 * GameLayout - Main responsive layout wrapper for the game.
 * Places side HUD, topbar, and the main game area appropriately.
 * Handles showing overlays and menus.
 */
// PUBLIC_INTERFACE
const GameLayout = ({ children }) => (
  <div className="game-layout">
    {/* TODO: Add responsive layout logic and style */}
    {children}
  </div>
);

export default GameLayout;
