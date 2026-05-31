/* =========================================================================
   random.js — small random helpers used across the simulation.
   ========================================================================= */

export const randInt = (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1));

export const randFloat = (lo, hi) => lo + Math.random() * (hi - lo);

/** Pick a random element from an array. */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** true with probability p (0..1). */
export const chance = (p) => Math.random() < p;

/** Roughly-normal noise in [-1, 1] (sum of uniforms). */
export const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
