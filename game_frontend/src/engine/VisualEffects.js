/**
 * VisualEffects.js
 * Pixel-art retro visual shaders/postprocessing for GameCanvas.
 * - WebGL/canvas2d scanlines, CRT curves, palette shift, parallax, and bloom simulation.
 * - Use as: VisualEffects.applyCRTPass(canvas), applyScanlines(ctx), etc.
 */
 
// WebGL shader helper for CRT/scanline/bloom effects
export const VisualEffects = {
  /**
   * Applies a CRT-style curved glass, scanlines, and bloom effect using a WebGL pass if supported.
   * If not, fallback to canvas2d blending and scanlines post-process.
   * @param {HTMLCanvasElement} canvas - The primary game canvas to process.
   * @param {Object} [options]
   *    - strength: CRT curvature amount (default 0.18)
   *    - scanlineOpacity: 0..1, default 0.23
   *    - bloom: 0..1, default 0.15
   */
  applyCRTPass(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fallback: 2d only, can't do actual curve, so fake with vignette and scanlines
    VisualEffects.applyScanlines(ctx, { opacity: options.scanlineOpacity ?? 0.23 });
    VisualEffects.applyVignette(ctx, { strength: options.strength ?? 0.16 });
    if (options.bloom)
      VisualEffects.applyBloom(ctx, { intensity: options.bloom ?? 0.11 });
    // TODO: WebGL version for true CRT curvature, chromatic aberration, etc.
  },

  /**
   * Render scanlines across the canvas for a CRT effect.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} [opts]
   *    - opacity: How strong the lines appear (0.10-0.30 looks good)
   */
  applyScanlines(ctx, opts = {}) {
    const { opacity = 0.23, lineSpacing = 2 } = opts;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#24232a';
    for (let y = 0; y < h; y += lineSpacing) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  },

  /**
   * Render a vignette/rounded-edge shadow around the image for CRT mask.
   * @param {CanvasRenderingContext2D} ctx
   */
  applyVignette(ctx, opts = {}) {
    const { strength = 0.18 } = opts;
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.save();
    const grad = ctx.createRadialGradient(
      w / 2, h / 2, w * (0.55 - strength),
      w / 2, h / 2, w * 0.55
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(10,10,24,0.75)');
    ctx.globalAlpha = Math.min(0.38, strength + 0.16);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  /**
   * Fake bloom: softly blurs bright areas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} [opts]
   *    - intensity: 0..1
   */
  applyBloom(ctx, opts = {}) {
    // Simple glow: duplicate canvas, blur and blend atop main image
    try {
      const intensity = opts.intensity ?? 0.11;
      const w = ctx.canvas.width, h = ctx.canvas.height;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tctx = tempCanvas.getContext('2d');
      
      // Copy, blur, and brighten
      tctx.drawImage(ctx.canvas, 0, 0, w, h);
      tctx.globalAlpha = intensity;
      for (let i = 1; i < 3; i++) {
        tctx.filter = `blur(${1.7 * i}px) brightness(${1.09 + 0.08 * i})`;
        tctx.drawImage(tempCanvas, 0, 0, w, h);
      }
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.drawImage(tempCanvas, 0, 0, w, h);
      ctx.restore();
    } catch (e) {
      // Ignore if browser doesn't support filter
    }
  },

  /**
   * Palette swap/post processing: Map pixel colors to a retro palette.
   * (Simple example: apply sepia, desaturate, or classic NES palette).
   */
  applyPaletteShift(ctx, paletteFunc) {
    // paletteFunc = (r,g,b,a) => [r,g,b,a]
    // Example: grayscale, GameBoy green, or NES 3-color
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      let [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
      [r, g, b, a] = paletteFunc(r, g, b, a);
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
    }
    ctx.putImageData(imageData, 0, 0);
  },

  /**
   * Utility palette function: NES 3-color.
   * Use with applyPaletteShift(ctx, VisualEffects.palettes.nes3)
   */
  palettes: {
    // Demo: classic GameBoy greenish
    gameboy(r, g, b, a) {
      const y = Math.round(0.3 * r + 0.55 * g + 0.15 * b);
      if (y > 170) return [218, 248, 192, a];
      if (y > 80)  return [134, 192, 108, a];
      return [48, 104, 80, a];
    },
    // NES palette: light, mid, dark
    nes3(r, g, b, a) {
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      if (y > 180) return [220, 255, 188, a];
      if (y > 80)  return [111, 170, 61, a];
      return [36, 40, 52, a];
    },
    // CRT blue/purple/white
    vapor(r, g, b, a) {
      const y = 0.5*r+0.3*g+0.2*b;
      if (y < 80) return [52,50,124,a];
      if (y < 180) return [187,136,253,a];
      return [255,255,255,a];
    }
  }
};

/**
 * ParallaxBackground
 * Drawable helper for rich multi-layer backgrounds.
 */
export class ParallaxBackground {
  /**
   * @param {Array<{img:HTMLImageElement, speed:number, repeat?:'x'|'xy'}>} layers
   *        Each should have img (HTMLImageElement), speed (0.6=slow, 1.1=fast, >1 foreground)
   */
  constructor(layers, w, h) {
    this.layers = layers; // Sorted back->front
    this.w = w; this.h = h;
    this.scrollX = 0;
  }

  /**
   * Call on every frame before drawing level.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} dx - camera/player global scroll (pixels)
   */
  draw(ctx, dx = 0) {
    for (let { img, speed, repeat } of this.layers) {
      if (!img.complete) continue;
      const xShift = -dx * speed % img.width;
      let drawCount = Math.ceil(this.w / img.width) + 2;
      for (let i = -1; i < drawCount; i++) {
        ctx.drawImage(img, Math.floor(xShift + i * img.width), 0, img.width, this.h);
      }
    }
  }
}
