/**
 * One shared clock for the hero scan so the WebGL sweep and the HTML micro-labels stay in sync.
 * Returns the scan position 0 (top) → 1 (bottom) while a sweep is running, or -1 between sweeps.
 */
export const SCAN_PERIOD = 7.5; // seconds between sweeps
export const SCAN_DURATION = 2.6; // seconds a sweep takes
export const SCAN_OFFSET = 1.6; // first sweep shortly after the reveal

export function scanAt(t: number) {
  const local = (t - SCAN_OFFSET) % SCAN_PERIOD;
  if (t < SCAN_OFFSET || local > SCAN_DURATION) return -1;
  const p = local / SCAN_DURATION;
  // ease-in-out so the line decelerates at the edges
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}
