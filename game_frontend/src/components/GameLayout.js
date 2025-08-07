import React from 'react';

// PUBLIC_INTERFACE
/**
 * GameLayout - Main responsive layout wrapper for the game, providing pixel-art outer frame,
 * fixed positioning for overlays/menus, and a crisp border box for everything.
 * Ensures overlays and menus never overflow.
 * @param {React.ReactNode} children - Main content
 * @param {string} screen - Active screen
 */
const GameLayout = ({ children, screen }) => (
  <div
    className="game-layout"
    style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--px-bg, #181824)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      justifyContent: 'center',
      boxShadow: '0 0 0 7px var(--px-shadow) inset',
      outline: '6px solid var(--px-hud-border, #5a4fb3)',
      outlineOffset: '-7px',
      margin: 0,
      padding: 0,
      zIndex: 0,
    }}
  >
    {children}
  </div>
);

export default GameLayout;
