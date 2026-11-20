/* VICE NIGHTS — Cover Studio.
 * A poster maker, not a photo collage: every cover is drawn on one canvas as
 * a single scene — a procedural Vice City illustration (sunset sky, slatted
 * synthwave sun, skyline, palms, neon sea) fused with the user's photos in
 * diagonal, overlapping panels and a giant caption ribbon. The same
 * drawCover routine paints the editor preview and the exported PNG, so an
 * export is exactly what the preview shows. All illustration is seeded, so
 * a render is deterministic. No network, no fonts from outside: system
 * fonts only, photos stay on the user's machine.
 */
'use strict';

/* ------------------------------------------------------------- utilities */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function polygonBounds(poly) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const p of poly) {
    if (p[0] < x0) x0 = p[0];
    if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function tracePolygon(ctx, poly, W, H) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0] * W, poly[0][1] * H);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0] * W, poly[i][1] * H);
  ctx.closePath();
}

/* ------------------------------------------------------------- themes */

const THEMES = {
  sunset: {
    skyTop: '#1c0540', skyMid: '#8f1160', skyLow: '#ff7a18',
    sunCore: '#ffe259', sunEdge: '#ff7a18', sunGlow: 'rgba(255,122,24,.55)',
    skyline: '#160327', sea: '#1d0533', seaLine: '#ff2e88',
    bandTop: '#3d0a5e', bandBottom: '#12022b', bandEdge: '#ff2e88',
    text: '#fff7e6', textShadow: '#ff2e88', accent: '#22e6ff',
  },
  neon: {
    skyTop: '#02010f', skyMid: '#2a0a5e', skyLow: '#00c2ff',
    sunCore: '#a5fbff', sunEdge: '#00e5ff', sunGlow: 'rgba(0,229,255,.5)',
    skyline: '#05021a', sea: '#03122b', seaLine: '#00f5d4',
    bandTop: '#0a1030', bandBottom: '#02010f', bandEdge: '#00f5d4',
    text: '#eafffb', textShadow: '#ff2e88', accent: '#ffd319',
  },
  gold: {
    skyTop: '#160a2e', skyMid: '#7a1e3c', skyLow: '#ffb347',
    sunCore: '#fff3a0', sunEdge: '#ff9d00', sunGlow: 'rgba(255,179,71,.55)',
    skyline: '#1a0716', sea: '#241031', seaLine: '#ffd319',
    bandTop: '#3a0f33', bandBottom: '#160a24', bandEdge: '#ffd319',
    text: '#fff8e0', textShadow: '#7a1e3c', accent: '#ff2e88',
  },
  vice: {
    skyTop: '#2a0548', skyMid: '#c2187a', skyLow: '#ff9e00',
    sunCore: '#ffe259', sunEdge: '#ff2e88', sunGlow: 'rgba(255,46,136,.55)',
    skyline: '#1c0330', sea: '#200838', seaLine: '#ff2e88',
    bandTop: '#3d0a5e', bandBottom: '#12022b', bandEdge: '#22e6ff',
    text: '#fff7e6', textShadow: '#ff2e88', accent: '#22e6ff',
  },
  miami: {
    skyTop: '#04122e', skyMid: '#0e5a8a', skyLow: '#ff5e8a',
    sunCore: '#fff3a0', sunEdge: '#ff5e8a', sunGlow: 'rgba(255,94,138,.5)',
    skyline: '#03101f', sea: '#04263b', seaLine: '#22e6ff',
    bandTop: '#0a2a4d', bandBottom: '#020a18', bandEdge: '#22e6ff',
    text: '#f2feff', textShadow: '#ff2e88', accent: '#ffd319',
  },
  dusk: {
    skyTop: '#060a24', skyMid: '#3a2a6e', skyLow: '#ff8c42',
    sunCore: '#ffd319', sunEdge: '#ff6b35', sunGlow: 'rgba(255,140,66,.5)',
    skyline: '#070818', sea: '#0a1030', seaLine: '#ff8c42',
    bandTop: '#1a1440', bandBottom: '#05060f', bandEdge: '#ff8c42',
    text: '#fff3e0', textShadow: '#3a2a6e', accent: '#22e6ff',
  },
  candy: {
    skyTop: '#3d0a4d', skyMid: '#ff2e88', skyLow: '#ffd319',
    sunCore: '#ffffff', sunEdge: '#ffd319', sunGlow: 'rgba(255,211,25,.55)',
    skyline: '#2a0533', sea: '#33103f', seaLine: '#ffd319',
    bandTop: '#4d0a5e', bandBottom: '#1a0530', bandEdge: '#ffd319',
    text: '#ffffff', textShadow: '#ff2e88', accent: '#22e6ff',
  },
  noir: {
    skyTop: '#000000', skyMid: '#2b0a1e', skyLow: '#ff2e2e',
    sunCore: '#ffcccc', sunEdge: '#ff2e2e', sunGlow: 'rgba(255,46,46,.5)',
    skyline: '#000000', sea: '#0d0208', seaLine: '#ff2e2e',
    bandTop: '#1a0510', bandBottom: '#000000', bandEdge: '#ff2e2e',
    text: '#ffffff', textShadow: '#8f0011', accent: '#ffd319',
  },
};

