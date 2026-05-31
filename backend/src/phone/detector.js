/* =========================================================================
   detector.js — turn observed phone history + today into a behavioral verdict.

   Rebuilds the routine baseline (mean/std) from history ONLY, then measures how
   far "today" deviates (one-sided z-score per signal). Adds two rule-based
   flags: key-contact missed & not returned, and prolonged inactivity.
   Returns the `behavioral` object the frontend shows, or null when nothing's off.
   ========================================================================= */
import { baseline, deviationZ } from './stats.js';
import { SIGNALS, WATCH_Z, ALERT_Z, INACTIVITY_ALERT_MIN, hhmm } from './signals.js';

const answerRateOf = (d) => (d.callsReceived > 0 ? d.callsAnswered / d.callsReceived : null);
const valueOf = (d, key) => (key === 'answerRate' ? answerRateOf(d) : d[key]);

const MESSAGE = 'Il y a peut-être quelque chose qui ne va pas.';

/**
 * @param {object[]} history  past days (camelCase fields), the routine
 * @param {object}   today    today's day so far
 * @param {object}   ctx      { nowMin, keyContact }
 */
export function detect(history, today, ctx = {}) {
  const reasons = [];
  let maxZ = 0;

  // --- statistical signals ----------------------------------------------
  for (const sig of SIGNALS) {
    const series = history.map((d) => valueOf(d, sig.key)).filter((v) => v != null);
    const todayVal = valueOf(today, sig.key);
    if (series.length < 4 || todayVal == null) continue;

    const base = baseline(series, sig.floor);
    const z = deviationZ(todayVal, base, sig.direction);
    const delta = sig.direction === 'low' ? base.mean - todayVal : todayVal - base.mean;
    if (z >= WATCH_Z && delta >= sig.minDelta) {
      maxZ = Math.max(maxZ, z);
      reasons.push({
        key: sig.key,
        label: sig.label,
        detail: sig.reason(z),
        today: sig.fmt(todayVal),
        usual: sig.fmt(base.mean),
        z: Math.round(z * 10) / 10,
      });
    }
  }

  // --- rule: key contact missed & not returned --------------------------
  if (today.keyContactMissed && !today.keyContactReturned) {
    reasons.push({
      key: 'keyContact',
      label: 'Contact référent non rappelé',
      detail: `appel manqué de ${ctx.keyContact || 'son contact référent'}, non rappelé aujourd'hui`,
      today: ctx.keyContact || 'manqué',
      usual: 'rappel < 2 h',
      z: null,
    });
    maxZ = Math.max(maxZ, WATCH_Z);
  }

  // --- rule: prolonged inactivity ---------------------------------------
  if (ctx.nowMin != null && today.lastActivityMin != null) {
    const gap = ctx.nowMin - today.lastActivityMin;
    if (gap >= INACTIVITY_ALERT_MIN) {
      reasons.push({
        key: 'inactivity',
        label: 'Inactivité prolongée',
        detail: `aucune activité téléphone depuis ${Math.floor(gap / 60)} h ${String(gap % 60).padStart(2, '0')}`,
        today: hhmm(today.lastActivityMin),
        usual: 'usage régulier',
        z: null,
      });
      maxZ = Math.max(maxZ, ALERT_Z); // inactivity is treated as a strong signal
    }
  }

  if (reasons.length === 0) return null;

  const level = maxZ >= ALERT_Z || reasons.length >= 2 ? 'alert' : 'watch';
  return {
    level,
    message: MESSAGE,
    score: Math.round(maxZ * 10) / 10,
    reasons,
  };
}
