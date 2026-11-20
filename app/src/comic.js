// Comic Vice — comic-book cover maker engine and editor.
// Everything here is written fresh for this entry: the layout engine, the
// comic grades, the photo treatments, the smart crop and the editor. The
// characters themselves live in characters.js and are drawn in code.

import { CHARACTERS, drawCharacter } from './characters.js';

const INK = '#141414';

// ---------------------------------------------------------------- layouts
// Every layout is a function of the cover size that returns the panels
// (fractions of width/height, with a small rotation in degrees) and the
// title zone. The title always sits in a band at the bottom, except Solo,
// where it overlaps the single full-bleed panel.
export const LAYOUTS = {
  splash: {
    name: 'Splash',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.94, h: 0.62, rot: -1 },
    ],
  },
  grid: {
    name: 'Grid 2×2',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.455, h: 0.30, rot: -1 },
      { x: 0.515, y: 0.03, w: 0.455, h: 0.30, rot: 1 },
      { x: 0.03, y: 0.35, w: 0.455, h: 0.30, rot: 1 },
      { x: 0.515, y: 0.35, w: 0.455, h: 0.30, rot: -1 },
    ],
  },
  diagonal: {
    name: 'Diagonal',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.30, h: 0.62, rot: -3 },
      { x: 0.35, y: 0.03, w: 0.30, h: 0.62, rot: 2 },
      { x: 0.67, y: 0.03, w: 0.30, h: 0.62, rot: -2 },
    ],
  },
  slash: {
    name: 'Slash',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.56, h: 0.62, rot: -2 },
      { x: 0.47, y: 0.03, w: 0.50, h: 0.62, rot: 2 },
    ],
  },
  trio: {
    name: 'Trio',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.30, h: 0.62, rot: -1 },
      { x: 0.35, y: 0.03, w: 0.30, h: 0.62, rot: 1 },
      { x: 0.67, y: 0.03, w: 0.30, h: 0.62, rot: -1 },
    ],
  },
  duo: {
    name: 'Duo Hero',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.60, h: 0.62, rot: -1 },
      { x: 0.65, y: 0.03, w: 0.32, h: 0.30, rot: 1 },
      { x: 0.65, y: 0.35, w: 0.32, h: 0.30, rot: -1 },
    ],
  },
  strip: {
    name: 'Strip',
    panels: (W, H) => [
      { x: 0.03, y: 0.03, w: 0.94, h: 0.19, rot: -0.5 },
      { x: 0.03, y: 0.24, w: 0.94, h: 0.19, rot: 0.5 },
      { x: 0.03, y: 0.45, w: 0.94, h: 0.20, rot: -0.5 },
    ],
  },
  solo: {
    name: 'Solo',
    panels: (W, H) => [
      { x: 0.0, y: 0.0, w: 1.0, h: 1.0, rot: 0 },
    ],
  },
};

// ------------------------------------------------------------------ grades
// A grade sets the paper colour, the photo treatment, the halftone dots and
// the title gradient. The photo treatments run on pixels (posterize /
// saturate / grey) so every grade is a real effect, not a CSS filter.
export const GRADES = {
  halftone: { name: 'Halftone', bg: '#fff3d6', treatment: 'halftone', dots: 0.16, title: ['#ffcf3d', '#ff7a1a'] },
  pop: { name: 'Pop-Art', bg: '#ffe14d', treatment: 'pop', dots: 0.12, title: ['#ff5d73', '#7b2ff7'] },
  ink: { name: 'Ink', bg: '#f2efe6', treatment: 'ink', dots: 0.1, title: ['#ffffff', '#c9c9c9'] },
  neon: { name: 'Neon', bg: '#12082e', treatment: 'neon', dots: 0.14, title: ['#39ffdc', '#ff2fb3'] },
  sunset: { name: 'Sunset', bg: '#2b0a3d', treatment: 'sunset', dots: 0.1, title: ['#ffd23d', '#ff5e3a'] },
  noir: { name: 'Noir', bg: '#e8e4da', treatment: 'noir', dots: 0.08, title: ['#ffffff', '#8a8a8a'] },
  candy: { name: 'Candy', bg: '#ff9ecf', treatment: 'candy', dots: 0.12, title: ['#ffffff', '#ffcf3d'] },
  miami: { name: 'Miami', bg: '#0d3b4d', treatment: 'miami', dots: 0.12, title: ['#5ef2e0', '#ff7ad9'] },
};

