// Fixed scenes for screenshots: ?shot=editor shows the editor with the sample
// photo; ?shot=cover shows the cover alone, full frame. `size` picks the
// export size, `layout` and `grade` the look, `caption` the title words.
// window.__shotReady is set once the cover is painted.

export function applyShot(query, api) {
  const shot = query.get('shot');
  if (!shot) return false;
  if (query.get('layout')) api.state.layout = query.get('layout');
  if (query.get('grade')) api.state.grade = query.get('grade');
  if (query.get('caption')) api.state.title = query.get('caption').toUpperCase();
  if (query.get('size')) api.state.size = query.get('size');
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.loadSample().then(() => {
    api.renderPreview();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  });
  return true;
}
