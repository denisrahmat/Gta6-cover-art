// COMIC VICE — the five original cartoon characters, drawn in code.
// Flat comic style, thick outlines, no reference to any real person or game
// character. Each draw function paints one figure into a 360x480 box
// (feet at y=470, centre x=180) on the given 2d context.

const OUT = '#14101e';

export function poly(ctx, pts, fill, stroke = OUT, lw = 6) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(); }
}

export function circ(ctx, x, y, r, fill, stroke = OUT, lw = 6) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function rrect(ctx, x, y, w, h, r, fill, stroke = OUT, lw = 6) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function head(ctx, x, y, rx, ry, skin) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = skin; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
}

function shades(ctx, x, y, w, h) {
  rrect(ctx, x - w / 2, y - h / 2, w, h, 10, '#101010');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 8, y + h / 2 - 6); ctx.lineTo(x - w / 2 + w / 3, y - h / 2 + 6); ctx.stroke();
}

function legs(ctx, x, y, w, fill, shoe) {
  poly(ctx, [[x - w / 2, y], [x - 8, y], [x - 10, y + 150], [x - w / 2 - 4, y + 150]], fill);
  poly(ctx, [[x + 8, y], [x + w / 2, y], [x + w / 2 + 4, y + 150], [x + 10, y + 150]], fill);
  rrect(ctx, x - w / 2 - 8, y + 148, 46, 20, 8, shoe);
  rrect(ctx, x + w / 2 - 38, y + 148, 46, 20, 8, shoe);
}

