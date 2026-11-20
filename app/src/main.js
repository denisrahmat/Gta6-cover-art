// COMIC VICE — the editor: upload, smart crop, layout and grade pickers,
// character tray with drag/scale/flip, live preview, PNG export.

import { renderCover, gradePhoto, layoutSpec, LAYOUTS, GRADES } from './cover.js';
import { CHARACTERS } from './characters.js';
import { smartCropRect } from './smartcrop.js';
import { applyShot } from './shots.js';

export const SIZES = [
  { id: '1920x1080', w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
  { id: '1080x1080', w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  { id: '1080x1350', w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
];

const state = {
  photo: null,          // HTMLImageElement
  graded: null,         // canvas, graded copy of the photo
  crop: null,           // {sx,sy,sw,sh,ow,oh} in original photo px
  pan: { x: 0.5, y: 0.5 },
  zoom: 1,
  layout: 'hero-left',
  grade: 'sunset',
  title: 'COMIC VICE',
  tagline: 'NEON BAY',
  bubble: 'TWO OUTLAWS. ONE CITY.',
  size: '1920x1080',
  chars: CHARACTERS.map((c) => ({ id: c.id, on: true, x: null, y: null, s: null, flip: false })),
  selected: 'jax',
};

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');
let gradedKey = '';

function sizeOf() { return SIZES.find((s) => s.id === state.size) || SIZES[0]; }

function refreshGraded() {
  if (!state.photo) return;
  const key = `${state.photo.src}|${state.grade}`;
  if (key === gradedKey) return;
  state.graded = gradePhoto(state.photo, state.grade);
  gradedKey = key;
}

function renderPreview() {
  if (!state.photo || !state.crop) return;
  refreshGraded();
  const { w, h } = sizeOf();
  const pw = document.body.classList.contains('shot-cover') ? 1280 : 960;
  const ph = Math.round((pw * h) / w);
  if (preview.width !== pw || preview.height !== ph) { preview.width = pw; preview.height = ph; }
  renderCover(pctx, pw, ph, state);
  preview.style.aspectRatio = `${w} / ${h}`;
}

// Export the cover at real size and download it as a PNG.
export function exportPNG(sizeId) {
  const s = SIZES.find((x) => x.id === sizeId) || sizeOf();
  refreshGraded();
  const c = document.createElement('canvas');
  c.width = s.w; c.height = s.h;
  renderCover(c.getContext('2d'), s.w, s.h, state);
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `comic-vice-${s.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported ${s.label} PNG.`);
  }, 'image/png');
  return c;
}
window.__exportPNG = exportPNG;
window.__state = state;

function setStatus(msg) { const el = $('status'); if (el) el.textContent = msg; }

function loadPhoto(img, label) {
  state.photo = img;
  state.crop = Object.assign(smartCropRect(img, 1), { ow: img.naturalWidth, oh: img.naturalHeight });
  state.pan = { x: 0.5, y: 0.5 };
  state.zoom = 1;
  gradedKey = '';
  refreshGraded();
  renderPreview();
  setStatus(`${label} loaded — smart crop picked the best frame. Drag the photo to reposition.`);
}

function loadSample() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { loadPhoto(img, 'Sample portrait'); resolve(img); };
    img.onerror = () => { setStatus('Sample portrait failed to load.'); resolve(null); };
    img.src = 'samples/portrait.png';
  });
}

// ---------- UI: pickers ----------

function buildPickers() {
  const lg = $('layouts');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pick'; b.dataset.id = l.id;
    b.innerHTML = `<b>${l.name}</b><span>${l.desc}</span>`;
    b.onclick = () => { state.layout = l.id; markActive(lg, l.id); renderPreview(); };
    lg.appendChild(b);
  });
  const gg = $('grades');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pick'; b.dataset.id = g.id;
    b.innerHTML = `<b>${g.name}</b><span>${g.desc}</span>`;
    b.onclick = () => { state.grade = g.id; markActive(gg, g.id); gradedKey = ''; renderPreview(); };
    gg.appendChild(b);
  });
  const tg = $('chars');
  CHARACTERS.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.id = c.id;
    b.textContent = `${c.name} · ${c.role}`;
    b.onclick = () => { selectChar(c.id); };
    tg.appendChild(b);
  });
  const sg = $('sizes');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pick'; b.dataset.id = s.id;
    b.innerHTML = `<b>${s.label}</b><span>Export size</span>`;
    b.onclick = () => { state.size = s.id; markActive(sg, s.id); renderPreview(); };
    sg.appendChild(b);
  });
  markActive(lg, state.layout); markActive(gg, state.grade); markActive(sg, state.size);
  selectChar('jax');
}

function markActive(container, id) {
  container.querySelectorAll('[data-id]').forEach((el) => el.classList.toggle('active', el.dataset.id === id));
}

