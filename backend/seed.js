/* =========================================================================
   seed.js — initial patient/alert data for the mock backend.
   This is the backend's source of truth (in memory). Swap for a real DB
   + device-ingestion pipeline when you build the real service.
   ========================================================================= */

export const SEVMETA = {
  5: { key: 'critique', label: 'Critique', code: 'CRIT' },
  4: { key: 'alerte', label: 'Alerte', code: 'ALRT' },
  3: { key: 'attention', label: 'Attention', code: 'ATTN' },
  2: { key: 'surveillance', label: 'Surveillance', code: 'SURV' },
  1: { key: 'stable', label: 'Stable', code: 'STBL' },
};

const v = (n, val, unit = '', trig = false) => ({ n, val, unit, trig });

export const SEED_PATIENTS = [
  { id: 1, nom: 'Marchand', prenom: 'Élise', initials: 'ÉM', addr: '12 rue des Lilas', ville: 'Lyon 7e',
    sev: 5, type: 'Chute détectée', time: '14:32', acked: false, trigVital: 'Accéléromètre',
    vitals: [v('Accéléromètre', 'Choc + immobilité', '', true), v('Fréq. cardiaque', '118', 'bpm'), v('SpO₂', '93', '%'), v('Capteur de lit', 'Hors du lit', '')] },
  { id: 2, nom: 'Nguyen', prenom: 'Karim', initials: 'KN', addr: '8 av. Jean Jaurès', ville: 'Villeurbanne',
    sev: 5, type: 'SpO₂ basse', time: '14:48', acked: false, trigVital: 'SpO₂',
    vitals: [v('SpO₂', '86', '%', true), v('Fréq. cardiaque', '107', 'bpm'), v('Fréq. respiratoire', '24', '/min'), v('Température', '37.4', '°C')] },
  { id: 3, nom: 'Faure', prenom: 'Amina', initials: 'AF', addr: '44 cours Lafayette', ville: 'Lyon 3e',
    sev: 4, type: 'Absence de mouvement', time: '14:20', acked: true, trigVital: 'Détecteur présence',
    vitals: [v('Détecteur présence', 'Aucun mvt · 45 min', '', true), v('Fréq. cardiaque', '72', 'bpm'), v('Ouverture porte', 'Fermée', '')] },
  { id: 4, nom: 'Dubois', prenom: 'Hélène', initials: 'HD', addr: '3 imp. du Verger', ville: 'Lyon 5e',
    sev: 4, type: 'Tachycardie', time: '14:05', acked: false, trigVital: 'Fréq. cardiaque',
    vitals: [v('Fréq. cardiaque', '141', 'bpm', true), v('SpO₂', '96', '%'), v('Tension', '148/92', ''), v('Activité', 'Repos', '')] },
  { id: 5, nom: 'Moreau', prenom: 'Théo', initials: 'TM', addr: '31 rue Vauban', ville: 'Lyon 6e',
    sev: 3, type: 'Température 38.6°', time: '13:55', acked: false, trigVital: 'Température',
    vitals: [v('Température', '38.6', '°C', true), v('Fréq. cardiaque', '96', 'bpm'), v('SpO₂', '97', '%')] },
  { id: 6, nom: 'Rossi', prenom: 'Marco', initials: 'MR', addr: '27 bd Stalingrad', ville: 'Lyon 6e',
    sev: 3, type: 'Tension élevée', time: '13:40', acked: true, trigVital: 'Tension',
    vitals: [v('Tension', '166/98', '', true), v('Fréq. cardiaque', '88', 'bpm'), v('SpO₂', '98', '%')] },
  { id: 7, nom: 'Lefèvre', prenom: 'Sophie', initials: 'SL', addr: '5 rue Garibaldi', ville: 'Lyon 3e',
    sev: 2, type: 'Glycémie limite', time: '12:10', acked: false, trigVital: 'Glycémie',
    vitals: [v('Glycémie', '0.62', 'g/L', true), v('Fréq. cardiaque', '79', 'bpm'), v('Activité', 'Marche', '')] },
  { id: 8, nom: 'Petit', prenom: 'Jeanne', initials: 'JP', addr: '2 place Bellecour', ville: 'Lyon 2e',
    sev: 2, type: 'Saturation limite', time: '11:30', acked: true, trigVital: 'SpO₂',
    vitals: [v('SpO₂', '94', '%', true), v('Fréq. cardiaque', '81', 'bpm'), v('Température', '36.9', '°C')] },
  { id: 9, nom: 'Bernard', prenom: 'Paul', initials: 'PB', addr: '19 rue de la Paix', ville: 'Lyon 1er',
    sev: 1, type: '—', time: '', acked: false, trigVital: '',
    vitals: [v('Fréq. cardiaque', '68', 'bpm'), v('SpO₂', '98', '%'), v('Température', '36.6', '°C')] },
  { id: 10, nom: 'Girard', prenom: 'Léa', initials: 'LG', addr: '7 quai Claude Bernard', ville: 'Lyon 7e',
    sev: 1, type: '—', time: '', acked: false, trigVital: '',
    vitals: [v('Fréq. cardiaque', '71', 'bpm'), v('SpO₂', '99', '%'), v('Activité', 'Marche', '')] },
];

// Pool used by POST /api/simulate/alert to fabricate a new incoming alert.
export const ALERT_POOL = [
  { nom: 'Lambert', prenom: 'Yves', addr: '9 rue Sully', ville: 'Lyon 6e', type: 'Chute détectée', trig: 'Accéléromètre' },
  { nom: 'Caron', prenom: 'Nadia', addr: '14 rue Bossuet', ville: 'Lyon 6e', type: 'SpO₂ basse', trig: 'SpO₂' },
  { nom: 'Roux', prenom: 'Denis', addr: "5 rue d'Alsace", ville: 'Villeurbanne', type: 'Bradycardie', trig: 'Fréq. cardiaque' },
];

// Scenario "now" in minutes-since-midnight (15:04).
export const SEED_NOW_MIN = 15 * 60 + 4;