// ---- JAX — THE DRIVER: cap, shades, leather jacket, white tee, jeans ----
export function drawJax(ctx) {
  const skin = '#e8b08a';
  legs(ctx, 180, 300, 96, '#2c4a6b', '#1a1a1a');
  // jacket
  poly(ctx, [[118, 200], [180, 178], [242, 200], [258, 300], [102, 300]], '#3a2a22');
  poly(ctx, [[150, 190], [180, 250], [210, 190], [196, 300], [164, 300]], '#f2ede2'); // tee V
  poly(ctx, [[118, 200], [150, 190], [164, 300], [102, 300]], '#3a2a22');
  poly(ctx, [[242, 200], [210, 190], [196, 300], [258, 300]], '#3a2a22');
  ctx.strokeStyle = '#d8b25a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(180, 250); ctx.lineTo(180, 300); ctx.stroke();
  // arms
  poly(ctx, [[116, 206], [140, 212], [128, 300], [104, 296]], '#3a2a22');
  poly(ctx, [[244, 206], [220, 212], [232, 300], [256, 296]], '#3a2a22');
  circ(ctx, 116, 300, 12, skin); circ(ctx, 244, 300, 12, skin);
  // neck + head
  poly(ctx, [[168, 160], [192, 160], [196, 186], [164, 186]], skin);
  head(ctx, 180, 118, 52, 58, skin);
  // cap
  ctx.beginPath(); ctx.ellipse(180, 84, 56, 30, 0, Math.PI, 0); ctx.fillStyle = '#20242e'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
  poly(ctx, [[124, 78], [236, 78], [246, 92], [114, 92]], '#20242e');
  circ(ctx, 180, 62, 8, '#e8b73a');
  shades(ctx, 180, 118, 84, 26);
  ctx.strokeStyle = OUT; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(180, 158, 12, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}

// ---- LUNA — THE PARTNER: long wavy hair, hoops, pink jacket ----
export function drawLuna(ctx) {
  const skin = '#f0c39a';
  legs(ctx, 180, 300, 88, '#7a2e4d', '#f2ede2');
  poly(ctx, [[122, 200], [180, 178], [238, 200], [252, 300], [108, 300]], '#ff5e8a');
  poly(ctx, [[152, 190], [180, 246], [208, 190], [196, 300], [164, 300]], '#fff3f6');
  poly(ctx, [[122, 200], [152, 190], [164, 300], [108, 300]], '#ff5e8a');
  poly(ctx, [[238, 200], [208, 190], [196, 300], [252, 300]], '#ff5e8a');
  poly(ctx, [[120, 208], [142, 214], [130, 296], [108, 292]], '#ff5e8a');
  poly(ctx, [[240, 208], [218, 214], [230, 296], [252, 292]], '#ff5e8a');
  circ(ctx, 118, 298, 11, skin); circ(ctx, 242, 298, 11, skin);
  // long hair behind
  poly(ctx, [[120, 90], [180, 52], [240, 90], [252, 260], [228, 250], [232, 180], [128, 180], [132, 250], [108, 260]], '#5a1f2b');
  poly(ctx, [[168, 160], [192, 160], [196, 186], [164, 186]], skin);
  head(ctx, 180, 116, 50, 56, skin);
  // hair fringe
  ctx.beginPath(); ctx.ellipse(180, 78, 54, 28, 0, Math.PI, 0); ctx.fillStyle = '#5a1f2b'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
  poly(ctx, [[128, 84], [150, 108], [138, 76]], '#5a1f2b');
  poly(ctx, [[232, 84], [210, 108], [222, 76]], '#5a1f2b');
  // eyes + lashes, smile
  circ(ctx, 162, 118, 5, '#14101e', null); circ(ctx, 198, 118, 5, '#14101e', null);
  ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(152, 110); ctx.lineTo(144, 104); ctx.moveTo(208, 110); ctx.lineTo(216, 104); ctx.stroke();
  ctx.beginPath(); ctx.arc(180, 150, 12, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 5; ctx.stroke();
  circ(ctx, 150, 140, 7, '#f08a7a', null); circ(ctx, 210, 140, 7, '#f08a7a', null);
  // hoops
  ctx.strokeStyle = '#e8b73a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(130, 128, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(230, 128, 9, 0, Math.PI * 2); ctx.stroke();
}

// ---- RICO — THE BIKER: red bandana, beard, black vest ----
export function drawRico(ctx) {
  const skin = '#d99a6c';
  legs(ctx, 180, 300, 100, '#33302e', '#6b3a1f');
  poly(ctx, [[118, 200], [180, 178], [242, 200], [258, 300], [102, 300]], '#1d1a1c');
  poly(ctx, [[150, 192], [180, 252], [210, 192], [196, 300], [164, 300]], skin); // open vest
  poly(ctx, [[118, 200], [150, 192], [164, 300], [102, 300]], '#1d1a1c');
  poly(ctx, [[242, 200], [210, 192], [196, 300], [258, 300]], '#1d1a1c');
  // tattoo lines on chest + arms
  ctx.strokeStyle = '#14101e'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(168, 220); ctx.lineTo(192, 240); ctx.moveTo(192, 220); ctx.lineTo(168, 240); ctx.stroke();
  poly(ctx, [[116, 206], [140, 212], [128, 300], [104, 296]], skin);
  poly(ctx, [[244, 206], [220, 212], [232, 300], [256, 296]], skin);
  circ(ctx, 116, 300, 12, skin); circ(ctx, 244, 300, 12, skin);
  poly(ctx, [[168, 160], [192, 160], [196, 186], [164, 186]], skin);
  head(ctx, 180, 116, 54, 58, skin);
  // beard
  ctx.beginPath(); ctx.ellipse(180, 152, 44, 26, 0, 0, Math.PI); ctx.fillStyle = '#241812'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.beginPath(); ctx.arc(180, 152, 13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.strokeStyle = '#f2ede2'; ctx.lineWidth = 4; ctx.stroke();
  // bandana
  ctx.beginPath(); ctx.ellipse(180, 82, 56, 28, 0, Math.PI, 0); ctx.fillStyle = '#d92038'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
  poly(ctx, [[228, 78], [252, 108], [236, 112]], '#d92038');
  circ(ctx, 180, 66, 7, '#fff3f6');
  // eyes
  circ(ctx, 160, 116, 5, '#14101e', null); circ(ctx, 200, 116, 5, '#14101e', null);
}

// ---- VEGA — THE LAW: police cap, navy uniform, badge ----
export function drawVega(ctx) {
  const skin = '#e8b08a';
  legs(ctx, 180, 300, 96, '#1c2a4a', '#14101e');
  poly(ctx, [[118, 200], [180, 178], [242, 200], [258, 300], [102, 300]], '#22345e');
  poly(ctx, [[170, 186], [180, 250], [190, 186], [186, 300], [174, 300]], '#101828'); // tie
  poly(ctx, [[118, 200], [170, 186], [174, 300], [102, 300]], '#22345e');
  poly(ctx, [[242, 200], [190, 186], [186, 300], [258, 300]], '#22345e');
  // badge star
  ctx.fillStyle = '#e8b73a'; ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 14 : 6, a = -Math.PI / 2 + i * Math.PI / 5;
    const px = 216 + Math.cos(a) * r, py = 224 + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  poly(ctx, [[120, 208], [142, 214], [130, 296], [108, 292]], '#22345e');
  poly(ctx, [[240, 208], [218, 214], [230, 296], [252, 292]], '#22345e');
  circ(ctx, 118, 298, 11, skin); circ(ctx, 242, 298, 11, skin);
  poly(ctx, [[168, 160], [192, 160], [196, 186], [164, 186]], skin);
  head(ctx, 180, 116, 52, 56, skin);
  // police cap
  poly(ctx, [[122, 88], [238, 88], [244, 66], [116, 66]], '#16213c');
  ctx.beginPath(); ctx.ellipse(180, 66, 58, 16, 0, Math.PI, 0); ctx.fillStyle = '#16213c'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
  poly(ctx, [[120, 86], [240, 86], [252, 98], [108, 98]], '#101828');
  circ(ctx, 180, 76, 7, '#e8b73a');
  circ(ctx, 160, 116, 5, '#14101e', null); circ(ctx, 200, 116, 5, '#14101e', null);
  ctx.strokeStyle = OUT; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(172, 148); ctx.lineTo(188, 148); ctx.stroke();
}

// ---- SUNNY — THE LOCAL: bucket hat, shades on forehead, tank top ----
export function drawSunny(ctx) {
  const skin = '#c98a5e';
  // shorts + legs
  poly(ctx, [[140, 300], [220, 300], [224, 360], [196, 360], [190, 330], [170, 330], [164, 360], [136, 360]], '#ff7e3d');
  poly(ctx, [[150, 360], [168, 360], [166, 440], [146, 440]], skin);
  poly(ctx, [[192, 360], [210, 360], [214, 440], [194, 440]], skin);
  rrect(ctx, 138, 440, 40, 16, 8, '#2e6f5e'); rrect(ctx, 182, 440, 40, 16, 8, '#2e6f5e');
  // tank top
  poly(ctx, [[128, 200], [180, 182], [232, 200], [246, 300], [114, 300]], '#ffd21f');
  ctx.strokeStyle = OUT; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(150, 210); ctx.lineTo(210, 210); ctx.stroke();
  poly(ctx, [[124, 206], [144, 212], [132, 296], [112, 292]], skin);
  poly(ctx, [[236, 206], [216, 212], [228, 296], [248, 292]], skin);
  circ(ctx, 122, 298, 11, skin); circ(ctx, 238, 298, 11, skin);
  poly(ctx, [[168, 160], [192, 160], [196, 186], [164, 186]], skin);
  head(ctx, 180, 118, 52, 56, skin);
  // bucket hat
  ctx.beginPath(); ctx.ellipse(180, 84, 62, 20, 0, Math.PI, 0); ctx.fillStyle = '#e8d9a0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(180, 76, 66, 12, 0, 0, Math.PI * 2); ctx.fillStyle = '#e8d9a0'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(180, 66, 48, 22, 0, Math.PI, 0); ctx.fillStyle = '#d9c07a'; ctx.fill(); ctx.stroke();
  // shades pushed up on the hat
  rrect(ctx, 138, 58, 34, 14, 6, '#101010'); rrect(ctx, 188, 58, 34, 14, 6, '#101010');
  // big grin + eyes
  circ(ctx, 160, 118, 5, '#14101e', null); circ(ctx, 200, 118, 5, '#14101e', null);
  ctx.beginPath(); ctx.arc(180, 148, 16, 0.1 * Math.PI, 0.9 * Math.PI); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.arc(180, 146, 16, 0.1 * Math.PI, 0.9 * Math.PI); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
}

export const CHARACTERS = [
  { id: 'jax', name: 'JAX', role: 'THE DRIVER', draw: drawJax },
  { id: 'luna', name: 'LUNA', role: 'THE PARTNER', draw: drawLuna },
  { id: 'rico', name: 'RICO', role: 'THE BIKER', draw: drawRico },
  { id: 'vega', name: 'VEGA', role: 'THE LAW', draw: drawVega },
  { id: 'sunny', name: 'SUNNY', role: 'THE LOCAL', draw: drawSunny },
];

// Paint one character into a fresh transparent canvas (360x480) and return it.
export function characterCanvas(def) {
  const c = document.createElement('canvas');
  c.width = 360; c.height = 480;
  def.draw(c.getContext('2d'));
  return c;
}
