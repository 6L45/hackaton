/* =========================================================================
   time.js — relative-time helpers for alert timestamps ("HH:MM").
   `nowMin` is the reference "now" in minutes-since-midnight; the store keeps
   it in sync (scenario clock for the mock, real clock with a live backend).
   ========================================================================= */

export function timeToMin(t) {
  if (!t) return -1;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function relTime(t, nowMin) {
  if (!t) return '—';
  const d = nowMin - timeToMin(t);
  if (d < 1) return "à l'instant";
  if (d < 60) return `il y a ${d} min`;
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `il y a ${h} h${m ? ' ' + m : ''}`;
}

export function relShort(t, nowMin) {
  if (!t) return '—';
  const d = nowMin - timeToMin(t);
  if (d < 60) return `+${d}m`;
  return `+${Math.floor(d / 60)}h${(d % 60).toString().padStart(2, '0')}`;
}