/* ------------------------------------------------------------- layouts
 * Panels are polygons in normalised (0..1) space, so one layout works at
 * every export size. Gaps between panels let the illustration show through.
 * The caption ribbon owns the bottom (or top) of the frame. */

const LAYOUTS = {
  diagonal: {
    captionBand: 'bottom',
    panels: [
      [[0.00, 0.20], [0.58, 0.16], [0.54, 0.60], [0.00, 0.66]],
      [[0.62, 0.20], [1.00, 0.16], [1.00, 0.52], [0.58, 0.56]],
      [[0.58, 0.60], [1.00, 0.56], [1.00, 0.78], [0.62, 0.80]],
    ],
  },
  stack: {
    captionBand: 'bottom',
    panels: [
      [[0.03, 0.05], [0.74, 0.02], [0.70, 0.62], [0.00, 0.68]],
      [[0.32, 0.30], [0.97, 0.26], [0.95, 0.78], [0.30, 0.82]],
    ],
  },
  triptych: {
    captionBand: 'bottom',
    panels: [
      [[0.00, 0.04], [0.35, 0.02], [0.33, 0.78], [0.00, 0.80]],
      [[0.37, 0.10], [0.66, 0.08], [0.64, 0.74], [0.35, 0.76]],
      [[0.68, 0.04], [1.00, 0.02], [1.00, 0.78], [0.66, 0.76]],
    ],
  },
  solo: {
    captionBand: 'bottom',
    panels: [
      [[0.06, 0.04], [0.94, 0.04], [0.90, 0.78], [0.10, 0.78]],
    ],
  },
  popout: {
    captionBand: 'bottom',
    badgeAt: [0.60, 0.15],
    panels: [
      [[0.02, 0.20], [0.60, 0.14], [0.56, 0.62], [0.02, 0.70]],
      [[0.64, 0.20], [1.00, 0.16], [1.00, 0.52], [0.60, 0.56]],
      [[0.58, 0.60], [1.00, 0.56], [1.00, 0.78], [0.62, 0.80]],
    ],
  },
  slash: {
    captionBand: 'bottom',
    panels: [
      [[0.00, 0.16], [0.70, 0.10], [0.52, 0.80], [0.00, 0.82]],
      [[0.74, 0.10], [1.00, 0.08], [1.00, 0.78], [0.56, 0.82]],
    ],
  },
  duotone: {
    captionBand: 'bottom',
    panels: [
      [[0.00, 0.14], [1.00, 0.10], [1.00, 0.46], [0.00, 0.52]],
      [[0.00, 0.56], [1.00, 0.50], [1.00, 0.78], [0.00, 0.80]],
    ],
  },
  arch: {
    captionBand: 'bottom',
    panels: [
      [[0.16, 0.78], [0.16, 0.26], [0.28, 0.12], [0.50, 0.08], [0.72, 0.12], [0.84, 0.26], [0.84, 0.78]],
      [[0.86, 0.16], [1.00, 0.14], [1.00, 0.42], [0.86, 0.44]],
    ],
  },
};

const EXPORT_SIZES = {
  '1920x1080': [1920, 1080],
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
};

/* ------------------------------------------------------------- state */

const state = {
  photos: [],          // {img, name}
  layout: 'popout',
  theme: 'sunset',
  caption: 'VICE NIGHTS',
  subcaption: 'EST. 2026',
  captionSize: 1,
  captionPos: 'bottom',
  exportSize: '1920x1080',
  treatment: 'photo',   // photo | ink | flat | rim
  smartCrop: true,
  starring: 'THE CITY',
  selected: 0,
  armedPhoto: -1,      // thumbnail index waiting for a panel click
  slots: [],           // per panel: {photo, zoom, ox, oy}
};

function defaultSlots(layoutName) {
  const n = LAYOUTS[layoutName].panels.length;
  const slots = [];
  for (let i = 0; i < n; i++) {
    const prev = state.slots[i];
    slots.push(prev ? { photo: prev.photo, zoom: prev.zoom, ox: prev.ox, oy: prev.oy }
                    : { photo: i % 2 === 0 ? 0 : 1, zoom: 1, ox: 0, oy: 0 });
  }
  return slots;
}
state.slots = defaultSlots('popout');

/* ------------------------------------------------------------- illustration */

