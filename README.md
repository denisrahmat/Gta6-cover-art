# COMIC VICE — Cover Studio (comic-book poster maker)

A web app that turns your photos and a caption into a **comic-book style
GTA 6 poster**: halftone dots, thick black outlines, speed lines, speech
bubbles, and original illustrated characters you can stick onto the cover.

## What it does

- **Comic poster engine** — 8 comic layouts (Splash, Grid, Diagonal, Slash,
  Trio, Duo, Strip, Solo) and 8 comic grades (Halftone, Pop-Art, Ink, Neon,
  Sunset, Noir, Candy, Miami), all drawn live on canvas.
- **Original characters** — 5 hand-drawn comic cutouts (Jax, Luna, Rico,
  Vega, Sunny) you can place, drag, scale and flip on the cover. Every
  character is original vector art drawn in code — no Rockstar artwork,
  logos or fonts anywhere.
- **Any photo** — load your own photos (or the two model-made samples),
  assign them to panels, drag to pan, scroll to zoom, smart-crop keeps
  faces in frame.
- **Comic lettering** — huge outlined title with a highlight stripe, optional
  speech-bubble caption, STARRING role tags and a movie-poster billing strip.
- **Export** — one click to PNG at 1920×1080, 1080×1080 or 1080×1350.

## Run it

Serve `app/` with any static server and open `index.html` in desktop
Chrome. No network requests, no build step, photos never leave your machine.

```
cd app && python3 -m http.server 8080
```

## Hand-in

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to
`/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json`
with the vendored make.fun library.
