// COMIC VICE — the cover renderer. One function, renderCover, paints the
// whole poster on any 2d context at any size: halftone field, photo panels,
// slanted title, speech bubble, characters with role chips, billing strip.

import { CHARACTERS, characterCanvas } from './characters.js';

export const LAYOUTS = [
  { id: 'hero-left', name: 'Hero Left', desc: 'Big photo left, cast on the right' },
  { id: 'hero-right', name: 'Hero Right', desc: 'Big photo right, cast on the left' },
  { id: 'triptych', name: 'Triptych', desc: 'Three vertical photo strips' },
  { id: 'diagonal', name: 'Diagonal', desc: 'Slanted split, two panels' },
  { id: 'stacked', name: 'Stacked', desc: 'Two stacked wide panels' },
  { id: 'fullbleed', name: 'Full Bleed', desc: 'Photo fills the cover, title over it' },
  { id: 'solo', name: 'Solo', desc: 'One centred portrait panel' },
  { id: 'duotone-poster', name: 'Poster', desc: 'Big photo, giant title block below' },
];

export const GRADES = [
  { id: 'sunset', name: 'Sunset', desc: 'Warm golden-hour glow' },
  { id: 'halftone', name: 'Halftone', desc: 'Posterised print dots' },
  { id: 'ink', name: 'Ink', desc: 'High-contrast black & white' },
  { id: 'duotone', name: 'Duotone', desc: 'Purple shadows, yellow light' },
  { id: 'posterize', name: 'Posterize', desc: 'Four flat colour levels' },
  { id: 'neon', name: 'Neon', desc: 'Cool cyan, hot magenta' },
  { id: 'noir', name: 'Noir', desc: 'Moody grey, deep vignette' },
  { id: 'candy', name: 'Candy', desc: 'Bright, sweet and saturated' },
];

// ---------- photo grading (pixel effects on a downscaled copy) ----------

function gradeCanvas(img, fn, after) {
  const w = Math.min(1100, img.naturalWidth || img.width);
  const h = Math.round(w * ((img.naturalHeight || img.height) / (img.naturalWidth || img.width)));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, w, h);
  const data = g.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const out = fn(px[i], px[i + 1], px[i + 2]);
    px[i] = out[0]; px[i + 1] = out[1]; px[i + 2] = out[2];
  }
  g.putImageData(data, 0, 0);
  if (after) after(g, w, h);
  return c;
}

const clamp = (v) => Math.max(0, Math.min(255, v));
function saturate(r, g, b, s) {
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return [clamp(l + (r - l) * s), clamp(l + (g - l) * s), clamp(l + (b - l) * s)];
}

export function gradePhoto(img, grade) {
  switch (grade) {
    case 'sunset':
      return gradeCanvas(img, (r, g, b) => {
        const [sr, sg, sb] = saturate(r, g, b, 1.25);
        return [clamp(sr * 1.16 + 16), clamp(sg * 1.02), clamp(sb * 0.72)];
      });
    case 'neon':
      return gradeCanvas(img, (r, g, b) => {
        const [sr, sg, sb] = saturate(r, g, b, 1.6);
        const l = 0.299 * sr + 0.587 * sg + 0.114 * sb;
        return [clamp(sr + (l > 140 ? 30 : -10)), clamp(sg * 1.05), clamp(sb + (l < 120 ? 34 : 0))];
      });
    case 'duotone':
      return gradeCanvas(img, (r, g, b) => {
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // deep purple shadows -> magenta mid -> yellow light
        const lo = [43, 16, 85], mid = [214, 40, 110], hi = [255, 210, 31];
        const a = l < 0.5 ? lo.map((v, i) => v + (mid[i] - v) * (l / 0.5))
                          : mid.map((v, i) => v + (hi[i] - v) * ((l - 0.5) / 0.5));
        return a;
      });
    case 'ink':
      return gradeCanvas(img, (r, g, b) => {
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = 255 / (1 + Math.exp(-(l - 128) / 16));
        const q = Math.round(v / 42) * 42;
        return [q, q, q];
      });
    case 'posterize':
      return gradeCanvas(img, (r, g, b) => {
        const q = (v) => Math.round(v / 64) * 64;
        return saturate(q(r), q(g), q(b), 1.35);
      });
    case 'halftone':
      return gradeCanvas(img, (r, g, b) => {
        const q = (v) => Math.round(v / 85) * 85;
        return saturate(q(r), q(g), q(b), 1.15);
      }, (g, w, h) => {
        // print dots: black dots sized by local darkness
        const step = 9;
        for (let y = step / 2; y < h; y += step) {
          for (let x = step / 2; x < w; x += step) {
            const d = g.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            const l = (0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]) / 255;
            const rad = (1 - l) * step * 0.62;
            if (rad > 0.8) {
              g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2);
              g.fillStyle = 'rgba(20,16,30,0.85)'; g.fill();
            }
          }
        }
      });
    case 'noir':
      return gradeCanvas(img, (r, g, b) => {
        const l = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = clamp((l - 128) * 1.5 + 128);
        return [v, v, v];
      }, (g, w, h) => {
        const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.55)');
        g.fillStyle = vg; g.fillRect(0, 0, w, h);
      });
    case 'candy':
    default:
      return gradeCanvas(img, (r, g, b) => {
        const [sr, sg, sb] = saturate(r, g, b, 1.7);
        return [clamp(sr * 1.08 + 8), clamp(sg * 1.06), clamp(sb * 1.1 + 6)];
      });
  }
}

// ---------- layout specs (all fractions of W and H) ----------

function spec(over) {
  return Object.assign({
    panels: [], title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
    bubble: { x: 0.5, y: 0.86, w: 0.42, tail: 'left' },
    slots: [], billing: true, frame: true,
  }, over);
}

export function layoutSpec(name, W, H) {
  const layouts = {
    'hero-left': spec({
      panels: [{ x: 0.045, y: 0.215, w: 0.52, h: 0.62, rot: -2, photo: 'main' }],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.47, y: 0.24, w: 0.26, tail: 'left' },
      slots: [
        { x: 0.69, y: 0.58, s: 0.30 }, { x: 0.88, y: 0.55, s: 0.30 },
        { x: 0.63, y: 0.90, s: 0.28 }, { x: 0.78, y: 0.90, s: 0.28 },
        { x: 0.93, y: 0.90, s: 0.28 },
      ],
    }),
    'hero-right': spec({
      panels: [{ x: 0.435, y: 0.215, w: 0.52, h: 0.62, rot: 2, photo: 'main' }],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.53, y: 0.24, w: 0.26, tail: 'right' },
      slots: [
        { x: 0.31, y: 0.58, s: 0.30 }, { x: 0.12, y: 0.55, s: 0.30 },
        { x: 0.37, y: 0.90, s: 0.28 }, { x: 0.22, y: 0.90, s: 0.28 },
        { x: 0.07, y: 0.90, s: 0.28 },
      ],
    }),
    triptych: spec({
      panels: [
        { x: 0.045, y: 0.215, w: 0.29, h: 0.58, rot: -2, photo: 'left' },
        { x: 0.355, y: 0.215, w: 0.29, h: 0.58, rot: 0, photo: 'main' },
        { x: 0.665, y: 0.215, w: 0.29, h: 0.58, rot: 2, photo: 'right' },
      ],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.5, y: 0.86, w: 0.46, tail: 'left' },
      slots: [
        { x: 0.16, y: 0.86, s: 0.28 }, { x: 0.36, y: 0.86, s: 0.28 },
        { x: 0.56, y: 0.86, s: 0.28 }, { x: 0.76, y: 0.86, s: 0.28 },
        { x: 0.90, y: 0.86, s: 0.28 },
      ],
    }),
    diagonal: spec({
      panels: [
        { x: 0.04, y: 0.215, w: 0.62, h: 0.55, rot: -5, photo: 'main' },
        { x: 0.60, y: 0.52, w: 0.36, h: 0.34, rot: 3, photo: 'bottom' },
      ],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.74, y: 0.22, w: 0.32, tail: 'left' },
      slots: [
        { x: 0.30, y: 0.84, s: 0.32 }, { x: 0.50, y: 0.86, s: 0.32 },
        { x: 0.68, y: 0.88, s: 0.30 }, { x: 0.86, y: 0.88, s: 0.30 },
        { x: 0.12, y: 0.86, s: 0.28 },
      ],
    }),
    stacked: spec({
      panels: [
        { x: 0.06, y: 0.215, w: 0.88, h: 0.28, rot: -1, photo: 'top' },
        { x: 0.06, y: 0.52, w: 0.88, h: 0.28, rot: 1, photo: 'bottom' },
      ],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.5, y: 0.88, w: 0.44, tail: 'left' },
      slots: [
        { x: 0.14, y: 0.88, s: 0.26 }, { x: 0.34, y: 0.88, s: 0.26 },
        { x: 0.54, y: 0.88, s: 0.26 }, { x: 0.74, y: 0.88, s: 0.26 },
        { x: 0.90, y: 0.88, s: 0.26 },
      ],
    }),
    fullbleed: spec({
      panels: [{ x: 0, y: 0, w: 1, h: 1, rot: 0, photo: 'main', bleed: true }],
      title: { x: 0.5, y: 0.05, size: 0.12, align: 'center', rot: -3 },
      bubble: { x: 0.5, y: 0.80, w: 0.44, tail: 'left' },
      slots: [
        { x: 0.18, y: 0.62, s: 0.34 }, { x: 0.38, y: 0.66, s: 0.34 },
        { x: 0.58, y: 0.66, s: 0.34 }, { x: 0.78, y: 0.62, s: 0.34 },
        { x: 0.92, y: 0.70, s: 0.30 },
      ],
    }),
    solo: spec({
      panels: [{ x: 0.30, y: 0.215, w: 0.40, h: 0.60, rot: -2, photo: 'main' }],
      title: { x: 0.5, y: 0.03, size: 0.10, align: 'center', rot: -3 },
      bubble: { x: 0.5, y: 0.85, w: 0.46, tail: 'left' },
      slots: [
        { x: 0.14, y: 0.80, s: 0.32 }, { x: 0.86, y: 0.80, s: 0.32 },
        { x: 0.14, y: 0.55, s: 0.30 }, { x: 0.86, y: 0.55, s: 0.30 },
        { x: 0.50, y: 0.86, s: 0.28 },
      ],
    }),
    'duotone-poster': spec({
      panels: [{ x: 0.06, y: 0.10, w: 0.88, h: 0.50, rot: 0, photo: 'main' }],
      title: { x: 0.5, y: 0.63, size: 0.13, align: 'center', rot: -2 },
      bubble: { x: 0.5, y: 0.16, w: 0.44, tail: 'left' },
      slots: [
        { x: 0.16, y: 0.59, s: 0.26 }, { x: 0.36, y: 0.59, s: 0.26 },
        { x: 0.56, y: 0.59, s: 0.26 }, { x: 0.76, y: 0.59, s: 0.26 },
        { x: 0.90, y: 0.59, s: 0.26 },
      ],
    }),
  };
  return layouts[name] || layouts['hero-left'];
}

