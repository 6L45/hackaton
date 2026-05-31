/* =========================================================================
   signals.js — catalogue of behavioral signals derived from phone usage.

   Numeric signals are scored by z-score vs the patient's routine (baseline).
   `direction` says which way is abnormal: 'high' = worrying when far ABOVE
   the usual value (e.g. waking up much later), 'low' = worrying when far
   BELOW (e.g. screen time / answer rate collapse). `floor` is a sensible
   minimum std so a very regular routine doesn't make tiny deltas explode.
   ========================================================================= */

const hhmm = (min) => {
  const h = Math.floor((min % 1440) / 60);
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
const dur = (min) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h${m ? ' ' + m : ''}` : `${m} min`;
};

// `minDelta` = the smallest deviation (in the signal's own unit) we bother to
// flag, so a statistically-large but practically-tiny wobble never trips.
export const SIGNALS = [
  {
    key: 'wakeMin', label: 'Réveil tardif', column: 'wake_min',
    direction: 'high', floor: 10, minDelta: 75,
    fmt: hhmm,
    reason: (z) => `réveil ${z >= 4 ? 'très ' : ''}plus tard que d'habitude`,
  },
  {
    key: 'screenMin', label: 'Usage écran en chute', column: 'screen_min',
    direction: 'low', floor: 12, minDelta: 45,
    fmt: dur,
    reason: () => `temps d'écran bien plus faible que d'habitude`,
  },
  {
    key: 'pickups', label: 'Peu de prises en main', column: 'pickups',
    direction: 'low', floor: 5, minDelta: 18,
    fmt: (n) => `${Math.round(n)}`,
    reason: () => `téléphone beaucoup moins consulté que d'habitude`,
  },
  {
    key: 'answerRate', label: 'Appels manqués inhabituels', column: null, // derived
    direction: 'low', floor: 0.05, minDelta: 0.3,
    fmt: (r) => `${Math.round(r * 100)} %`,
    reason: () => `taux de réponse aux appels en forte baisse`,
  },
];

export const SIGNAL_BY_KEY = Object.fromEntries(SIGNALS.map((s) => [s.key, s]));

// z-score thresholds (deliberately conservative so a normal day rarely flags)
export const WATCH_Z = 3.0;
export const ALERT_Z = 4.0;

// Prolonged inactivity: no phone interaction for this many minutes (during the
// day) is itself a red flag, independent of the statistical baseline.
export const INACTIVITY_ALERT_MIN = 180;

export { hhmm, dur };
