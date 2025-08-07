import React from 'react';

/**
 * GameLayout - Main responsive layout wrapper for the game.
 * Places side HUD, topbar, and the main game area appropriately.
 * Handles showing overlays and menus.
 */
// PUBLIC_INTERFACE
const GameLayout = ({ children, screen }) => (
  <div className="game-layout">
    {children}
  </div>
);

export default GameLayout;