function selectChar(id) {
  state.selected = id;
  document.querySelectorAll('#chars .chip').forEach((el) => el.classList.toggle('sel', el.dataset.id === id));
  const c = state.chars.find((x) => x.id === id);
  const def = CHARACTERS.find((x) => x.id === id);
  $('charName').textContent = `${def.name} — ${def.role}`;
  $('charScale').value = c.s ?? 0.34;
  $('charFlip').textContent = c.flip ? 'Flipped ✓' : 'Flip';
  $('charToggle').textContent = c.on ? 'On stage ✓' : 'Hidden';
}

function bindControls() {
  $('photo').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => loadPhoto(img, f.name);
    img.src = URL.createObjectURL(f);
  });
  $('sample').addEventListener('click', loadSample);
  $('recrop').addEventListener('click', () => {
    if (!state.photo) return;
    const aspect = sizeOf().w / sizeOf().h;
    state.crop = Object.assign(smartCropRect(state.photo, aspect), { ow: state.photo.naturalWidth, oh: state.photo.naturalHeight });
    state.pan = { x: 0.5, y: 0.5 }; state.zoom = 1;
    renderPreview(); setStatus('Smart crop re-run.');
  });
  $('zoom').addEventListener('input', (e) => { state.zoom = Number(e.target.value); renderPreview(); });
  $('title').addEventListener('input', (e) => { state.title = e.target.value.toUpperCase() || 'COMIC VICE'; renderPreview(); });
  $('tagline').addEventListener('input', (e) => { state.tagline = e.target.value.toUpperCase(); renderPreview(); });
  $('bubble').addEventListener('input', (e) => { state.bubble = e.target.value.toUpperCase(); renderPreview(); });
  $('charScale').addEventListener('input', (e) => {
    const c = state.chars.find((x) => x.id === state.selected);
    c.s = Number(e.target.value); renderPreview();
  });
  $('charFlip').addEventListener('click', () => {
    const c = state.chars.find((x) => x.id === state.selected);
    c.flip = !c.flip; selectChar(state.selected); renderPreview();
  });
  $('charToggle').addEventListener('click', () => {
    const c = state.chars.find((x) => x.id === state.selected);
    c.on = !c.on; selectChar(state.selected); renderPreview();
  });
  $('charReset').addEventListener('click', () => {
    const c = state.chars.find((x) => x.id === state.selected);
    c.x = c.y = c.s = null; c.flip = false; selectChar(state.selected); renderPreview();
  });
  $('export').addEventListener('click', () => exportPNG(state.size));
  $('exportAll').addEventListener('click', () => {
    SIZES.forEach((s, i) => setTimeout(() => exportPNG(s.id), i * 400));
  });
}

// ---------- dragging on the preview ----------

function previewPoint(e) {
  const r = preview.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}

function charAt(p) {
  const L = layoutSpec(state.layout, 1, 1);
  const aspect = sizeOf().w / sizeOf().h;
  for (let i = state.chars.length - 1; i >= 0; i--) {
    const c = state.chars[i];
    if (!c.on) continue;
    const slot = L.slots[i] || { x: 0.5, y: 0.8, s: 0.3 };
    const cx = c.x ?? slot.x;              // fraction of width
    const feetY = c.y ?? slot.y;           // fraction of height
    const s = c.s ?? slot.s;               // height fraction
    const wid = (s * 0.75) / aspect;       // width fraction
    if (p.x >= cx - wid / 2 && p.x <= cx + wid / 2 && p.y >= feetY - s && p.y <= feetY) return { c, i };
  }
  return null;
}

function bindDrag() {
  let drag = null;
  preview.addEventListener('pointerdown', (e) => {
    const p = previewPoint(e);
    const hit = charAt(p);
    if (hit) {
      drag = { kind: 'char', ...hit, dx: p.x, dy: p.y };
      selectChar(hit.c.id);
    } else {
      drag = { kind: 'photo', x: p.x, y: p.y, pan: { ...state.pan } };
    }
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = previewPoint(e);
    if (drag.kind === 'char') {
      drag.c.x = Math.max(0.05, Math.min(0.95, p.x));
      drag.c.y = Math.max(0.25, Math.min(0.98, p.y));
      renderPreview();
    } else {
      state.pan.x = Math.max(0, Math.min(1, drag.pan.x + (p.x - drag.x) * 1.4));
      state.pan.y = Math.max(0, Math.min(1, drag.pan.y + (p.y - drag.y) * 1.4));
      renderPreview();
    }
  });
  preview.addEventListener('pointerup', () => { drag = null; });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    state.zoom = Math.max(1, Math.min(3, state.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    $('zoom').value = state.zoom;
    renderPreview();
  }, { passive: false });
}

// ---------- boot ----------

buildPickers();
bindControls();
bindDrag();
const shot = applyShot(new URLSearchParams(location.search), { state, loadSample, renderPreview, setStatus, sizeOf });
if (shot) {
  // the shot's query may have changed the layout/grade/size: reflect it in the pickers
  markActive($('layouts'), state.layout);
  markActive($('grades'), state.grade);
  markActive($('sizes'), state.size);
} else loadSample();
