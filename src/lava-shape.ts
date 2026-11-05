// Smooth, traveling lobes around an ellipse. The quiet inner ellipse remains
// underneath this outline, so moving edges cannot uncover the content.
export function lavaOutline(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  time: number,
  strength = 1,
) {
  const count = 40;
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const wave = Math.max(
      0.006,
      0.035 +
        Math.sin(angle * 3 + time * 1.1) * 0.027 +
        Math.sin(angle * 5 - time * 0.73) * 0.018 +
        Math.cos(angle * 2 + time * 0.47) * 0.013,
    );
    const radius = 1 + wave * strength;
    return {
      x: cx + Math.cos(angle) * rx * radius,
      y: cy + Math.sin(angle) * ry * radius,
    };
  });
  const n = (value: number) => value.toFixed(2);
  let path = `M${n(points[0].x)},${n(points[0].y)}`;
  for (let i = 0; i < count; i++) {
    const a = points[(i + count - 1) % count];
    const b = points[i];
    const c = points[(i + 1) % count];
    const d = points[(i + 2) % count];
    path += `C${n(b.x + (c.x - a.x) / 6)},${n(b.y + (c.y - a.y) / 6)} ${n(c.x - (d.x - b.x) / 6)},${n(c.y - (d.y - b.y) / 6)} ${n(c.x)},${n(c.y)}`;
  }
  return `${path}Z`;
}