export const EXPORT_SIZES = {
  wide: { name: '1920 × 1080', w: 1920, h: 1080 },
  square: { name: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { name: '1080 × 1350', w: 1080, h: 1350 },
};

// ------------------------------------------------------------------- state
export const state = {
  layout: 'splash',
  grade: 'pop',
  size: 'wide',
  title: 'COMIC VICE',
  sub: 'TWO OUTLAWS. ONE CITY.',
  bubble: true,
  titleColor: 0,
  photos: [], // {id, name, img, focus:{fx,fy}}
  panels: [], // {photoId, crop:{cx,cy,zoom}}
  chars: [], // {uid, id, x, y, size, flip}  x,y in 0..1 of the cover
  selectedPanel: 0,
  selectedChar: null,
};

let uidCounter = 1;
const treatedCache = new Map();

function layoutPanels(W, H) {
  return LAYOUTS[state.layout].panels(W, H);
}

function ensurePanels() {
  const n = layoutPanels(100, 100).length;
  while (state.panels.length < n) {
    const photo = state.photos[state.panels.length % Math.max(1, state.photos.length)];
    state.panels.push({
      photoId: photo ? photo.id : null,
      crop: { cx: 0.5, cy: 0.42, zoom: 1 },
    });
  }
  state.panels.length = n;
  if (state.selectedPanel >= n) state.selectedPanel = 0;
}

// -------------------------------------------------------------- smart crop
// Edge-energy focus: downsample the photo to 48x48, measure gradient
// strength per cell, weight the upper half (faces first), take the weighted
// centroid of the strongest cells. The crop then centres on that point.
export function detectFocus(img) {
  const s = 48;
  const cv = document.createElement('canvas');
  cv.width = s;
  cv.height = s;
  const c = cv.getContext('2d');
  c.drawImage(img, 0, 0, s, s);
  const d = c.getImageData(0, 0, s, s).data;
  const lum = (x, y) => {
    const i = (y * s + x) * 4;
    return 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
  };
  let sx = 0, sy = 0, sw = 0;
  const cells = [];
  for (let y = 1; y < s - 1; y++) {
    for (let x = 1; x < s - 1; x++) {
      const e = Math.abs(lum(x + 1, y) - lum(x - 1, y)) + Math.abs(lum(x, y + 1) - lum(x, y - 1));
      const w = e * (y < s / 2 ? 1.7 : 1);
      cells.push({ x, y, w });
    }
  }
  cells.sort((a, b) => b.w - a.w);
  const top = cells.slice(0, Math.floor(cells.length * 0.15));
  for (const cell of top) {
    sx += cell.x * cell.w;
    sy += cell.y * cell.w;
    sw += cell.w;
  }
  if (!sw) return { fx: 0.5, fy: 0.42 };
  return { fx: Math.min(0.85, Math.max(0.15, sx / sw / s)), fy: Math.min(0.85, Math.max(0.15, sy / sw / s)) };
}

// ---------------------------------------------------------- photo treatment
function treatPhoto(photo, gradeId, w, h) {
  const key = `${photo.id}|${gradeId}|${w}x${h}`;
  const hit = treatedCache.get(key);
  if (hit) return hit;
  const grade = GRADES[gradeId];
  const cv = document.createElement('canvas');
  cv.width = Math.max(2, Math.round(w));
  cv.height = Math.max(2, Math.round(h));
  const c = cv.getContext('2d');
  const img = photo.img;
  const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const ox = (cv.width - dw) / 2 - (photo.focus.fx - 0.5) * (dw - cv.width);
  const oy = (cv.height - dh) / 2 - (photo.focus.fy - 0.5) * (dh - cv.height);
  c.drawImage(img, ox, oy, dw, dh);
  const t = grade.treatment;
  if (t !== 'halftone') {
    const imgData = c.getImageData(0, 0, cv.width, cv.height);
    const px = imgData.data;
    const sat = { ink: 0, pop: 1.7, neon: 1.5, sunset: 1.25, noir: 0, candy: 1.9, miami: 1.35 }[t] ?? 1;
    const levels = { ink: 4, pop: 6 }[t] ?? 0;
    const contrast = { ink: 1.25, noir: 1.3, candy: 1.1 }[t] ?? 1;
    for (let i = 0; i < px.length; i += 4) {
      let r = px[i], g = px[i + 1], b = px[i + 2];
      const l = 0.3 * r + 0.59 * g + 0.11 * b;
      r = l + (r - l) * sat;
      g = l + (g - l) * sat;
      b = l + (b - l) * sat;
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;
      if (levels) {
        const step = 255 / (levels - 1);
        r = Math.round(r / step) * step;
        g = Math.round(g / step) * step;
        b = Math.round(b / step) * step;
      }
      px[i] = Math.max(0, Math.min(255, r));
      px[i + 1] = Math.max(0, Math.min(255, g));
      px[i + 2] = Math.max(0, Math.min(255, b));
    }
    c.putImageData(imgData, 0, 0);
  }
  if (t === 'sunset') {
    c.globalCompositeOperation = 'overlay';
    c.fillStyle = 'rgba(255,110,30,0.35)';
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'source-over';
  }
  if (t === 'miami') {
    c.globalCompositeOperation = 'soft-light';
    c.fillStyle = 'rgba(20,180,190,0.5)';
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = 'rgba(255,90,180,0.35)';
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'source-over';
  }
  if (t === 'neon') {
    c.globalCompositeOperation = 'screen';
    c.fillStyle = 'rgba(60,20,120,0.25)';
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'source-over';
  }
  treatedCache.set(key, cv);
  return cv;
}

// ------------------------------------------------------------------ drawing
function halftoneDots(ctx, W, H, alpha, spacing, dark) {
  const step = Math.max(9, Math.round(spacing));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = dark ? INK : '#ffffff';
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2 + ((Math.round(y / step) % 2) * step) / 2; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.2, step * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function speedLines(ctx, W, H, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(3, W / 480);
  const cx = W * 0.5;
  const cy = H * 0.28;
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + 0.12;
    const r0 = Math.max(W, H) * 0.42;
    const r1 = r0 + Math.max(W, H) * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPanelPhoto(ctx, panel, W, H) {
  const px = panel.x * W;
  const py = panel.y * H;
  const pw = panel.w * W;
  const ph = panel.h * H;
  const def = state.panels[panel.index];
  const photo = state.photos.find((p) => p.id === (def && def.photoId));
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  ctx.rotate((panel.rot * Math.PI) / 180);
  ctx.beginPath();
  ctx.rect(-pw / 2, -ph / 2, pw, ph);
  ctx.clip();
  if (photo) {
    const treated = treatPhoto(photo, state.grade, pw, ph);
    const crop = def.crop;
    const s = Math.max(pw / treated.width, ph / treated.height) * crop.zoom;
    const dw = treated.width * s;
    const dh = treated.height * s;
    const ox = (pw - dw) / 2 - (crop.cx - 0.5) * (dw - pw);
    const oy = (ph - dh) / 2 - (crop.cy - 0.5) * (dh - ph);
    ctx.drawImage(treated, ox - pw / 2, oy - ph / 2, dw, dh);
  } else {
    ctx.fillStyle = '#ffd9d9';
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.fillStyle = INK;
    ctx.font = `900 ${Math.round(ph * 0.16)}px "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD PHOTO', 0, 0);
  }
  if (GRADES[state.grade].treatment === 'halftone') {
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = INK;
    const step = Math.max(8, pw / 90);
    for (let y = step / 2; y < ph; y += step) {
      for (let x = step / 2; x < pw; x += step) {
        ctx.beginPath();
        ctx.arc(x - pw / 2, y - ph / 2, Math.max(1, step * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.restore();
  // Thick comic frame, drawn after the clip so it stays crisp.
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  ctx.rotate((panel.rot * Math.PI) / 180);
  ctx.lineWidth = Math.max(5, W / 220);
  ctx.strokeStyle = state.selectedPanel === panel.index ? '#ff2fb3' : INK;
  ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
  // White inner keyline, the classic comic panel edge.
  ctx.lineWidth = Math.max(2, W / 640);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(-pw / 2 + W / 160, -ph / 2 + W / 160, pw - W / 80, ph - W / 80);
  ctx.restore();
}

function drawComicTitle(ctx, W, H) {
  const grade = GRADES[state.grade];
  const solo = state.layout === 'solo';
  const size = Math.round(W * (solo ? 0.115 : 0.095));
  const x = W / 2;
  const y = solo ? H * 0.88 : H * 0.74;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.028);
  ctx.font = `italic 900 ${size}px "Arial Black", "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = state.title.toUpperCase();
  const colors = grade.title;
  // Hard offset shadow for the 3D pop.
  ctx.fillStyle = 'rgba(20,20,20,0.9)';
  ctx.fillText(text, size * 0.05, size * 0.09);
  // Gradient fill.
  const grad = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.lineWidth = Math.max(8, size * 0.16);
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);
  // White diagonal highlight stripe clipped to the letters.
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ffffff';
  const tw = ctx.measureText(text).width;
  ctx.translate(-tw / 2, 0);
  for (let i = -1; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo((i * tw) / 4, -size);
    ctx.lineTo((i * tw) / 4 + size * 0.28, -size);
    ctx.lineTo((i * tw) / 4 - size * 0.1, size);
    ctx.lineTo((i * tw) / 4 - size * 0.38, size);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
  // "EST." tag under the title was removed: the billing strip already
  // carries EST. 2026, and the tag collided with the speech bubble.
  ctx.restore();
}

function drawBubble(ctx, W, H) {
  if (!state.bubble || !state.sub.trim()) return;
  const solo = state.layout === 'solo';
  const bw = W * 0.42;
  const bh = H * 0.075;
  const bx = W * 0.5 - bw / 2;
  const by = solo ? H * 0.70 : H * 0.85;
  ctx.save();
  ctx.beginPath();
  const r = bh * 0.45;
  ctx.roundRect(bx, by, bw, bh, r);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = Math.max(4, W / 320);
  ctx.strokeStyle = INK;
  ctx.stroke();
  // Tail.
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.30, by + bh - 2);
  ctx.lineTo(bx + bw * 0.22, by + bh + H * 0.02);
  ctx.lineTo(bx + bw * 0.42, by + bh - 2);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();
  // Shrink the bubble text until it fits the bubble width (portrait covers
  // are narrow, so a height-based size alone would overflow).
  const bubbleText = state.sub.toUpperCase().slice(0, 42);
  let bubbleFs = Math.round(bh * 0.42);
  ctx.font = `900 ${bubbleFs}px "Arial Black", sans-serif`;
  const textW = ctx.measureText(bubbleText).width;
  if (textW > bw * 0.86) {
    bubbleFs = Math.floor(bubbleFs * (bw * 0.86) / textW);
    ctx.font = `900 ${bubbleFs}px "Arial Black", sans-serif`;
  }
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bubbleText, bx + bw / 2, by + bh / 2 + 1);
  ctx.restore();
}

function drawRoleTags(ctx, W, H, panels) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const fs = Math.round(W * 0.016);
  ctx.font = `900 ${fs}px "Arial Black", sans-serif`;
  // One chip per placed character, floating near its panel.
  state.chars.forEach((ch, i) => {
    const def = CHARACTERS.find((c) => c.id === ch.id);
    if (!def) return;
    const label = `★ ${def.tag} — ${def.name}`;
    const tw = ctx.measureText(label).width + fs * 1.6;
    const cx = Math.min(W - tw - 12, Math.max(12, ch.x * W - tw / 2));
    // Stagger neighbouring chips so two close characters never overlap.
    const cy = Math.min(H * 0.66, Math.max(H * 0.08, ch.y * H - H * 0.21 * ch.size)) - (i % 2) * H * 0.04;
    ctx.beginPath();
    ctx.roundRect(cx, cy, tw, fs * 1.9, fs * 0.95);
    ctx.fillStyle = i % 2 ? '#ff2fb3' : '#0f8a8a';
    ctx.fill();
    ctx.lineWidth = Math.max(3, W / 480);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, cx + fs * 0.8, cy + fs * 0.98);
  });
  ctx.restore();
}

