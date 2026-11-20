[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/denisrahmat/Gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/denisrahmat/Gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01) — the "Make GTA 6 Cover Art" bounty ($250 in USDC).

# VICE NIGHTS — Cover Studio

A GTA-style cover art maker. One canvas, one scene: a procedural Vice City
illustration (sunset sky, slatted synthwave sun, skyline, palms, neon sea)
fused with your photos in diagonal, overlapping panels and a striped
chrome 3D title — exported as a shareable PNG.

## What it does

- **Any photo**: load your own photos (file picker or drag & drop), or use
  the two kit sample photos. Click a thumbnail, then a panel, to place it.
- **8 layouts**: Pop-Out, Diagonal, Slash, Stack, Triptych, Duotone, Arch,
  Solo. Pop-Out bursts the hero photo out of its frame in a neon badge.
- **Photo treatments**: Photo, Ink (posterised painting), Flat (flat
  colour), Rim light (hot grade + neon frame edge).
- **Smart crop**: detail-aware framing that keeps the busiest part of the
  photo — faces first — inside the panel.
- **Chrome 3D title**: striped retro-chrome lettering with a hard
  extrusion, stacked over the artwork, plus a STARRING chip, a round seal
  and a movie-poster billing strip.
- **8 colour grades**: Sunset, Vice, Neon, Miami, Gold, Dusk, Candy, Noir.
- **Export PNG**: 1920×1080, 1080×1080, 1080×1350 — exactly what the
  preview shows.

## Run it

Serve `app/` with any static file server and open `index.html` in desktop
Chrome. No build step, no network requests, nothing is uploaded.

```sh
node --experimental-strip-types main.ts   # or: MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the kit's `buildDossier` from
`vendor/makefun-app.ts` (the kit's copy, unchanged).

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor chrome
- `app/src/poster.js` — all rendering and editor logic
- `app/samples/` — the kit's two sample photos (image-model made, free to use)
- `screenshots/` — 4 screenshots taken with headless Chrome
- `main.ts` — the entry program
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged
