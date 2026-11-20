[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/denisrahmat/Gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/denisrahmat/Gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01) — the "Make GTA 6 Cover Art" bounty ($250 in USDC).

# COMIC VICE — Cover Studio

A comic-poster cover art maker that runs fully offline in a desktop browser. Upload your own photo (or use the built-in sample portrait), pick one of 8 layouts and 8 comic grades, place 5 original procedurally drawn cartoon characters on the cover, and export a finished poster as a PNG in 1920×1080, 1080×1080 or 1080×1350.

## What it does

- **Any photo**: upload a photo from your machine (nothing is ever uploaded anywhere) or use the built-in sample portrait. A smart crop scores candidate crops by edge energy with an upper-half (face) bias, so the photo is framed well automatically. Drag to reposition, scroll to zoom.
- **8 layouts**: hero-left, hero-right, triptych, diagonal split, stacked panels, full-bleed with the title over the art, centered solo, and duotone poster.
- **8 comic grades**: real pixel effects on the photo — halftone, high-contrast ink, duotone, posterize, warm sunset, cool neon, noir, and candy.
- **5 original characters**: JAX (the driver), LUNA (the partner), RICO (the biker), VEGA (the law), and SUNNY (the local) — flat cartoon figures drawn in code. Drag them around the cover, scale them, flip them; each carries a small role-tag chip.
- **Comic poster furniture**: a yellow halftone-dot field with speed lines, a big slanted "COMIC VICE" title, a speech bubble reading "TWO OUTLAWS. ONE CITY.", and a movie-style billing strip along the bottom.
- **One-click export**: PNG at 1920×1080, 1080×1080, or 1080×1350.

## How to run it

Serve `app/` with any static file server, then open `index.html` in desktop Chrome. For example, from this repository:

```sh
node serve.ts
```

then open http://localhost:8080. The app makes zero network requests; every script, image and font is a file under `app/` (lettering uses system font stacks only).

## Layout

- `main.ts` — hands `app/` and `screenshots/` in and writes `dossier.json` (Node 22, standard library only).
- `app/index.html` — the editor page.
- `app/style.css` — the editor styling.
- `app/src/main.js` — the editor: upload, layout and grade pickers, character tray, dragging, export.
- `app/src/cover.js` — the cover renderer: layouts, halftone field, title, speech bubble, billing strip, and the export pipeline.
- `app/src/characters.js` — the five original cartoon characters, drawn in code.
- `app/src/smartcrop.js` — the smart crop: edge-energy scoring with a face bias.
- `app/src/shots.js` — fixed screenshot scenes (`?shot=editor` and `?shot=cover`).
- `app/samples/portrait.png` — the built-in sample portrait, drawn procedurally.
- `screenshots/` — screenshots of the app at work and covers it exported.

## License

MIT — see `LICENSE`. All artwork, characters and lettering are original; no Rockstar Games logo, artwork or font is used.