function drawBillingStrip(ctx, W, H) {
  const stripH = Math.round(H * 0.032);
  ctx.save();
  ctx.fillStyle = INK;
  ctx.fillRect(0, H - stripH, W, stripH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(stripH * 0.52)}px "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STARRING THE CITY   ·   A COMIC VICE PRODUCTION   ·   EST. 2026', W / 2, H - stripH / 2);
  ctx.restore();
}

// The full cover. Draws the same picture at any size, so the preview, the
// exports and the screenshots all come from one function.
export function renderCover(canvas, W, H) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade];
  const solo = state.layout === 'solo';
  ensurePanels();
  ctx.fillStyle = grade.bg;
  ctx.fillRect(0, 0, W, H);
  halftoneDots(ctx, W, H, grade.dots, W / 64, grade.bg === '#12082e' || grade.bg === '#2b0a3d' || grade.bg === '#0d3b4d' ? false : true);
  speedLines(ctx, W, H, grade.bg === '#12082e' || grade.bg === '#2b0a3d' || grade.bg === '#0d3b4d' ? '#ffffff' : INK);
  const panels = layoutPanels(W, H);
  panels.forEach((p, i) => drawPanelPhoto(ctx, { ...p, index: i }, W, H));
  // Characters pop out above the panels.
  for (const ch of state.chars) {
    const scale = (W * 0.24 * ch.size) / 400;
    drawCharacter(ctx, ch.id, ch.x * W, ch.y * H, scale, ch.flip);
  }
  if (!solo) drawComicTitle(ctx, W, H);
  else drawComicTitle(ctx, W, H);
  drawBubble(ctx, W, H);
  drawRoleTags(ctx, W, H, panels);
  drawBillingStrip(ctx, W, H);
  return ctx;
}

