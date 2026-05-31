/* =========================================================================
   stats.js — tiny statistics helpers for the behavioral baseline.
   ========================================================================= */

export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function std(xs, floor = 1e-6) {
  if (xs.length < 2) return floor;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.max(Math.sqrt(v), floor);
}

/** Mean + std-deviation (floored to avoid divide-by-~0 on flat routines). */
export function baseline(xs, floor) {
  return { mean: mean(xs), std: std(xs, floor) };
}

/** Deviation in the "bad" direction, in standard deviations (>=0 = abnormal). */
export function deviationZ(today, base, direction) {
  const raw = (today - base.mean) / base.std;
  return direction === 'low' ? -raw : raw; // 'high' bad above, 'low' bad below
}
