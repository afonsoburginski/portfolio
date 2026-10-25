/** "Nice" axis ticks: 1, 2 or 5 times a power of ten, between min and max inclusive. */
export function niceTicks(min: number, max: number, target = 6): number[] {
  const span = max - min || 1;
  const raw = span / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) ticks.push(Math.round(v / step) * step);
  return ticks;
}

/** Axis range that includes the data, rounded outward to tick boundaries. */
export function niceRange(min: number, max: number, target = 5): { min: number; max: number; ticks: number[] } {
  if (min === max) { min -= 1; max += 1; }
  const ticks = niceTicks(min, max, target);
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  const lo = Math.floor(min / step + 1e-9) * step, hi = Math.ceil(max / step - 1e-9) * step;
  return { min: lo, max: hi, ticks: niceTicks(lo, hi, target) };
}

export const formatNumber = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v * 100) / 100));