// ---------- photo placement helpers ----------

// Source window (in graded-canvas pixels) that covers a panel of the given
// aspect, from the smart-crop window, the user's pan and zoom.
function coverWindow(gw, gh, crop, pan, zoom, aspect) {
  const k = gw / crop.ow; // original photo px -> graded px
  let cw = crop.sw * k / zoom, ch = crop.sh * k / zoom;
  if (cw / ch > aspect) cw = ch * aspect; else ch = cw / aspect;
  let cx = (crop.sx + crop.sw / 2) * k + (pan.x - 0.5) * (crop.sw * k - cw) * 0.8;
  let cy = (crop.sy + crop.sh / 2) * k + (pan.y - 0.5) * (crop.sh * k - ch) * 0.8;
  cx = Math.max(cw / 2, Math.min(gw - cw / 2, cx));
  cy = Math.max(ch / 2, Math.min(gh - ch / 2, cy));
  return { sx: cx - cw / 2, sy: cy - ch / 2, sw: cw, sh: ch };
}

function altCrop(crop, kind) {
  const { sx, sy, sw, sh, ow, oh } = crop;
  if (kind === 'left') return { sx: 0, sy, sw: ow / 3, sh: oh, ow, oh };
  if (kind === 'right') return { sx: (ow * 2) / 3, sy, sw: ow / 3, sh: oh, ow, oh };
  if (kind === 'top') return { sx, sy: 0, sw: ow, sh: oh / 2, ow, oh };
  if (kind === 'bottom') return { sx, sy: oh / 2, sw: ow, sh: oh / 2, ow, oh };
  return crop;
}

// ---------- the render ----------

const charCache = new Map();
function charImage(def) {
  if (!charCache.has(def.id)) charCache.set(def.id, characterCanvas(def));
  return charCache.get(def.id);
}

