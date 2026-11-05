export const poolSlots = Array.from({ length: 6 }, (_, i) => i);

type PoolGoop = {
  born: number;
  life: number;
  x: number;
  size: number;
  rise: number;
  drift: number;
  phase: number;
};

// Shares the lamp's animation loop and goo filter. Its own clock pauses with
// Motion off, keeping the pool and its rising wax in place across menu changes.
export function createLavaPool(host: HTMLElement) {
  const pool = host.querySelector<SVGPathElement>("#lava-pool");
  const shapes = poolSlots.map((i) =>
    host.querySelector<SVGEllipseElement>(`#pool-goop-${i}`),
  );
  const goops: (PoolGoop | null)[] = poolSlots.map(() => null);
  let clock = 0;
  let last: number | null = null;
  let nextGoop = 900 + Math.random() * 900;

  return (now: number, width: number, height: number, motion: boolean) => {
    if (motion && last !== null) clock += Math.min(now - last, 60);
    last = now;
    if (motion && clock >= nextGoop) {
      const slot = goops.findIndex((goop) =>
        !goop || clock - goop.born >= goop.life,
      );
      if (slot >= 0) {
        goops[slot] = {
          born: clock,
          life: 14000 + Math.random() * 6000,
          x: 0.1 + Math.random() * 0.8,
          size: 24 + Math.random() * 28,
          rise: 0.42 + Math.random() * 0.2,
          drift: (Math.random() - 0.5) * 0.12,
          phase: Math.random() * Math.PI * 2,
        };
      }
      nextGoop = clock + 2800 + Math.random() * 2400;
    }

    const scale = Math.max(0.62, Math.min(width / 900, height / 600, 1.1));
    const depth = Math.max(26, Math.min(height * 0.065, 64));
    const amplitude = depth * 0.16;
    const time = clock * 0.001;
    const quietSurface = (x: number) =>
      height - depth +
      Math.sin((x / width) * Math.PI * 2.8 + time * 0.32) * amplitude +
      Math.sin((x / width) * Math.PI * 6.6 - time * 0.21) * amplitude * 0.45;
    const surface = (x: number) => {
      let y = quietSurface(x);
      for (const goop of goops) {
        if (!goop) continue;
        const pull = (clock - goop.born) / 4200;
        if (pull < 0 || pull >= 1) continue;
        const radius = goop.size * scale;
        const distance = (x - goop.x * width) / (radius * 1.6);
        y -= Math.sin(pull * Math.PI) * radius * 0.65 * Math.exp(-distance * distance);
      }
      return y;
    };

    // Extend the fill beyond the glass so the bottom always contains wax.
    const points = Array.from({ length: 25 }, (_, i) => {
      const x = -40 + ((width + 80) * i) / 24;
      return { x, y: surface(x) };
    });
    const n = (value: number) => value.toFixed(2);
    let path = `M${n(points[0].x)},${n(points[0].y)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)];
      const b = points[i];
      const c = points[i + 1];
      const d = points[Math.min(points.length - 1, i + 2)];
      path += `C${n(b.x + (c.x - a.x) / 6)},${n(b.y + (c.y - a.y) / 6)} ${n(c.x - (d.x - b.x) / 6)},${n(c.y - (d.y - b.y) / 6)} ${n(c.x)},${n(c.y)}`;
    }
    pool?.setAttribute("d", `${path}L${width + 40},${height + 80}L-40,${height + 80}Z`);

    shapes.forEach((shape, i) => {
      const goop = goops[i];
      const age = goop ? clock - goop.born : -1;
      if (!shape) return;
      if (!goop || age < 0 || age >= goop.life) {
        shape.setAttribute("rx", "0");
        shape.setAttribute("ry", "0");
        if (goop && age >= goop.life) goops[i] = null;
        return;
      }
      const progress = age / goop.life;
      const fullRadius = goop.size * scale;
      const tail = Math.min(1, (1 - progress) / 0.22);
      const radius = fullRadius * (0.72 + Math.min(1, age / 2200) * 0.28) * tail;
      const x = Math.max(
        fullRadius + 12,
        Math.min(
          width - fullRadius - 12,
          (goop.x + Math.sin(progress * Math.PI) * goop.drift) * width +
            Math.sin(time * 0.7 + goop.phase) * fullRadius * 0.25,
        ),
      );
      const y = quietSurface(goop.x * width) + fullRadius * 0.65 -
        progress * (height * goop.rise + fullRadius * 2);
      shape.setAttribute("cx", n(x));
      shape.setAttribute("cy", n(y));
      shape.setAttribute("rx", n(radius * (1 + Math.sin(time * 0.8 + goop.phase) * 0.16)));
      shape.setAttribute("ry", n(radius * (1.12 + Math.cos(time * 0.65 + goop.phase) * 0.18)));
    });
    host.dataset.poolGoops = String(goops.filter(Boolean).length);
  };
}
