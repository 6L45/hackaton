/* =========================================================================
   data.js — scenario data for the triage table (hi-fi)
   Backend plug points are marked « ⟵ backend ». Replace the static arrays
   below with the live payload; the UI reads these fields and nothing else.
   ========================================================================= */

// Virtual "now" for the scenario (relative timestamps computed from this).
const NOW_MIN = 15 * 60 + 4; // 15:04

const SEVMETA = {
  5: { key: 'critique',     label: 'Critique',     code: 'CRIT' },
  4: { key: 'alerte',       label: 'Alerte',       code: 'ALRT' },
  3: { key: 'attention',    label: 'Attention',    code: 'ATTN' },
  2: { key: 'surveillance', label: 'Surveillance', code: 'SURV' },
  1: { key: 'stable',       label: 'Stable',       code: 'STBL' },
};

// helper: tiny trend generator (for sparkline slot) ⟵ backend: real series
function trend(seed, n, lo, hi, drift) {
  const out = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    const base = lo + (hi - lo) * (0.5 + drift * (i / n));
    out.push(Math.max(lo, Math.min(hi, base + (r - 0.5) * (hi - lo) * 0.5)));
  }
  return out;
}

function v(n, val, unit, trig) { return { n, val, unit: unit || '', trig: !!trig }; }

/* Each patient object — fields consumed by the UI:
   id, nom, prenom, addr, ville, sev (1..5), type, time "HH:MM",
   acked (bool ⟵ backend), trigVital (label of the metric that fired),
   trend (number[] for the sparkline), gps {lat-ish placeholder}, vitals[]   */
const PATIENTS = [
  { id: 1, nom: 'Marchand', prenom: 'Élise', initials: 'ÉM', addr: '12 rue des Lilas', ville: 'Lyon 7e',
    sev: 5, type: 'Chute détectée', time: '14:32', acked: false, trigVital: 'Accéléromètre',
    trend: trend(11, 24, 60, 130, 0.7),
    vitals: [v('Accéléromètre', 'Choc + immobilité', '', 1), v('Fréq. cardiaque', '118', 'bpm'), v('SpO₂', '93', '%'), v('Capteur de lit', 'Hors du lit', '')] },
  { id: 2, nom: 'Nguyen', prenom: 'Karim', initials: 'KN', addr: '8 av. Jean Jaurès', ville: 'Villeurbanne',
    sev: 5, type: 'SpO₂ basse', time: '14:48', acked: false, trigVital: 'SpO₂',
    trend: trend(7, 24, 84, 99, -0.8),
    vitals: [v('SpO₂', '86', '%', 1), v('Fréq. cardiaque', '107', 'bpm'), v('Fréq. respiratoire', '24', '/min'), v('Température', '37.4', '°C')] },
  { id: 3, nom: 'Faure', prenom: 'Amina', initials: 'AF', addr: '44 cours Lafayette', ville: 'Lyon 3e',
    sev: 4, type: 'Absence de mouvement', time: '14:20', acked: true, trigVital: 'Détecteur présence',
    trend: trend(3, 24, 0, 5, -0.9),
    vitals: [v('Détecteur présence', 'Aucun mvt · 45 min', '', 1), v('Fréq. cardiaque', '72', 'bpm'), v('Ouverture porte', 'Fermée', '')] },
  { id: 4, nom: 'Dubois', prenom: 'Hélène', initials: 'HD', addr: '3 imp. du Verger', ville: 'Lyon 5e',
    sev: 4, type: 'Tachycardie', time: '14:05', acked: false, trigVital: 'Fréq. cardiaque',
    trend: trend(19, 24, 90, 145, 0.9),
    vitals: [v('Fréq. cardiaque', '141', 'bpm', 1), v('SpO₂', '96', '%'), v('Tension', '148/92', ''), v('Activité', 'Repos', '')] },
  { id: 5, nom: 'Moreau', prenom: 'Théo', initials: 'TM', addr: '31 rue Vauban', ville: 'Lyon 6e',
    sev: 3, type: 'Température 38.6°', time: '13:55', acked: false, trigVital: 'Température',
    trend: trend(5, 24, 37, 39, 0.8),
    vitals: [v('Température', '38.6', '°C', 1), v('Fréq. cardiaque', '96', 'bpm'), v('SpO₂', '97', '%')] },
  { id: 6, nom: 'Rossi', prenom: 'Marco', initials: 'MR', addr: '27 bd Stalingrad', ville: 'Lyon 6e',
    sev: 3, type: 'Tension élevée', time: '13:40', acked: true, trigVital: 'Tension',
    trend: trend(13, 24, 130, 170, 0.6),
    vitals: [v('Tension', '166/98', '', 1), v('Fréq. cardiaque', '88', 'bpm'), v('SpO₂', '98', '%')] },
  { id: 7, nom: 'Lefèvre', prenom: 'Sophie', initials: 'SL', addr: '5 rue Garibaldi', ville: 'Lyon 3e',
    sev: 2, type: 'Glycémie limite', time: '12:10', acked: false, trigVital: 'Glycémie',
    trend: trend(2, 24, 60, 95, -0.5),
    vitals: [v('Glycémie', '0.62', 'g/L', 1), v('Fréq. cardiaque', '79', 'bpm'), v('Activité', 'Marche', '')] },
  { id: 8, nom: 'Petit', prenom: 'Jeanne', initials: 'JP', addr: '2 place Bellecour', ville: 'Lyon 2e',
    sev: 2, type: 'Saturation limite', time: '11:30', acked: true, trigVital: 'SpO₂',
    trend: trend(23, 24, 93, 99, -0.3),
    vitals: [v('SpO₂', '94', '%', 1), v('Fréq. cardiaque', '81', 'bpm'), v('Température', '36.9', '°C')] },
  { id: 9, nom: 'Bernard', prenom: 'Paul', initials: 'PB', addr: '19 rue de la Paix', ville: 'Lyon 1er',
    sev: 1, type: '—', time: '', acked: false, trigVital: '',
    trend: trend(31, 24, 64, 74, 0),
    vitals: [v('Fréq. cardiaque', '68', 'bpm'), v('SpO₂', '98', '%'), v('Température', '36.6', '°C')] },
  { id: 10, nom: 'Girard', prenom: 'Léa', initials: 'LG', addr: '7 quai Claude Bernard', ville: 'Lyon 7e',
    sev: 1, type: '—', time: '', acked: false, trigVital: '',
    trend: trend(29, 24, 66, 76, 0),
    vitals: [v('Fréq. cardiaque', '71', 'bpm'), v('SpO₂', '99', '%'), v('Activité', 'Marche', '')] },
];

// Distinct alert types present (for the type filter) ⟵ backend: enum
const ALERT_TYPES = Array.from(new Set(PATIENTS.filter(p => p.time).map(p => p.type)));

function timeToMin(t) { if (!t) return -1; const [h, m] = t.split(':').map(Number); return h * 60 + m; }

function relTime(t) {
  if (!t) return '—';
  const d = NOW_MIN - timeToMin(t);
  if (d < 1) return "à l'instant";
  if (d < 60) return `il y a ${d} min`;
  const h = Math.floor(d / 60), m = d % 60;
  return `il y a ${h} h${m ? ' ' + m : ''}`;
}
function relShort(t) {
  if (!t) return '—';
  const d = NOW_MIN - timeToMin(t);
  if (d < 60) return `+${d}m`;
  return `+${Math.floor(d / 60)}h${(d % 60).toString().padStart(2, '0')}`;
}

window.TRIAGE_DATA = { PATIENTS, SEVMETA, ALERT_TYPES, timeToMin, relTime, relShort, NOW_MIN };