// ------------------------------------------------------------------- editor
const $ = (id) => document.getElementById(id);
const preview = $('preview');
let drag = null; // {kind:'char'|'photo', uid|panel, lastX, lastY}

function previewSize() {
  const size = EXPORT_SIZES[state.size];
  const maxW = 980;
  const scale = Math.min(1, maxW / size.w);
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

export function renderPreview() {
  const { w, h } = previewSize();
  renderCover(preview, w, h);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addPhotoFrom(img, name) {
  const photo = {
    id: `p${uidCounter++}`,
    name,
    img,
    focus: detectFocus(img),
  };
  state.photos.push(photo);
  ensurePanels();
  for (const p of state.panels) {
    if (!p.photoId) p.photoId = photo.id;
  }
  renderPreview();
  refreshPanelControls();
  return photo;
}

async function loadSamples() {
  if (state.photos.length) return;
  const b = await loadImage('samples/boulevard.jpg');
  await addPhotoFrom(b, 'Boulevard');
  const p = await loadImage('samples/pier.jpg');
  await addPhotoFrom(p, 'Pier');
  // Second photo goes to panel 1 when the layout has one.
  if (state.panels[1]) state.panels[1].photoId = p.id;
  renderPreview();
  refreshPanelControls();
}

function addCharacter(id, x, y, size) {
  const ch = {
    uid: uidCounter++,
    id,
    x: x ?? 0.5 + (Math.random() - 0.5) * 0.2,
    y: y ?? 0.45,
    size: size ?? 1,
    flip: false,
  };
  state.chars.push(ch);
  state.selectedChar = ch.uid;
  renderPreview();
  refreshCharList();
  return ch;
}

function removeCharacter(uid) {
  state.chars = state.chars.filter((c) => c.uid !== uid);
  if (state.selectedChar === uid) state.selectedChar = null;
  renderPreview();
  refreshCharList();
}

function buildButtons() {
  const layoutBox = $('layoutBox');
  for (const [id, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.className = 'pick';
    b.textContent = def.name;
    b.dataset.id = id;
    b.onclick = () => {
      state.layout = id;
      ensurePanels();
      renderPreview();
      markActive(layoutBox, id);
      refreshPanelControls();
    };
    layoutBox.appendChild(b);
  }
  const gradeBox = $('gradeBox');
  for (const [id, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.className = 'pick';
    b.textContent = def.name;
    b.dataset.id = id;
    b.onclick = () => {
      state.grade = id;
      renderPreview();
      markActive(gradeBox, id);
    };
    gradeBox.appendChild(b);
  }
  const charBox = $('charBox');
  for (const def of CHARACTERS) {
    const b = document.createElement('button');
    b.className = 'pick char-pick';
    b.innerHTML = `<b>${def.name}</b><span>${def.role}</span>`;
    b.onclick = () => addCharacter(def.id);
    charBox.appendChild(b);
  }
  const sizeBox = $('sizeBox');
  for (const [id, def] of Object.entries(EXPORT_SIZES)) {
    const b = document.createElement('button');
    b.className = 'pick';
    b.textContent = def.name;
    b.dataset.id = id;
    b.onclick = () => {
      state.size = id;
      renderPreview();
      markActive(sizeBox, id);
    };
    sizeBox.appendChild(b);
  }
  markActive(layoutBox, state.layout);
  markActive(gradeBox, state.grade);
  markActive(sizeBox, state.size);
}

function markActive(box, id) {
  for (const b of box.querySelectorAll('button')) {
    b.classList.toggle('active', b.dataset.id === id);
  }
}

function refreshPanelControls() {
  const sel = $('panelPhoto');
  sel.innerHTML = '';
  for (const photo of state.photos) {
    const o = document.createElement('option');
    o.value = photo.id;
    o.textContent = photo.name;
    sel.appendChild(o);
  }
  const def = state.panels[state.selectedPanel];
  if (def) {
    sel.value = def.photoId || '';
    $('panelZoom').value = def.crop.zoom;
  }
  $('panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${state.panels.length}`;
}

function refreshCharList() {
  const list = $('charList');
  list.innerHTML = '';
  if (!state.chars.length) {
    list.innerHTML = '<p class="muted">No characters yet — tap one above to stick it on the cover.</p>';
    return;
  }
  for (const ch of state.chars) {
    const def = CHARACTERS.find((c) => c.id === ch.id);
    const row = document.createElement('div');
    row.className = 'char-row' + (state.selectedChar === ch.uid ? ' sel' : '');
    row.innerHTML = `
      <b>${def.name}</b><span class="muted">${def.role}</span>
      <label>Size <input type="range" min="0.5" max="1.8" step="0.05" value="${ch.size}"></label>
      <button class="mini">Flip</button>
      <button class="mini danger">✕</button>`;
    row.onclick = () => {
      state.selectedChar = ch.uid;
      renderPreview();
      refreshCharList();
    };
    const [sizeInput, flipBtn, delBtn] = [
      row.querySelector('input'),
      ...row.querySelectorAll('button'),
    ];
    sizeInput.onclick = (e) => e.stopPropagation();
    sizeInput.oninput = () => {
      ch.size = parseFloat(sizeInput.value);
      renderPreview();
    };
    flipBtn.onclick = (e) => {
      e.stopPropagation();
      ch.flip = !ch.flip;
      renderPreview();
    };
    delBtn.onclick = (e) => {
      e.stopPropagation();
      removeCharacter(ch.uid);
    };
    list.appendChild(row);
  }
}

// ------------------------------------------------------------ pointer input
function pointerPos(e) {
  const r = preview.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * preview.width,
    y: ((e.clientY - r.top) / r.height) * preview.height,
  };
}

function hitChar(x, y) {
  for (let i = state.chars.length - 1; i >= 0; i--) {
    const ch = state.chars[i];
    const hw = 0.12 * ch.size * preview.width;
    const hh = 0.16 * ch.size * preview.width;
    if (Math.abs(x - ch.x * preview.width) < hw && Math.abs(y - ch.y * preview.height) < hh) {
      return ch;
    }
  }
  return null;
}

function hitPanel(x, y) {
  const panels = layoutPanels(preview.width, preview.height);
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (x >= p.x * preview.width && x <= (p.x + p.w) * preview.width
      && y >= p.y * preview.height && y <= (p.y + p.h) * preview.height) {
      return i;
    }
  }
  return null;
}

preview.addEventListener('pointerdown', (e) => {
  preview.setPointerCapture(e.pointerId);
  const { x, y } = pointerPos(e);
  const ch = hitChar(x, y);
  if (ch) {
    state.selectedChar = ch.uid;
    drag = { kind: 'char', uid: ch.uid, lastX: x, lastY: y };
    refreshCharList();
    return;
  }
  const pi = hitPanel(x, y);
  if (pi !== null) {
    state.selectedPanel = pi;
    state.selectedChar = null;
    drag = { kind: 'photo', panel: pi, lastX: x, lastY: y };
    refreshPanelControls();
    refreshCharList();
    renderPreview();
  }
});

preview.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { x, y } = pointerPos(e);
  if (drag.kind === 'char') {
    const ch = state.chars.find((c) => c.uid === drag.uid);
    if (ch) {
      ch.x += (x - drag.lastX) / preview.width;
      ch.y += (y - drag.lastY) / preview.height;
      ch.x = Math.max(0.05, Math.min(0.95, ch.x));
      ch.y = Math.max(0.1, Math.min(0.9, ch.y));
    }
  } else {
    const def = state.panels[drag.panel];
    const panels = layoutPanels(preview.width, preview.height);
    const p = panels[drag.panel];
    if (def && p) {
      def.crop.cx -= ((x - drag.lastX) / (p.w * preview.width)) / def.crop.zoom;
      def.crop.cy -= ((y - drag.lastY) / (p.h * preview.height)) / def.crop.zoom;
      def.crop.cx = Math.max(0.05, Math.min(0.95, def.crop.cx));
      def.crop.cy = Math.max(0.05, Math.min(0.95, def.crop.cy));
    }
  }
  drag.lastX = x;
  drag.lastY = y;
  renderPreview();
});

preview.addEventListener('pointerup', () => {
  drag = null;
});

preview.addEventListener('wheel', (e) => {
  e.preventDefault();
  const { x, y } = pointerPos(e);
  const pi = hitPanel(x, y);
  if (pi === null) return;
  const def = state.panels[pi];
  def.crop.zoom = Math.max(1, Math.min(4, def.crop.zoom * (e.deltaY < 0 ? 1.12 : 0.89)));
  state.selectedPanel = pi;
  refreshPanelControls();
  renderPreview();
}, { passive: false });

// ------------------------------------------------------------------- export
export async function exportPNG(sizeKey) {
  const size = EXPORT_SIZES[sizeKey];
  const cv = document.createElement('canvas');
  renderCover(cv, size.w, size.h);
  return new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function exportAndDownload(sizeKey) {
  const blob = await exportPNG(sizeKey);
  download(blob, `comic-vice-${sizeKey}.png`);
}

// --------------------------------------------------------------------- boot
function wireStaticControls() {
  $('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value || 'COMIC VICE';
    renderPreview();
  });
  $('subInput').addEventListener('input', (e) => {
    state.sub = e.target.value;
    renderPreview();
  });
  $('bubbleToggle').addEventListener('change', (e) => {
    state.bubble = e.target.checked;
    renderPreview();
  });
  $('panelPhoto').addEventListener('change', (e) => {
    const def = state.panels[state.selectedPanel];
    if (def) {
      def.photoId = e.target.value;
      renderPreview();
    }
  });
  $('panelZoom').addEventListener('input', (e) => {
    const def = state.panels[state.selectedPanel];
    if (def) {
      def.crop.zoom = parseFloat(e.target.value);
      renderPreview();
    }
  });
  $('smartCrop').addEventListener('click', () => {
    const def = state.panels[state.selectedPanel];
    const photo = state.photos.find((p) => p.id === (def && def.photoId));
    if (def && photo) {
      const f = detectFocus(photo.img);
      def.crop.cx = f.fx;
      def.crop.cy = f.fy;
      renderPreview();
    }
  });
  $('fileInput').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      const img = await loadImage(URL.createObjectURL(file));
      await addPhotoFrom(img, file.name.replace(/\.[^.]+$/, '').slice(0, 18));
    }
  });
  $('exportWide').addEventListener('click', () => exportAndDownload('wide'));
  $('exportSquare').addEventListener('click', () => exportAndDownload('square'));
  $('exportPortrait').addEventListener('click', () => exportAndDownload('portrait'));
  preview.addEventListener('dragover', (e) => e.preventDefault());
  preview.addEventListener('drop', async (e) => {
    e.preventDefault();
    for (const file of e.dataTransfer.files) {
      if (!file.type.startsWith('image/')) continue;
      const img = await loadImage(URL.createObjectURL(file));
      await addPhotoFrom(img, file.name.replace(/\.[^.]+$/, '').slice(0, 18));
    }
  });
}

