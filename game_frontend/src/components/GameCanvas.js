import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * GameCanvas
 * A reusable React-wrapper for the game's HTML5 canvas.
 * Handles physical pixel scaling for crisp pixel-art (uses imageRendering: "pixelated").
 * Forwards imperative methods for engine use (draw, getContext, etc).
 * 
 * Props:
 *   width, height: Logical canvas size in pixels.
 *   scale: Pixel scaling factor (integer).
 *   onCanvasReady: Callback when canvas is first ready (optional).
 * 
 * Usage:
 *  <GameCanvas ref={canvasRef} width={320} height={180} scale={2} />
 */
// PUBLIC_INTERFACE
const GameCanvas = forwardRef(({ width, height, scale = 2, onCanvasReady }, ref) => {
  const canvasRef = useRef(null);

  // Expose imperative API for engine/parent components
  useImperativeHandle(ref, () => ({
    getContext: (mode = '2d') =>
      canvasRef.current ? canvasRef.current.getContext(mode) : null,
    getCanvas: () => canvasRef.current
  }), []);

  // Physical size/scale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set physical pixel size for a crisp pixel-art look
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    canvas.style.background = '#181824'; // Placeholder dark background.
    canvas.style.imageRendering = 'pixelated';
    if (onCanvasReady) onCanvasReady(canvas);
  }, [width, height, scale, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-canvas"
      tabIndex={0} // Allows keyboard focus if needed later
      width={width}
      height={height}
      aria-label="Pixel game canvas"
      style={{
        outline: "none",
        imageRendering: "pixelated",
        MozImageRendering: "pixelated",
        msInterpolationMode: "nearest-neighbor"
      }}
    />
  );
});

export default GameCanvas;
