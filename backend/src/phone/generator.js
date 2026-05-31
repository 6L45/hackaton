/* =========================================================================
   generator.js — fabricate a day of phone signals for a patient.

   A "normal" day samples each signal from the patient's routine profile.
   Passing deviation kinds pushes the relevant signals out of band, to simulate
   a day where something is off (and trip the detector).
   ========================================================================= */
import { clamp } from '../simulation/random.js';

const gauss = (m, s) => {
  // Box–Muller
  const u = Math.random() || 1e-9;
  const v = Math.random();
  return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const DEVIATIONS = ['late_wake', 'low_usage', 'missed_calls', 'inactive', 'key_contact'];

export function generateDay(profile, deviations = [], opts = {}) {
  const has = (d) => deviations.includes(d);

  let wakeMin = Math.round(gauss(profile.wakeMin.mean, profile.wakeMin.std));
  let screenMin = Math.max(20, Math.round(gauss(profile.screenMin.mean, profile.screenMin.std)));
  let pickups = Math.max(5, Math.round(gauss(profile.pickups.mean, profile.pickups.std)));

  let received = Math.max(0, Math.round(gauss(profile.callsPerDay, 1.5)));
  let answerRate = clamp(gauss(profile.answerRate.mean, profile.answerRate.std), 0, 1);

  const calledByContact = Math.random() < profile.keyContactCallProb;
  let keyMissed = calledByContact && Math.random() < 0.35 ? 1 : 0;
  let keyReturned = keyMissed ? (Math.random() < profile.keyContactReturnProb ? 1 : 0) : 1;

  // For a partial "today" (opts.now given), the last interaction is recent;
  // for a completed historical day it's somewhere in the evening.
  let lastActivityMin = opts.now != null
    ? Math.round(opts.now - (3 + Math.random() * 22))
    : Math.round(gauss(profile.lastActivity.mean, profile.lastActivity.std));

  // ---- apply deviations -------------------------------------------------
  if (has('late_wake')) wakeMin = Math.round(profile.wakeMin.mean + 200 + Math.random() * 130);
  if (has('low_usage')) {
    screenMin = Math.round(profile.screenMin.mean * (0.18 + Math.random() * 0.17));
    pickups = Math.round(profile.pickups.mean * (0.18 + Math.random() * 0.17));
  }
  if (has('missed_calls')) {
    received = 6 + Math.round(Math.random() * 4);
    answerRate = 0.1 + Math.random() * 0.15;
  }
  if (has('inactive')) lastActivityMin = Math.round(540 + Math.random() * 150); // ~09:00–11:30
  if (has('key_contact')) { keyMissed = 1; keyReturned = 0; }

  const answered = Math.min(received, Math.round(received * answerRate));
  const missed = received - answered;

  return {
    wakeMin,
    screenMin,
    pickups,
    callsReceived: received,
    callsAnswered: answered,
    callsMissed: missed,
    keyContactMissed: keyMissed,
    keyContactReturned: keyReturned,
    lastActivityMin,
  };
}