function drawViceCitySky(ctx, W, H, theme) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.78);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.55, theme.skyMid);
  sky.addColorStop(1, theme.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars, seeded so every render matches.
  const rnd = mulberry32(20261120);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H * 0.28, r = rnd() * 1.6 + 0.4;
    ctx.globalAlpha = 0.25 + rnd() * 0.6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSlattedSun(ctx, W, H, theme) {
  const cx = W * 0.80, cy = H * 0.16, r = H * 0.10;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
  glow.addColorStop(0, theme.sunGlow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);

  const grad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  grad.addColorStop(0, theme.sunCore);
  grad.addColorStop(1, theme.sunEdge);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // Synthwave slats: bars of sky colour cut across the sun's lower half,
  // growing thicker toward the bottom.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  const sky = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(0.55, theme.skyMid);
  sky.addColorStop(1, theme.skyLow);
  ctx.fillStyle = sky;
  let y = cy + r * 0.08, h = r * 0.03, gap = r * 0.10;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, h);
    y += h + gap; h *= 1.55; gap *= 0.92;
  }
  ctx.restore();
}

function drawSkyline(ctx, W, H, theme) {
  const rnd = mulberry32(777);
  const base = H * 0.20;
  ctx.fillStyle = theme.skyline;
  let x = -W * 0.02;
  while (x < W * 1.02) {
    const bw = W * (0.03 + rnd() * 0.05);
    const bh = H * (0.03 + rnd() * 0.09);
    ctx.fillRect(x, base - bh, bw, bh + H * 0.02);
    // Antenna on a few towers.
    if (rnd() > 0.72) ctx.fillRect(x + bw / 2 - 1, base - bh - H * 0.03, 2, H * 0.03);
    x += bw + W * 0.004;
  }
  // Lit windows.
  const wrnd = mulberry32(4242);
  ctx.fillStyle = 'rgba(255,211,25,.9)';
  for (let i = 0; i < 90; i++) {
    const wx = wrnd() * W, wy = base - wrnd() * H * 0.10;
    ctx.fillRect(wx, wy, Math.max(2, W * 0.002), Math.max(2, H * 0.004));
  }
}

function drawPalm(ctx, x, y, s, lean, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(lean);
  ctx.strokeStyle = theme.skyline;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Trunk, curving up.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -52, -6, -104);
  ctx.stroke();
  // Fronds.
  ctx.lineWidth = 5;
  const tips = [[-58, -128], [-34, -146], [-4, -152], [26, -146], [52, -128], [-72, -104], [66, -106]];
  for (const [tx, ty] of tips) {
    ctx.beginPath();
    ctx.moveTo(-6, -104);
    ctx.quadraticCurveTo((tx - 6) / 2, -104 + (ty + 104) * 0.4 - 18, tx, ty);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNeonSea(ctx, W, H, theme) {
  const top = H * 0.70, bottom = H * 0.86;
  ctx.fillStyle = theme.sea;
  ctx.fillRect(0, top, W, bottom - top);
  const rnd = mulberry32(99);
  for (let i = 0; i < 26; i++) {
    const y = top + rnd() * (bottom - top);
    const w = W * (0.04 + rnd() * 0.22);
    const x = rnd() * W;
    ctx.globalAlpha = 0.12 + rnd() * 0.35;
    ctx.fillStyle = i % 3 === 0 ? theme.accent : theme.seaLine;
    ctx.fillRect(x, y, w, 2);
  }
  ctx.globalAlpha = 1;
  // Horizon glow line.
  ctx.fillStyle = theme.bandEdge;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, top - 1, W, 2);
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------- photo treatments
 * Ink and Flat repaint the photo like a poster painting (posterised
 * channels on a cached offscreen canvas); Rim light grades it hot and
 * draws a neon edge on the frame. The cache is keyed by photo +
 * treatment, so dragging stays cheap. */

const treatmentCache = new Map();

function posterizeImageData(data, levels) {
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }
}

