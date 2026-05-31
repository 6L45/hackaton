/* =========================================================================
   profile.js — each patient's "normal" routine parameters.

   Derived deterministically from the patient id so every patient has a stable,
   slightly different routine (some early risers, some who answer fewer calls…).
   These are the TRUTH the daily generator samples from; the detector never sees
   them — it rebuilds the baseline purely from observed history (like real life).
   ========================================================================= */

// Tiny deterministic PRNG (mulberry32) so a given id → same routine each boot.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function profileFor(id) {
  const r = rng(id * 2654435761);
  return {
    // means / stds for the numeric routine
    wakeMin: { mean: 390 + Math.floor(r() * 90), std: 18 + r() * 10 },   // ~06:30–08:00
    screenMin: { mean: 140 + Math.floor(r() * 110), std: 22 + r() * 14 }, // ~2 h–4 h
    pickups: { mean: 45 + Math.floor(r() * 45), std: 8 + r() * 6 },       // 45–90
    // baseline call behavior
    callsPerDay: 3 + Math.floor(r() * 5),                                  // 3–7 received
    answerRate: { mean: 0.84 + r() * 0.12, std: 0.04 + r() * 0.03 },       // mostly answers
    keyContactCallProb: 0.35 + r() * 0.25,                                 // chance référent calls
    keyContactReturnProb: 0.9,                                             // normally returns it
    lastActivity: { mean: 1290 + Math.floor(r() * 90), std: 18 + r() * 10 }, // ~21:30–23:00
  };
}
