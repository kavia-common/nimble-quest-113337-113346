# Image Assets

Place 2D pixel-art sprites/tilesheets/backgrounds here for your platformer.

## Adding Modern-Retro Backgrounds/Parallax

To enhance backgrounds and parallax, add pixel-art .png files named `bg_layer0.png`, `bg_layer1.png`, `bg_layer2.png` etc. for layered backgrounds. Each layer should be 320x180 or wider, horizontally tiling for side-scroll. Order: 0 (furthest/sky), 1 (midground), 2 (foreground accent).

- `bg_layer0.png`: Sky/background (furthest)
- `bg_layer1.png`: Distant landscape/decoration
- `bg_layer2.png`: Foreground/background accents

Recommended size: 320x180 or 640x180 for seamless horizontal wrap.
Each layer will scroll at different speeds for rich parallax.

To change the base parallax or replace the fallback gradients, place PNGs with these names in this folder. They will be auto-used by VisualEffects/ParallaxBackground.

## Sprites, Tiles, and Objects

Continue to place all 2D pixel-art for player, enemies, tilesets, and collectibles in this folder. Adjust filenames and code references as you add new sprites for the modern-retro look.

- Sprite: `player.png`, `enemy_slime.png`
- Tileset: `tiles.png`
- Gem/artifact: `gem.png`, `item_*.png`

All images should use a transparent background (RGBA PNG). Use sharp, hand-placed pixels for modern-retro authenticity.