function treatedPhoto(photo, treatment) {
  if (!photo) return null;
  if (treatment === 'photo') return { src: photo.img, w: photo.img.naturalWidth, h: photo.img.naturalHeight };
  const key = `${state.photos.indexOf(photo)}|${treatment}`;
  const hit = treatmentCache.get(key);
  if (hit) return hit;
  const iw = photo.img.naturalWidth, ih = photo.img.naturalHeight;
  const scale = Math.min(1, 640 / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * scale));
  const h = Math.max(2, Math.round(ih * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const cx = c.getContext('2d');
  if (treatment === 'ink') cx.filter = 'contrast(1.18) saturate(.8) brightness(.96)';
  else if (treatment === 'flat') cx.filter = 'contrast(1.06) saturate(1.55)';
  else if (treatment === 'rim') cx.filter = 'contrast(1.28) saturate(1.6) brightness(1.06)';
  cx.drawImage(photo.img, 0, 0, w, h);
  cx.filter = 'none';
  if (treatment === 'ink' || treatment === 'flat') {
    const img = cx.getImageData(0, 0, w, h);
    posterizeImageData(img.data, treatment === 'ink' ? 4 : 6);
    cx.putImageData(img, 0, 0);
  }
  const out = { src: c, w, h };
  treatmentCache.set(key, out);
  return out;
}

/* ------------------------------------------------------------- smart crop
 * Detail-aware framing: score a 48x48 downscale by edge energy, biased
 * toward the upper half where faces usually sit, then pan the panel so
 * the busiest window lands in the centre of the frame. */

function analyzePhotoFocus(img) {
  const gw = 48, gh = 48;
  const c = document.createElement('canvas');
  c.width = gw; c.height = gh;
  const cx = c.getContext('2d');
  cx.drawImage(img, 0, 0, gw, gh);
  const d = cx.getImageData(0, 0, gw, gh).data;
  const lum = (x, y) => {
    const i = (y * gw + x) * 4;
    return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  };
  let best = { x: 0.5, y: 0.35, score: -1 };
  const win = 10;
  for (let wy = 0; wy + win <= gh; wy += 4) {
    for (let wx = 0; wx + win <= gw; wx += 4) {
      let e = 0;
      for (let y = wy; y < wy + win; y++) {
        for (let x = wx; x < wx + win; x++) {
          e += Math.abs(lum(Math.min(x + 1, gw - 1), y) - lum(x, y));
          e += Math.abs(lum(x, Math.min(y + 1, gh - 1)) - lum(x, y));
        }
      }
      const cy = (wy + win / 2) / gh;
      e *= 1.35 - cy * 0.7;
      if (e > best.score) best = { x: (wx + win / 2) / gw, y: cy, score: e };
    }
  }
  return { x: best.x, y: best.y };
}

/* The focus point is cached per photo: the pop-out badge uses the same
 * face-first point as smart crop, so the badge shows a face, not a torso. */
const focusCache = new Map();
function photoFocus(photo) {
  const key = state.photos.indexOf(photo);
  if (!focusCache.has(key)) focusCache.set(key, analyzePhotoFocus(photo.img));
  return focusCache.get(key);
}

function smartCropSlot(slotIndex, W, H) {
  const slot = state.slots[slotIndex];
  if (!slot) return;
  const photo = state.photos[slot.photo];
  if (!photo || !photo.img.complete || photo.img.naturalWidth === 0) return;
  const layout = LAYOUTS[state.layout];
  const shiftY = state.captionPos === 'top' ? 0.16 : 0;
  const poly = layout.panels[slotIndex].map(([x, y]) => [x, y + shiftY]);
  const bb = polygonBounds(poly);
  const pw = bb.w * W, ph = bb.h * H;
  const focus = photoFocus(photo);
  const iw = photo.img.naturalWidth, ih = photo.img.naturalHeight;
  const s = Math.max(pw / iw, ph / ih) * slot.zoom;
  const dw = iw * s, dh = ih * s;
  const maxOx = Math.max(0, (dw - pw) / 2 / pw);
  const maxOy = Math.max(0, (dh - ph) / 2 / ph);
  slot.ox = clamp((dw / pw) * (0.5 - focus.x), -maxOx, maxOx);
  slot.oy = clamp((dh / ph) * (0.5 - focus.y), -maxOy, maxOy);
}

/* ------------------------------------------------------------- photo panels */

function drawPhotoPanel(ctx, W, H, poly, slot, isSelected) {
  const bb = polygonBounds(poly);
  const px = bb.x * W, py = bb.y * H, pw = bb.w * W, ph = bb.h * H;
  const photo = state.photos[slot.photo];

  ctx.save();
  tracePolygon(ctx, poly, W, H);
  ctx.shadowColor = 'rgba(0,0,0,.55)';
  ctx.shadowBlur = W * 0.018;
  ctx.shadowOffsetY = W * 0.004;
  ctx.fillStyle = '#241031';
  ctx.fill();
  ctx.restore();

  ctx.save();
  tracePolygon(ctx, poly, W, H);
  ctx.clip();
  const treated = photo && photo.img.complete && photo.img.naturalWidth > 0
    ? treatedPhoto(photo, state.treatment) : null;
  if (treated && treated.w > 0) {
    const iw = treated.w, ih = treated.h;
    const s = Math.max(pw / iw, ph / ih) * slot.zoom;
    const dw = iw * s, dh = ih * s;
    const maxOx = Math.max(0, (dw - pw) / 2 / pw);
    const maxOy = Math.max(0, (dh - ph) / 2 / ph);
    const ox = clamp(slot.ox, -maxOx, maxOx);
    const oy = clamp(slot.oy, -maxOy, maxOy);
    slot.ox = ox; slot.oy = oy;
    ctx.drawImage(treated.src, px + pw / 2 + ox * pw - dw / 2, py + ph / 2 + oy * ph - dh / 2, dw, dh);
    // Warm sunset grade over the photo so it fuses with the illustration.
    ctx.fillStyle = 'rgba(255,122,24,.10)';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = 'rgba(143,17,96,.08)';
    ctx.fillRect(px, py, pw, ph);
  } else {
    ctx.fillStyle = '#2a1245';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#b9a3cf';
    ctx.font = `700 ${Math.max(13, W * 0.014)}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', px + pw / 2, py + ph / 2);
  }
  ctx.restore();

  // White poster frame, with a neon inner edge for the Rim light treatment.
  ctx.save();
  tracePolygon(ctx, poly, W, H);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, W * 0.006);
  ctx.lineJoin = 'round';
  ctx.stroke();
  if (state.treatment === 'rim') {
    ctx.strokeStyle = THEMES[state.theme].accent;
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.stroke();
  }
  if (isSelected) {
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(3, W * 0.005);
    ctx.setLineDash([W * 0.012, W * 0.008]);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------- poster details
 * The movie-poster furniture that makes a cover read as a poster at a
 * glance: a striped chrome 3D title, a hero photo bursting out of its
 * frame, a STARRING chip, a round seal, and a billing strip. */

function tintCanvas(src, color) {
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  const cx = c.getContext('2d');
  cx.drawImage(src, 0, 0);
  cx.globalCompositeOperation = 'source-in';
  cx.fillStyle = color;
  cx.fillRect(0, 0, c.width, c.height);
  return c;
}

function drawChromeTitle(ctx, lines, cx, cy, fontSize, theme) {
  const font = `900 ${fontSize}px "Arial Black", "Segoe UI", Arial, sans-serif`;
  const lineH = fontSize * 0.98;
  const pad = Math.ceil(fontSize * 0.35);
  ctx.save();
  ctx.font = font;
  let maxW = 0;
  for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line).width);
  ctx.restore();
  const w = Math.ceil(maxW + pad * 2);
  const h = Math.ceil(lineH * lines.length + pad * 2);
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const o = off.getContext('2d');
  o.font = font;
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.lineJoin = 'round';
  if ('letterSpacing' in o) o.letterSpacing = `${fontSize * 0.015}px`;
  lines.forEach((line, i) => {
    const y = pad + lineH * (i + 0.5);
    o.strokeStyle = '#160327';
    o.lineWidth = fontSize * 0.14;
    o.strokeText(line, w / 2, y);
    o.fillStyle = '#ffffff';
    o.fillText(line, w / 2, y);
  });
  // Chrome: vertical metal bands, then horizontal pinstripes on top.
  const chrome = o.createLinearGradient(0, 0, 0, h);
  chrome.addColorStop(0, '#f8f9ff');
  chrome.addColorStop(0.28, '#c9d4ff');
  chrome.addColorStop(0.46, '#ffffff');
  chrome.addColorStop(0.58, '#8fa8d8');
  chrome.addColorStop(0.72, '#eef2ff');
  chrome.addColorStop(1, '#7d92c4');
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = chrome;
  o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = 'source-atop';
  for (let y = 0; y < h; y += Math.max(3, fontSize * 0.13)) {
    o.fillStyle = 'rgba(22,3,39,.22)';
    o.fillRect(0, y, w, Math.max(1.5, fontSize * 0.03));
  }
  o.globalCompositeOperation = 'source-over';
  // 3D extrusion: dark copies stepping down-right, then the chrome face.
  const dark = tintCanvas(off, '#160327');
  const step = Math.max(2, fontSize * 0.022);
  for (let i = 6; i >= 1; i--) {
    ctx.drawImage(dark, cx - w / 2 + i * step, cy - h / 2 + i * step);
  }
  ctx.save();
  ctx.shadowColor = theme.textShadow;
  ctx.shadowBlur = fontSize * 0.25;
  ctx.shadowOffsetY = fontSize * 0.04;
  ctx.drawImage(off, cx - w / 2, cy - h / 2);
  ctx.restore();
}

function drawPopOutBadge(ctx, W, H, theme, layout) {
  if (!layout.badgeAt) return;
  const slot = state.slots[0];
  const photo = slot ? state.photos[slot.photo] : null;
  if (!photo || !photo.img.complete || photo.img.naturalWidth === 0) return;
  const bx = layout.badgeAt[0] * W, by = layout.badgeAt[1] * H;
  const r = H * 0.085;
  // Neon starburst behind the badge.
  ctx.save();
  ctx.translate(bx, by);
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.45);
    ctx.lineTo(r * 0.14, -r * 0.9);
    ctx.lineTo(-r * 0.14, -r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(Math.PI / 6);
  }
  ctx.restore();
  // The hero photo again, zoomed and centred on its face-first focus
  // point, bursting out of its panel.
  ctx.save();
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.clip();
  const treated = treatedPhoto(photo, state.treatment);
  const iw = treated.w, ih = treated.h;
  const s = Math.max((r * 2) / iw, (r * 2) / ih) * 1.7;
  const focus = photoFocus(photo);
  const fx = clamp(focus.x, r / (iw * s), 1 - r / (iw * s));
  const fy = clamp(focus.y, r / (ih * s), 1 - r / (ih * s));
  ctx.drawImage(treated.src, bx - fx * iw * s, by - fy * ih * s, iw * s, ih * s);
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(3, W * 0.005);
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = W * 0.02;
  ctx.stroke();
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStarringChip(ctx, W, H, theme) {
  const h = H * 0.038;
  const cx = W * 0.105, cy = H * 0.25;
  ctx.save();
  ctx.font = `800 ${h * 0.5}px "Segoe UI", Arial, sans-serif`;
  const label = '★ STARRING';
  const tw = ctx.measureText(label).width;
  const w = tw + h * 1.4;
  ctx.translate(cx, cy);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#160327';
  roundRectPath(ctx, -w / 2, -h / 2, w, h, h * 0.45);
  ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = Math.max(2, H * 0.003);
  ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

function drawSeal(ctx, W, H, theme) {
  const cx = W * 0.925, cy = H * 0.10, R = H * 0.05;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(22,3,39,.72)';
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = Math.max(2, R * 0.05);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.78, 0, Math.PI * 2); ctx.stroke();
  const legend = 'VICE NIGHTS • EST 2026 • ';
  ctx.fillStyle = theme.text;
  ctx.font = `700 ${R * 0.17}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < legend.length; i++) {
    const a = -Math.PI / 2 + (i / legend.length) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -R * 0.89);
    ctx.fillText(legend[i], 0, 0);
    ctx.restore();
  }
  ctx.fillStyle = theme.accent;
  ctx.font = `900 ${R * 0.42}px "Arial Black", Arial, sans-serif`;
  ctx.fillText('VN', 0, R * 0.04);
  ctx.restore();
}

