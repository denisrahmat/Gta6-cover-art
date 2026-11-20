// Smart crop: pick the best crop window for a target aspect by scoring
// candidate windows on edge energy, with an upper-half (face) bias so heads
// survive the crop. Works on a small downscaled grid, so it is instant.

export function smartCropRect(img, targetAspect) {
  const GW = 72, GH = 72;
  const probe = document.createElement('canvas');
  probe.width = GW; probe.height = GH;
  const pctx = probe.getContext('2d');
  pctx.drawImage(img, 0, 0, GW, GH);
  const px = pctx.getImageData(0, 0, GW, GH).data;

  const lum = new Float32Array(GW * GH);
  for (let i = 0; i < GW * GH; i++) {
    lum[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  }
  // Edge energy per cell (gradient magnitude to right and down neighbours).
  const energy = new Float32Array(GW * GH);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const i = y * GW + x;
      const dx = x + 1 < GW ? lum[i + 1] - lum[i] : 0;
      const dy = y + 1 < GH ? lum[i + GW] - lum[i] : 0;
      // Upper-half bias: cells near the top (faces) count up to 1.7x.
      const faceBias = 1 + 0.7 * (1 - y / GH);
      energy[i] = (Math.abs(dx) + Math.abs(dy)) * faceBias;
    }
  }

  // Window size in grid cells for the target aspect.
  let ww, wh;
  if (targetAspect >= 1) { ww = GW; wh = Math.max(8, Math.round(GW / targetAspect)); }
  else { wh = GH; ww = Math.max(8, Math.round(GH * targetAspect)); }

  // Summed-area table for fast window sums.
  const sat = new Float32Array((GW + 1) * (GH + 1));
  for (let y = 0; y < GH; y++) {
    let row = 0;
    for (let x = 0; x < GW; x++) {
      row += energy[y * GW + x];
      sat[(y + 1) * (GW + 1) + x + 1] = sat[y * (GW + 1) + x + 1] + row;
    }
  }
  const sum = (x0, y0, x1, y1) =>
    sat[y1 * (GW + 1) + x1] - sat[y0 * (GW + 1) + x1] - sat[y1 * (GW + 1) + x0] + sat[y0 * (GW + 1) + x0];

  let best = null, bestScore = -1;
  for (let y0 = 0; y0 + wh <= GH; y0 += 2) {
    for (let x0 = 0; x0 + ww <= GW; x0 += 2) {
      const s = sum(x0, y0, x0 + ww, y0 + wh);
      if (s > bestScore) { bestScore = s; best = { x0, y0 }; }
    }
  }
  if (!best) best = { x0: 0, y0: 0 };
  return {
    sx: (best.x0 / GW) * img.naturalWidth,
    sy: (best.y0 / GH) * img.naturalHeight,
    sw: (ww / GW) * img.naturalWidth,
    sh: (wh / GH) * img.naturalHeight,
  };
}