export function renderCover(ctx, W, H, S) {
  const L = layoutSpec(S.layout, W, H);
  const u = W / 1920; // scale unit

  // 1. comic field: yellow base, halftone dots, speed lines, sun glow
  ctx.fillStyle = '#ffd21f';
  ctx.fillRect(0, 0, W, H);
  const dotStep = 34 * u + 14;
  for (let y = dotStep / 2; y < H; y += dotStep) {
    for (let x = dotStep / 2; x < W; x += dotStep) {
      const r = Math.max(1.2, (1 - y / H) * 5 * u + 1.5);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,140,0,0.35)'; ctx.fill();
    }
  }
  // speed lines from the top-right corner
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const x0 = W - i * 52 * u;
    ctx.lineWidth = (7 - i * 0.4) * u + 2;
    ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 - 260 * u, 330 * u); ctx.stroke();
  }
  ctx.restore();
  // sun glow behind the title
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.12, 10, W * 0.5, H * 0.12, W * 0.42);
  glow.addColorStop(0, 'rgba(255,240,150,0.9)');
  glow.addColorStop(1, 'rgba(255,240,150,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H * 0.4);

  // 2. photo panels
  const graded = S.graded;
  if (graded) {
    for (const p of L.panels) {
      const px = p.x * W, py = p.y * H, pw = p.w * W, ph = p.h * H;
      const src = coverWindow(graded.width, graded.height, altCrop(S.crop, p.photo), S.pan, S.zoom, pw / ph);
      ctx.save();
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.clip();
      ctx.drawImage(graded, src.sx, src.sy, src.sw, src.sh, -pw / 2, -ph / 2, pw, ph);
      // panel shading: slight top light
      const sh = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
      sh.addColorStop(0, 'rgba(255,255,255,0.10)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0)');
      sh.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = sh; ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
      ctx.restore();
      if (!p.bleed) {
        ctx.save();
        ctx.translate(px + pw / 2, py + ph / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.lineWidth = 10 * u + 3; ctx.strokeStyle = '#14101e';
        ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
        ctx.lineWidth = 3 * u + 1; ctx.strokeStyle = '#fff';
        ctx.strokeRect(-pw / 2 + 8 * u + 3, -ph / 2 + 8 * u + 3, pw - (16 * u + 6), ph - (16 * u + 6));
        ctx.restore();
      }
    }
  }

  // 3. title — big slanted comic lettering with red offset + black outline
  drawTitle(ctx, S.title || 'COMIC VICE', L.title.x * W, L.title.y * H, L.title.size * W, L.title.rot, L.title.align);

  // tagline pill directly under the title — only when it would not collide
  // with the speech bubble (both are drawn near the title in some layouts)
  if (S.tagline) {
    const tSize = L.title.size * W;
    const tagY = L.title.y * H + tSize * 1.06;
    if (Math.abs(tagY - L.bubble.y * H) > 0.10 * H) {
      ctx.save();
      const fs = Math.round(30 * u + 12);
      ctx.font = `900 ${fs}px "Arial Black", Impact, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(S.tagline).width + 44 * u;
      const tx = W / 2;
      ctx.fillStyle = '#14101e';
      ctx.beginPath(); ctx.roundRect(tx - tw / 2, tagY - 20 * u, tw, 40 * u, 20 * u); ctx.fill();
      ctx.fillStyle = '#ffd21f';
      ctx.fillText(S.tagline, tx, tagY + 2);
      ctx.restore();
    }
  }

  // 4. characters with role chips
  for (let i = 0; i < S.chars.length; i++) {
    const c = S.chars[i];
    if (!c.on) continue;
    const def = CHARACTERS.find((d) => d.id === c.id);
    const slot = L.slots[i] || { x: 0.5, y: 0.8, s: 0.3 };
    const cx = (c.x ?? slot.x) * W, feetY = (c.y ?? slot.y) * H;
    const hgt = (c.s ?? slot.s) * H, wid = hgt * 0.75;
    const img = charImage(def);
    ctx.save();
    ctx.translate(cx, feetY);
    // ground shadow
    ctx.fillStyle = 'rgba(20,16,30,0.25)';
    ctx.beginPath(); ctx.ellipse(0, -4, wid * 0.42, 10 * u + 3, 0, 0, Math.PI * 2); ctx.fill();
    if (c.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -wid / 2, -hgt, wid, hgt);
    ctx.restore();
    // role chip above the head: name on top, role under it, sized to fit
    const nameFs = Math.round(20 * u + 9);
    const roleFs = Math.round(12 * u + 6);
    ctx.save();
    ctx.font = `900 ${nameFs}px "Arial Black", Impact, sans-serif`;
    const nw = ctx.measureText(def.name).width;
    ctx.font = `700 ${roleFs}px Arial, sans-serif`;
    const rw = ctx.measureText(def.role).width;
    const lw = Math.max(nw, rw) + 26 * u;
    const chH = nameFs + roleFs + 18 * u;
    const chx = cx - lw / 2, chy = feetY - hgt - chH - 10 * u;
    ctx.fillStyle = '#14101e';
    ctx.beginPath(); ctx.roundRect(chx, chy, lw, chH, 12 * u); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd21f';
    ctx.font = `900 ${nameFs}px "Arial Black", Impact, sans-serif`;
    ctx.fillText(def.name, cx, chy + nameFs / 2 + 6 * u);
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${roleFs}px Arial, sans-serif`;
    ctx.fillText(def.role, cx, chy + nameFs + roleFs / 2 + 10 * u);
    ctx.restore();
  }

  // 5. speech bubble
  if (S.bubble) drawBubble(ctx, S.bubble, L.bubble.x * W, L.bubble.y * H, L.bubble.w * W, L.bubble.tail, u);

  // 6. billing strip
  if (L.billing) {
    const bh = Math.max(46, H * 0.052);
    ctx.fillStyle = '#14101e';
    ctx.fillRect(0, H - bh, W, bh);
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(15 * u + 7)}px Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const names = CHARACTERS.map((c) => c.name).join('   ');
    ctx.fillText(`COMIC VICE      STARRING  ${names}`, W / 2, H - bh * 0.62);
    ctx.fillStyle = '#ffd21f';
    ctx.font = `${Math.round(12 * u + 6)}px Arial, sans-serif`;
    ctx.fillText('A NEON BAY PICTURE   •   AN ORIGINAL COMIC POSTER   •   MADE WITH COMIC VICE COVER STUDIO', W / 2, H - bh * 0.24);
  }

  // 7. outer frame
  if (L.frame) {
    ctx.lineWidth = 14 * u + 4; ctx.strokeStyle = '#14101e';
    ctx.strokeRect(0, 0, W, H);
  }
}

function drawTitle(ctx, text, x, y, size, rot, align) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.font = `900 ${Math.round(size)}px "Arial Black", "Archivo Black", Impact, sans-serif`;
  try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch { /* older canvas */ }
  ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  // red offset shadow
  ctx.fillStyle = '#e8253c';
  ctx.fillText(text, size * 0.045, size * 0.05);
  // black outline
  ctx.lineWidth = size * 0.10;
  ctx.strokeStyle = '#14101e';
  ctx.strokeText(text, 0, 0);
  // yellow-orange gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, size * 1.05);
  grad.addColorStop(0, '#ffe14d');
  grad.addColorStop(0.55, '#ffb52e');
  grad.addColorStop(1, '#ff7e2e');
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawBubble(ctx, text, x, y, w, tail, u) {
  // Size the bubble to the text, then clamp it fully on-canvas.
  let fs = Math.max(15, w * 0.085);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-2 * Math.PI / 180);
  ctx.font = `900 ${Math.round(fs)}px "Arial Black", Impact, sans-serif`;
  let tw = ctx.measureText(text).width;
  if (tw > w - 56 * u) {
    fs *= (w - 56 * u) / tw;
    ctx.font = `900 ${Math.round(fs)}px "Arial Black", Impact, sans-serif`;
    tw = ctx.measureText(text).width;
  }
  const bw = tw + 56 * u;
  const bh = fs * 2.1;
  // clamp: keep the rotated bubble inside the cover
  const cx = Math.max(bw / 2 + 24, Math.min(ctx.canvas.width - bw / 2 - 24, x));
  ctx.translate(cx - x, 0);
  // tail
  ctx.beginPath();
  ctx.moveTo(-bw * 0.28, bh / 2 - 4);
  ctx.lineTo(-bw * 0.42, bh / 2 + 34 * u);
  ctx.lineTo(-bw * 0.12, bh / 2 - 2);
  ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.lineWidth = 5 * u + 2; ctx.strokeStyle = '#14101e'; ctx.lineJoin = 'round'; ctx.stroke();
  // body
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.lineWidth = 5 * u + 2; ctx.stroke();
  // text
  ctx.fillStyle = '#14101e';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}