function drawBillingStrip(ctx, W, H) {
  const h = H * 0.032;
  ctx.save();
  ctx.fillStyle = '#05010a';
  ctx.fillRect(0, H - h, W, h);
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.font = `600 ${Math.max(9, h * 0.42)}px "Segoe UI", Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${h * 0.08}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const line = `STARRING ${state.starring.toUpperCase()}    ·    A VICE NIGHTS PRODUCTION    ·    ${state.subcaption.toUpperCase()}`;
  ctx.fillText(line, W / 2, H - h / 2);
  ctx.restore();
}

/* ------------------------------------------------------------- caption ribbon */

function captionLines() {
  const words = state.caption.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [state.caption.trim() || 'VICE'];
  const first = words[0];
  return [first, words.slice(1).join(' ')];
}

function drawCaptionRibbon(ctx, W, H, theme) {
  const top = state.captionPos === 'top';
  const bandTop = top ? 0 : H * 0.78;
  const bandH = H * 0.185;
  // Diagonal ribbon across the frame.
  const slant = H * 0.035;
  ctx.save();
  ctx.beginPath();
  if (top) {
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, bandH - slant); ctx.lineTo(0, bandH);
  } else {
    ctx.moveTo(0, bandTop + slant); ctx.lineTo(W, bandTop); ctx.lineTo(W, H); ctx.lineTo(0, H);
  }
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH);
  grad.addColorStop(0, theme.bandTop);
  grad.addColorStop(1, theme.bandBottom);
  ctx.fillStyle = grad;
  ctx.fill();
  // Neon edge along the ribbon's open side.
  ctx.strokeStyle = theme.bandEdge;
  ctx.lineWidth = Math.max(2, H * 0.004);
  ctx.beginPath();
  if (top) { ctx.moveTo(0, bandH); ctx.lineTo(W, bandH - slant); }
  else { ctx.moveTo(0, bandTop + slant); ctx.lineTo(W, bandTop); }
  ctx.stroke();
  ctx.restore();

  // Procedural sun + palms inside the ribbon, so the lettering sits on art.
  const sunX = W * 0.86, sunY = bandTop + bandH * 0.52, sunR = bandH * 0.42;
  ctx.save();
  ctx.beginPath();
  if (top) { ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, bandH - slant); ctx.lineTo(0, bandH); }
  else { ctx.moveTo(0, bandTop + slant); ctx.lineTo(W, bandTop); ctx.lineTo(W, H); ctx.lineTo(0, H); }
  ctx.closePath();
  ctx.clip();
  const sg = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.2);
  sg.addColorStop(0, theme.sunGlow);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - sunR * 2.2, sunY - sunR * 2.2, sunR * 4.4, sunR * 4.4);
  const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sunGrad.addColorStop(0, theme.sunCore);
  sunGrad.addColorStop(1, theme.sunEdge);
  ctx.fillStyle = sunGrad;
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
  drawPalm(ctx, W * 0.045, bandTop + bandH * 0.98, bandH * 0.011, 0.10, theme);
  drawPalm(ctx, W * 0.955, bandTop + bandH * 0.98, bandH * 0.009, -0.12, theme);
  ctx.restore();

  // Retro-chrome 3D title, stacked and slightly tilted over the artwork.
  const lines = captionLines();
  const fontSize = Math.min(W, H) * 0.082 * state.captionSize;
  const lineH = fontSize * 0.98;
  const subSize = Math.max(11, fontSize * 0.20);
  const blockH = lineH * lines.length + subSize * 1.3;
  const cx = W * 0.5;
  const cy = bandTop + (bandH - blockH) / 2 + (lineH * lines.length) / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.028);
  drawChromeTitle(ctx, lines, 0, 0, fontSize, theme);
  ctx.font = `800 ${subSize}px "Segoe UI", Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${subSize * 0.28}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.accent;
  ctx.fillText(state.subcaption.toUpperCase(), 0, (lineH * lines.length) / 2 + subSize * 0.9);
  ctx.restore();
}