const ready = (async () => {
  buildButtons();
  wireStaticControls();
  ensurePanels();
  await loadSamples();
  // Default cast on the cover: the two leads pop out over the splash panel.
  addCharacter('jax', 0.80, 0.42, 1.0);
  addCharacter('luna', 0.17, 0.44, 0.9);
  renderPreview();
  refreshPanelControls();
  refreshCharList();
})();

function refreshActiveButtons() {
  markActive($('layoutBox'), state.layout);
  markActive($('gradeBox'), state.grade);
  markActive($('sizeBox'), state.size);
}

// Automation hooks for screenshots and tests: the shots script drives the
// app through these instead of clicking around.
window.__comic = {
  state,
  ready,
  renderPreview,
  exportPNG,
  addCharacter,
  setLayout: (id) => { state.layout = id; ensurePanels(); renderPreview(); refreshActiveButtons(); refreshPanelControls(); },
  setGrade: (id) => { state.grade = id; renderPreview(); refreshActiveButtons(); },
  setTitle: (t) => { state.title = t; renderPreview(); },
  setSub: (t) => { state.sub = t; renderPreview(); },
  setSize: (id) => { state.size = id; renderPreview(); refreshActiveButtons(); },
  clearChars: () => { state.chars = []; renderPreview(); },
};
