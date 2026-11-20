// Comic Vice characters — five original comic-book cutouts, drawn fresh in
// code with canvas paths. No Rockstar artwork, no borrowed images: every
// face, jacket and hat below is an original drawing. Each character draws a
// head-and-shoulders bust inside a 400 x 520 box, centred on (0, 0), so the
// caller can place, scale and flip it anywhere on the cover. The thick
// black outlines, flat colours and sticker halo are what make them read as
// comic-book art.

const INK = '#141414';

function strokePath(ctx, width) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

// White sticker halo behind a bust: a head ellipse plus a shoulders blob,
// slightly larger than the character itself.
function stickerHalo(ctx) {
  ctx.beginPath();
  ctx.ellipse(0, -70, 108, 118, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-185, 250);
  ctx.quadraticCurveTo(-195, 110, -120, 92);
  ctx.quadraticCurveTo(-40, 76, 0, 76);
  ctx.quadraticCurveTo(40, 76, 120, 92);
  ctx.quadraticCurveTo(195, 110, 185, 250);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function headShape(ctx, skin, w = 84, h = 96, y = -70) {
  ctx.beginPath();
  ctx.ellipse(0, y, w, h, 0, 0, Math.PI * 2);
  ctx.fillStyle = skin;
  ctx.fill();
  strokePath(ctx, 7);
}

function jawShade(ctx, shade, y = -30) {
  // Simple cel shade on one side of the face.
  ctx.beginPath();
  ctx.ellipse(38, y, 42, 52, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = shade;
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function shades(ctx, style, y = -78) {
  // Sunglasses. style: 'rect' | 'round' | 'aviator'
  ctx.fillStyle = '#101010';
  if (style === 'round') {
    for (const cx of [-38, 38]) {
      ctx.beginPath();
      ctx.arc(cx, y, 26, 0, Math.PI * 2);
      ctx.fill();
      strokePath(ctx, 6);
      ctx.beginPath();
      ctx.moveTo(cx - 16, y - 12);
      ctx.lineTo(cx - 4, y - 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = INK;
    }
  } else if (style === 'aviator') {
    for (const cx of [-38, 38]) {
      ctx.beginPath();
      ctx.moveTo(cx - 30, y - 6);
      ctx.lineTo(cx + 30, y - 6);
      ctx.lineTo(cx + 18, y + 22);
      ctx.lineTo(cx - 18, y + 22);
      ctx.closePath();
      ctx.fill();
      strokePath(ctx, 5);
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = INK;
    }
  } else {
    for (const cx of [-38, 38]) {
      ctx.beginPath();
      ctx.roundRect(cx - 32, y - 18, 64, 38, 8);
      ctx.fill();
      strokePath(ctx, 6);
      ctx.beginPath();
      ctx.moveTo(cx - 20, y - 8);
      ctx.lineTo(cx - 2, y - 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = INK;
    }
  }
  ctx.beginPath();
  ctx.moveTo(-8, y - 2);
  ctx.lineTo(8, y - 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function smile(ctx, y = -8, w = 34, open = false) {
  ctx.beginPath();
  if (open) {
    ctx.ellipse(0, y, w, 16, 0, 0, Math.PI);
    ctx.fillStyle = '#7a2b1d';
    ctx.fill();
    strokePath(ctx, 6);
    ctx.beginPath();
    ctx.ellipse(0, y + 2, w - 6, 7, 0, 0, Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  } else {
    ctx.arc(0, y - 14, w, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

function goldChain(ctx, y = 150) {
  ctx.beginPath();
  ctx.arc(0, 96, 62, 0.25 * Math.PI, 0.75 * Math.PI);
  ctx.strokeStyle = '#e8b23a';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#e8b23a';
  ctx.fill();
  strokePath(ctx, 5);
}

function drawJax(ctx) {
  stickerHalo(ctx);
  // Leather jacket shoulders.
  ctx.beginPath();
  ctx.moveTo(-185, 250);
  ctx.quadraticCurveTo(-195, 110, -120, 92);
  ctx.quadraticCurveTo(-40, 76, 0, 76);
  ctx.quadraticCurveTo(40, 76, 120, 92);
  ctx.quadraticCurveTo(195, 110, 185, 250);
  ctx.closePath();
  ctx.fillStyle = '#1d1d22';
  ctx.fill();
  strokePath(ctx, 8);
  // White tee + open collar.
  ctx.beginPath();
  ctx.moveTo(-52, 88);
  ctx.lineTo(0, 170);
  ctx.lineTo(52, 88);
  ctx.lineTo(30, 80);
  ctx.lineTo(0, 128);
  ctx.lineTo(-30, 80);
  ctx.closePath();
  ctx.fillStyle = '#f5f2ea';
  ctx.fill();
  strokePath(ctx, 6);
  // Jacket lapels.
  ctx.beginPath();
  ctx.moveTo(-120, 92);
  ctx.lineTo(-30, 80);
  ctx.lineTo(0, 128);
  ctx.lineTo(-52, 210);
  ctx.closePath();
  ctx.fillStyle = '#2b2b31';
  ctx.fill();
  strokePath(ctx, 6);
  ctx.beginPath();
  ctx.moveTo(120, 92);
  ctx.lineTo(30, 80);
  ctx.lineTo(0, 128);
  ctx.lineTo(52, 210);
  ctx.closePath();
  ctx.fillStyle = '#2b2b31';
  ctx.fill();
  strokePath(ctx, 6);
  goldChain(ctx, 196);
  // Neck.
  ctx.beginPath();
  ctx.roundRect(-26, 10, 52, 76, 12);
  ctx.fillStyle = '#e8b088';
  ctx.fill();
  strokePath(ctx, 6);
  headShape(ctx, '#f2c19b');
  jawShade(ctx, '#e0a878');
  // Pompadour: big swept hair.
  ctx.beginPath();
  ctx.moveTo(-86, -84);
  ctx.quadraticCurveTo(-92, -178, -10, -186);
  ctx.quadraticCurveTo(88, -192, 90, -118);
  ctx.quadraticCurveTo(92, -88, 78, -96);
  ctx.quadraticCurveTo(60, -128, 10, -122);
  ctx.quadraticCurveTo(-52, -118, -64, -92);
  ctx.quadraticCurveTo(-72, -76, -86, -84);
  ctx.closePath();
  ctx.fillStyle = '#241a12';
  ctx.fill();
  strokePath(ctx, 7);
  shades(ctx, 'rect');
  smile(ctx, -6, 30);
  // Stubble dots.
  ctx.fillStyle = 'rgba(20,20,20,0.35)';
  for (const [x, y] of [[-52, 6], [-40, 22], [52, 6], [40, 22], [-58, -14], [58, -14]]) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLuna(ctx) {
  stickerHalo(ctx);
  // Teal jacket shoulders.
  ctx.beginPath();
  ctx.moveTo(-185, 250);
  ctx.quadraticCurveTo(-195, 110, -120, 92);
  ctx.quadraticCurveTo(-40, 76, 0, 76);
  ctx.quadraticCurveTo(40, 76, 120, 92);
  ctx.quadraticCurveTo(195, 110, 185, 250);
  ctx.closePath();
  ctx.fillStyle = '#0f8a8a';
  ctx.fill();
  strokePath(ctx, 8);
  // Coral top.
  ctx.beginPath();
  ctx.moveTo(-46, 88);
  ctx.lineTo(0, 150);
  ctx.lineTo(46, 88);
  ctx.lineTo(28, 82);
  ctx.lineTo(0, 118);
  ctx.lineTo(-28, 82);
  ctx.closePath();
  ctx.fillStyle = '#ff5d73';
  ctx.fill();
  strokePath(ctx, 6);
  // Long wavy hair behind the shoulders.
  ctx.beginPath();
  ctx.moveTo(-96, -110);
  ctx.quadraticCurveTo(-128, -20, -118, 90);
  ctx.quadraticCurveTo(-112, 150, -86, 130);
  ctx.quadraticCurveTo(-96, 60, -84, -10);
  ctx.quadraticCurveTo(-76, -70, -96, -110);
  ctx.closePath();
  ctx.fillStyle = '#3a1c10';
  ctx.fill();
  strokePath(ctx, 7);
  ctx.beginPath();
  ctx.moveTo(96, -110);
  ctx.quadraticCurveTo(128, -20, 118, 90);
  ctx.quadraticCurveTo(112, 150, 86, 130);
  ctx.quadraticCurveTo(96, 60, 84, -10);
  ctx.quadraticCurveTo(76, -70, 96, -110);
  ctx.closePath();
  ctx.fillStyle = '#3a1c10';
  ctx.fill();
  strokePath(ctx, 7);
  // Neck.
  ctx.beginPath();
  ctx.roundRect(-24, 12, 48, 74, 12);
  ctx.fillStyle = '#e8b088';
  ctx.fill();
  strokePath(ctx, 6);
  headShape(ctx, '#f6c9a4');
  jawShade(ctx, '#e5ae82');
  // Hair cap over the forehead.
  ctx.beginPath();
  ctx.moveTo(-88, -80);
  ctx.quadraticCurveTo(-90, -168, 0, -172);
  ctx.quadraticCurveTo(90, -168, 88, -80);
  ctx.quadraticCurveTo(70, -118, 30, -116);
  ctx.quadraticCurveTo(0, -132, -34, -114);
  ctx.quadraticCurveTo(-70, -104, -88, -80);
  ctx.closePath();
  ctx.fillStyle = '#3a1c10';
  ctx.fill();
  strokePath(ctx, 7);
  shades(ctx, 'round', -76);
  // Red lips.
  ctx.beginPath();
  ctx.ellipse(0, -2, 26, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e5324a';
  ctx.fill();
  strokePath(ctx, 5);
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(18, -2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // Gold hoop earrings.
  for (const cx of [-86, 86]) {
    ctx.beginPath();
    ctx.arc(cx, -18, 11, 0, Math.PI * 2);
    ctx.strokeStyle = '#e8b23a';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = INK;
  }
}

function drawRico(ctx) {
  stickerHalo(ctx);
  // Leather vest shoulders.
  ctx.beginPath();
  ctx.moveTo(-190, 250);
  ctx.quadraticCurveTo(-198, 110, -122, 90);
  ctx.quadraticCurveTo(-40, 74, 0, 74);
  ctx.quadraticCurveTo(40, 74, 122, 90);
  ctx.quadraticCurveTo(198, 110, 190, 250);
  ctx.closePath();
  ctx.fillStyle = '#4a2c14';
  ctx.fill();
  strokePath(ctx, 8);
  // Bare chest / grey tee.
  ctx.beginPath();
  ctx.moveTo(-58, 86);
  ctx.lineTo(0, 160);
  ctx.lineTo(58, 86);
  ctx.lineTo(34, 80);
  ctx.lineTo(0, 120);
  ctx.lineTo(-34, 80);
  ctx.closePath();
  ctx.fillStyle = '#cfc9bd';
  ctx.fill();
  strokePath(ctx, 6);
  // Vest patches: star + stripe.
  ctx.beginPath();
  ctx.moveTo(-92, 150);
  ctx.lineTo(-82, 168);
  ctx.lineTo(-62, 168);
  ctx.lineTo(-78, 180);
  ctx.lineTo(-72, 198);
  ctx.lineTo(-92, 186);
  ctx.lineTo(-112, 198);
  ctx.lineTo(-106, 180);
  ctx.lineTo(-122, 168);
  ctx.lineTo(-102, 168);
  ctx.closePath();
  ctx.fillStyle = '#ffcf3d';
  ctx.fill();
  strokePath(ctx, 4);
  ctx.beginPath();
  ctx.moveTo(66, 200);
  ctx.lineTo(150, 200);
  ctx.lineTo(150, 214);
  ctx.lineTo(66, 214);
  ctx.closePath();
  ctx.fillStyle = '#e5324a';
  ctx.fill();
  strokePath(ctx, 4);
  // Neck.
  ctx.beginPath();
  ctx.roundRect(-28, 8, 56, 78, 12);
  ctx.fillStyle = '#d99a68';
  ctx.fill();
  strokePath(ctx, 6);
  headShape(ctx, '#e8ac7d', 88, 98);
  jawShade(ctx, '#cf8f5c');
  // Full beard.
  ctx.beginPath();
  ctx.moveTo(-84, -44);
  ctx.quadraticCurveTo(-80, 34, 0, 42);
  ctx.quadraticCurveTo(80, 34, 84, -44);
  ctx.quadraticCurveTo(60, -6, 30, -2);
  ctx.quadraticCurveTo(0, 6, -30, -2);
  ctx.quadraticCurveTo(-60, -6, -84, -44);
  ctx.closePath();
  ctx.fillStyle = '#241a12';
  ctx.fill();
  strokePath(ctx, 6);
  // Red bandana.
  ctx.beginPath();
  ctx.moveTo(-88, -92);
  ctx.quadraticCurveTo(-84, -164, 0, -166);
  ctx.quadraticCurveTo(84, -164, 88, -92);
  ctx.quadraticCurveTo(40, -118, 0, -116);
  ctx.quadraticCurveTo(-40, -118, -88, -92);
  ctx.closePath();
  ctx.fillStyle = '#d92b2b';
  ctx.fill();
  strokePath(ctx, 7);
  // Bandana knot + tails.
  ctx.beginPath();
  ctx.arc(0, -152, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#b31f1f';
  ctx.fill();
  strokePath(ctx, 5);
  ctx.beginPath();
  ctx.moveTo(-8, -146);
  ctx.lineTo(-26, -118);
  ctx.lineTo(-6, -120);
  ctx.closePath();
  ctx.fillStyle = '#d92b2b';
  ctx.fill();
  strokePath(ctx, 4);
  // Bandana dots.
  ctx.fillStyle = '#ffffff';
  for (const [x, y] of [[-52, -132], [52, -132], [0, -128], [-28, -142], [28, -142]]) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  shades(ctx, 'rect', -84);
  // Grin through the beard.
  ctx.beginPath();
  ctx.ellipse(0, 8, 26, 9, 0, 0, Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  strokePath(ctx, 5);
}

function drawVega(ctx) {
  stickerHalo(ctx);
  // Navy uniform shoulders.
  ctx.beginPath();
  ctx.moveTo(-185, 250);
  ctx.quadraticCurveTo(-195, 110, -120, 92);
  ctx.quadraticCurveTo(-40, 76, 0, 76);
  ctx.quadraticCurveTo(40, 76, 120, 92);
  ctx.quadraticCurveTo(195, 110, 185, 250);
  ctx.closePath();
  ctx.fillStyle = '#1c2f57';
  ctx.fill();
  strokePath(ctx, 8);
  // Shirt + tie.
  ctx.beginPath();
  ctx.moveTo(-40, 86);
  ctx.lineTo(0, 130);
  ctx.lineTo(40, 86);
  ctx.lineTo(24, 80);
  ctx.lineTo(0, 108);
  ctx.lineTo(-24, 80);
  ctx.closePath();
  ctx.fillStyle = '#eef2f7';
  ctx.fill();
  strokePath(ctx, 6);
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(-12, 150);
  ctx.lineTo(0, 210);
  ctx.lineTo(12, 150);
  ctx.closePath();
  ctx.fillStyle = '#141414';
  ctx.fill();
  strokePath(ctx, 5);
  // Gold badge star on the chest.
  ctx.beginPath();
  ctx.moveTo(-108, 140);
  ctx.lineTo(-100, 156);
  ctx.lineTo(-82, 156);
  ctx.lineTo(-96, 168);
  ctx.lineTo(-90, 184);
  ctx.lineTo(-108, 174);
  ctx.lineTo(-126, 184);
  ctx.lineTo(-120, 168);
  ctx.lineTo(-134, 156);
  ctx.lineTo(-116, 156);
  ctx.closePath();
  ctx.fillStyle = '#e8b23a';
  ctx.fill();
  strokePath(ctx, 4);
  // Epaulettes.
  for (const cx of [-140, 140]) {
    ctx.beginPath();
    ctx.roundRect(cx - 34, 96, 68, 16, 8);
    ctx.fillStyle = '#e8b23a';
    ctx.fill();
    strokePath(ctx, 4);
  }
  // Neck.
  ctx.beginPath();
  ctx.roundRect(-26, 10, 52, 76, 12);
  ctx.fillStyle = '#d99a68';
  ctx.fill();
  strokePath(ctx, 6);
  headShape(ctx, '#e8ac7d');
  jawShade(ctx, '#cf8f5c');
  // Police cap.
  ctx.beginPath();
  ctx.moveTo(-92, -96);
  ctx.quadraticCurveTo(-96, -168, 0, -172);
  ctx.quadraticCurveTo(96, -168, 92, -96);
  ctx.quadraticCurveTo(0, -118, -92, -96);
  ctx.closePath();
  ctx.fillStyle = '#1c2f57';
  ctx.fill();
  strokePath(ctx, 7);
  // Cap brim.
  ctx.beginPath();
  ctx.ellipse(0, -96, 96, 20, 0, 0, Math.PI);
  ctx.fillStyle = '#101010';
  ctx.fill();
  strokePath(ctx, 6);
  // Cap badge.
  ctx.beginPath();
  ctx.arc(0, -140, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#e8b23a';
  ctx.fill();
  strokePath(ctx, 5);
  ctx.beginPath();
  ctx.arc(0, -140, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#1c2f57';
  ctx.fill();
  shades(ctx, 'aviator', -72);
  // Flat serious mouth.
  ctx.beginPath();
  ctx.moveTo(-24, 2);
  ctx.lineTo(24, 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function drawSunny(ctx) {
  stickerHalo(ctx);
  // Hawaiian shirt shoulders.
  ctx.beginPath();
  ctx.moveTo(-185, 250);
  ctx.quadraticCurveTo(-195, 110, -120, 92);
  ctx.quadraticCurveTo(-40, 76, 0, 76);
  ctx.quadraticCurveTo(40, 76, 120, 92);
  ctx.quadraticCurveTo(195, 110, 185, 250);
  ctx.closePath();
  ctx.fillStyle = '#ff8a3d';
  ctx.fill();
  strokePath(ctx, 8);
  // Shirt flowers.
  ctx.fillStyle = '#ffffff';
  for (const [x, y] of [[-120, 160], [110, 190], [-60, 210], [60, 150], [140, 140], [-150, 200]]) {
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcf3d';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
  }
  // Open collar.
  ctx.beginPath();
  ctx.moveTo(-46, 88);
  ctx.lineTo(0, 150);
  ctx.lineTo(46, 88);
  ctx.lineTo(28, 82);
  ctx.lineTo(0, 118);
  ctx.lineTo(-28, 82);
  ctx.closePath();
  ctx.fillStyle = '#f5c98a';
  ctx.fill();
  strokePath(ctx, 6);
  // Neck.
  ctx.beginPath();
  ctx.roundRect(-26, 10, 52, 76, 12);
  ctx.fillStyle = '#e8b088';
  ctx.fill();
  strokePath(ctx, 6);
  headShape(ctx, '#f2c19b');
  jawShade(ctx, '#e0a878');
  // Bucket hat.
  ctx.beginPath();
  ctx.ellipse(0, -128, 104, 26, 0, Math.PI, 0);
  ctx.fillStyle = '#ffcf3d';
  ctx.fill();
  strokePath(ctx, 7);
  ctx.beginPath();
  ctx.moveTo(-78, -128);
  ctx.quadraticCurveTo(-78, -196, 0, -196);
  ctx.quadraticCurveTo(78, -196, 78, -128);
  ctx.closePath();
  ctx.fillStyle = '#ffcf3d';
  ctx.fill();
  strokePath(ctx, 7);
  // Hat band.
  ctx.beginPath();
  ctx.moveTo(-78, -146);
  ctx.quadraticCurveTo(0, -132, 78, -146);
  ctx.lineTo(78, -128);
  ctx.quadraticCurveTo(0, -114, -78, -128);
  ctx.closePath();
  ctx.fillStyle = '#0f8a8a';
  ctx.fill();
  strokePath(ctx, 5);
  shades(ctx, 'round', -74);
  smile(ctx, -6, 30, true);
  // Sun-tan freckles.
  ctx.fillStyle = 'rgba(180,110,50,0.6)';
  for (const [x, y] of [[-56, -44], [-44, -34], [56, -44], [44, -34], [-62, -56], [62, -56]]) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Registry the editor and the renderer share.
export const CHARACTERS = [
  { id: 'jax', name: 'JAX', role: 'THE DRIVER', draw: drawJax, tag: 'STARRING' },
  { id: 'luna', name: 'LUNA', role: 'THE PARTNER', draw: drawLuna, tag: 'STARRING' },
  { id: 'rico', name: 'RICO', role: 'THE BIKER', draw: drawRico, tag: 'WANTED' },
  { id: 'vega', name: 'VEGA', role: 'THE LAW', draw: drawVega, tag: 'ON DUTY' },
  { id: 'sunny', name: 'SUNNY', role: 'THE LOCAL', draw: drawSunny, tag: 'BEACH LIFE' },
];

export function drawCharacter(ctx, id, x, y, scale, flip) {
  const def = CHARACTERS.find((c) => c.id === id);
  if (!def) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale((flip ? -1 : 1) * scale, scale);
  def.draw(ctx);
  ctx.restore();
}