/* ------------------------------------------------------------- full scene */

function drawCover(ctx, W, H, opts) {
  const theme = THEMES[state.theme];
  const editor = !!(opts && opts.editor);
  const layout = LAYOUTS[state.layout];
  const shiftY = state.captionPos === 'top' ? 0.16 : 0;

  drawViceCitySky(ctx, W, H, theme);
  drawSlattedSun(ctx, W, H, theme);
  drawSkyline(ctx, W, H, theme);
  drawPalm(ctx, W * 0.015, H * 0.20, H * 0.0016, 0.10, theme);
  drawPalm(ctx, W * 0.985, H * 0.19, H * 0.0014, -0.12, theme);
  drawNeonSea(ctx, W, H, theme);

  layout.panels.forEach((poly, i) => {
    const shifted = poly.map(([x, y]) => [x, y + shiftY]);
    const slot = state.slots[i] || { photo: 0, zoom: 1, ox: 0, oy: 0 };
    drawPhotoPanel(ctx, W, H, shifted, slot, editor && i === state.selected);
    if (editor) {
      const bb = polygonBounds(shifted);
      ctx.save();
      ctx.fillStyle = 'rgba(22,3,39,.85)';
      ctx.beginPath();
      ctx.arc((bb.x + 0.03) * W, (bb.y + 0.05) * H, Math.max(11, W * 0.012), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb347';
      ctx.font = `800 ${Math.max(11, W * 0.014)}px "Segoe UI", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), (bb.x + 0.03) * W, (bb.y + 0.05) * H);
      ctx.restore();
    }
  });

  drawPopOutBadge(ctx, W, H, theme, layout);
  drawStarringChip(ctx, W, H, theme);

  drawCaptionRibbon(ctx, W, H, theme);
  drawSeal(ctx, W, H, theme);
  drawBillingStrip(ctx, W, H);

  // Vignette.
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,1,24,.38)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

/* ------------------------------------------------------------- editor */

const canvas = document.getElementById('preview');
const pctx = canvas.getContext('2d');
const stageLabel = document.getElementById('stage-label');
const stageSelected = document.getElementById('stage-selected');
const thumbsBox = document.getElementById('thumbs');

function previewSize() {
  const [w, h] = EXPORT_SIZES[state.exportSize];
  return { w: 960, h: Math.round(960 * h / w) };
}

function renderPreview() {
  const { w, h } = previewSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(pctx, w, h, { editor: true });
  stageLabel.textContent = `Preview · ${state.exportSize.replace('x', ' × ')}`;
  stageSelected.textContent = `Panel ${state.selected + 1} selected`;
}

function addPhoto(img, name) {
  state.photos.push({ img, name });
  const idx = state.photos.length - 1;
  const thumb = document.createElement('img');
  thumb.src = img.src;
  thumb.alt = name;
  thumb.title = name;
  thumb.addEventListener('click', () => {
    state.armedPhoto = idx;
    thumbsBox.querySelectorAll('img').forEach(t => t.classList.remove('armed'));
    thumb.classList.add('armed');
    renderPreview();
  });
  thumbsBox.appendChild(thumb);
  // Fill slots that point at a photo that does not exist yet.
  state.slots.forEach(slot => {
    if (slot.photo < 0 || slot.photo >= state.photos.length) slot.photo = idx;
  });
  // Frame the new photo on its busiest detail, faces first.
  if (state.smartCrop) {
    state.slots.forEach((slot, i) => {
      if (slot.photo === idx) smartCropSlot(i, canvas.width, canvas.height);
    });
  }
  renderPreview();
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { addPhoto(img, file.name); };
  img.src = url;
}

function loadSample(url, name) {
  const img = new Image();
  img.onload = () => { addPhoto(img, name); };
  img.src = url;
}

/* Panel picking + dragging. */
function canvasPoint(ev) {
  const r = canvas.getBoundingClientRect();
  const x = (ev.clientX - r.left) / r.width;
  const y = (ev.clientY - r.top) / r.height;
  return { x, y };
}

function pickPanel(x, y) {
  const layout = LAYOUTS[state.layout];
  const shiftY = state.captionPos === 'top' ? 0.16 : 0;
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const poly = layout.panels[i].map(([px, py]) => [px, py + shiftY]);
    if (pointInPolygon(x, y, poly)) return i;
  }
  return -1;
}

let dragging = null;
canvas.addEventListener('pointerdown', ev => {
  const { x, y } = canvasPoint(ev);
  const hit = pickPanel(x, y);
  if (hit < 0) return;
  if (state.armedPhoto >= 0) {
    state.slots[hit].photo = state.armedPhoto;
    state.slots[hit].zoom = 1; state.slots[hit].ox = 0; state.slots[hit].oy = 0;
    state.armedPhoto = -1;
    thumbsBox.querySelectorAll('img').forEach(t => t.classList.remove('armed'));
    state.selected = hit;
    renderPreview();
    return;
  }
  state.selected = hit;
  const slot = state.slots[hit];
  dragging = { panel: hit, startX: x, startY: y, ox: slot.ox, oy: slot.oy };
  canvas.setPointerCapture(ev.pointerId);
  renderPreview();
});
canvas.addEventListener('pointermove', ev => {
  if (!dragging) return;
  const { x, y } = canvasPoint(ev);
  const layout = LAYOUTS[state.layout];
  const shiftY = state.captionPos === 'top' ? 0.16 : 0;
  const poly = layout.panels[dragging.panel].map(([px, py]) => [px, py + shiftY]);
  const bb = polygonBounds(poly);
  const slot = state.slots[dragging.panel];
  slot.ox = dragging.ox + (x - dragging.startX) / bb.w;
  slot.oy = dragging.oy + (y - dragging.startY) / bb.h;
  renderPreview();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', ev => {
  ev.preventDefault();
  const slot = state.slots[state.selected];
  slot.zoom = clamp(slot.zoom * Math.exp(-ev.deltaY * 0.0012), 1, 3);
  document.getElementById('zoom').value = String(slot.zoom);
  renderPreview();
}, { passive: false });

/* Drag & drop photos onto the stage. */
const wrap = document.querySelector('.canvas-wrap');
wrap.addEventListener('dragover', ev => { ev.preventDefault(); });
wrap.addEventListener('drop', ev => {
  ev.preventDefault();
  for (const f of ev.dataTransfer.files) loadFile(f);
});

/* Controls wiring. */
document.getElementById('file-input').addEventListener('change', ev => {
  for (const f of ev.target.files) loadFile(f);
  ev.target.value = '';
});
document.getElementById('btn-fill-all').addEventListener('click', () => {
  if (state.photos.length === 0) return;
  state.slots.forEach(slot => { slot.photo = 0; slot.zoom = 1; slot.ox = 0; slot.oy = 0; });
  renderPreview();
});
document.getElementById('btn-centre').addEventListener('click', () => {
  const slot = state.slots[state.selected];
  slot.ox = 0; slot.oy = 0; slot.zoom = 1;
  document.getElementById('zoom').value = '1';
  renderPreview();
});
document.getElementById('zoom').addEventListener('input', ev => {
  state.slots[state.selected].zoom = Number(ev.target.value);
  renderPreview();
});
document.getElementById('caption').addEventListener('input', ev => {
  state.caption = ev.target.value;
  renderPreview();
});
document.getElementById('subcaption').addEventListener('input', ev => {
  state.subcaption = ev.target.value;
  renderPreview();
});
document.getElementById('caption-size').addEventListener('input', ev => {
  state.captionSize = Number(ev.target.value);
  renderPreview();
});

function wireSegment(id, key, onPick) {
  const seg = document.getElementById(id);
  seg.addEventListener('click', ev => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onPick(btn.dataset[key]);
  });
}
wireSegment('layout-seg', 'layout', value => {
  state.layout = value;
  state.slots = defaultSlots(value);
  state.selected = 0;
  renderPreview();
});
wireSegment('theme-seg', 'theme', value => { state.theme = value; renderPreview(); });
wireSegment('caption-pos', 'pos', value => { state.captionPos = value; renderPreview(); });
wireSegment('size-seg', 'size', value => { state.exportSize = value; renderPreview(); });
wireSegment('treatment-seg', 'treatment', value => { state.treatment = value; renderPreview(); });
document.getElementById('starring').addEventListener('input', ev => {
  state.starring = ev.target.value;
  renderPreview();
});
document.getElementById('btn-smart-crop').addEventListener('click', () => {
  smartCropSlot(state.selected, canvas.width, canvas.height);
  renderPreview();
});

/* Export: render the same scene at full size and download the PNG. */
function exportCoverPNG() {
  const [w, h] = EXPORT_SIZES[state.exportSize];
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  drawCover(off.getContext('2d'), w, h, { editor: false });
  off.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-nights-${state.exportSize}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}
document.getElementById('btn-export').addEventListener('click', exportCoverPNG);

/* Boot: load the two kit sample photos, then paint. */
loadSample('samples/boulevard.jpg', 'boulevard.jpg');
loadSample('samples/pier.jpg', 'pier.jpg');
renderPreview();
