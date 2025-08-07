/**
 * CloudsBackground.js
 * Layered/parallax pixel-art cloud generator and animation for vibrant retro platformer backgrounds.
 * Renders clusters of stylized clouds for a playful, non-distracting effect.
 * By default, generates 2-3 cloud layers with randomized speed, density, and y position.
 *
 * Usage: (Invoke in canvas draw code, before gameplay elements)
 *   const cloudsBg = new CloudsBackground(width, height, { style: 'retro' });
 *   cloudsBg.draw(ctx, timeElapsed); // timeElapsed in seconds
 */
export class CloudsBackground {
  /**
   * @param {number} width - Width of canvas in px
   * @param {number} height - Height of canvas in px
   * @param {object} [opts] - { style: "retro"/"modern", palette: Array<string> }
   */
  constructor(width, height, opts = {}) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.palette =
      opts.palette ||
      ["#fff5ec", "#ffe4b3", "#d1f0ff", "#c6e2ff", "#e7f7ff", "#ffefff"];
    // Set up 2-3 layers of clouds with various speed/depth (back to front)
    const layerConfigs = [
      { count: 5, speed: 8, size: 1.25, alpha: 0.18 },
      { count: 7, speed: 18, size: 1.0, alpha: 0.29 },
      { count: 10, speed: 32, size: 0.7, alpha: 0.42 }
    ];
    for (let li = 0; li < layerConfigs.length; ++li) {
      let l = layerConfigs[li];
      // Each layer is a set of cloud sprite objects, randomly scattered
      let clouds = [];
      for (let i = 0; i < l.count; ++i) {
        clouds.push({
          x: Math.random() * this.width,
          y:
            li === 0
              ? 18 + Math.random() * 45
              : li === 1
              ? 65 + Math.random() * 46
              : 120 + Math.random() * 60,
          w: 54 + Math.random() * 40,
          h: 16 + Math.random() * 14,
          speed: l.speed * (0.79 + Math.random() * 0.36),
          paletteIdx: Math.floor(Math.random() * this.palette.length),
          size: l.size * (0.85 + Math.random() * 0.25),
          alpha: l.alpha,
          flip: Math.random() < 0.5
        });
      }
      this.layers.push({ clouds, ...l });
    }
  }

  /** Utility: Draw a single chunky-pixel cloud sprite */
  drawCloud(ctx, x, y, w, h, style = "retro", color = "#fff", alpha = 1, flip = false) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = color;

    // Stylized chunky cloud: draw 3-5 overlapping ellipse-puffs for chunky pixel look
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.39, h * 0.38, 0, 0, Math.PI * 2);
    ctx.ellipse(-w * 0.15, h * 0.13, w * 0.19, h * 0.27, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.22, h * 0.05, w * 0.22, h * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(-w * 0.28, -h * 0.07, w * 0.16, h * 0.12, 0, 0, Math.PI * 2);
    // Outline for more visible pixel edges
    ctx.shadowColor = "#e67e22";
    ctx.shadowBlur = 0.5;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffe4b3";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.385, h * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw all the animated clouds, offsetting their position by layer speed and time for parallax.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time - Elapsed time in seconds (use performance.now()/1000)
   */
  draw(ctx, time = 0) {
    for (let l = 0; l < this.layers.length; ++l) {
      let layer = this.layers[l];
      ctx.save();
      ctx.globalAlpha = layer.alpha;
      for (let cloud of layer.clouds) {
        // Parallax: Clouds scroll horizontally, loop seamlessly
        let cloudX =
          ((cloud.x + cloud.speed * time) % (this.width + 74)) - 74;
        this.drawCloud(
          ctx,
          cloudX,
          cloud.y,
          cloud.w * cloud.size,
          cloud.h * cloud.size,
          "retro",
          this.palette[cloud.paletteIdx],
          cloud.alpha,
          cloud.flip
        );
      }
      ctx.restore();
    }
  }
}

export default CloudsBackground;
