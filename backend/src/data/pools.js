/* =========================================================================
   pools.js — static reference data used to fabricate patients.
   ========================================================================= */

export const SEVMETA = {
  5: { key: 'critique', label: 'Critique', code: 'CRIT' },
  4: { key: 'alerte', label: 'Alerte', code: 'ALRT' },
  3: { key: 'attention', label: 'Attention', code: 'ATTN' },
  2: { key: 'surveillance', label: 'Surveillance', code: 'SURV' },
  1: { key: 'stable', label: 'Stable', code: 'STBL' },
};

export const NOMS = [
  'Marchand', 'Nguyen', 'Faure', 'Dubois', 'Moreau', 'Rossi', 'Lefèvre',
  'Petit', 'Bernard', 'Girard', 'Lambert', 'Caron', 'Roux', 'Fontaine',
  'Garnier', 'Bonnet', 'Henry', 'Masson', 'Dumas', 'Olivier',
];

export const PRENOMS = [
  'Élise', 'Karim', 'Amina', 'Hélène', 'Théo', 'Marco', 'Sophie', 'Jeanne',
  'Paul', 'Léa', 'Yves', 'Nadia', 'Denis', 'Claire', 'Hugo', 'Inès',
];

export const VILLES = [
  'Lyon 1er', 'Lyon 2e', 'Lyon 3e', 'Lyon 5e', 'Lyon 6e', 'Lyon 7e', 'Villeurbanne',
];

export const RUES = [
  'rue des Lilas', 'av. Jean Jaurès', 'cours Lafayette', 'imp. du Verger',
  'rue Vauban', 'bd Stalingrad', 'rue Garibaldi', 'place Bellecour',
  'rue de la Paix', 'quai Claude Bernard', 'rue Sully', 'rue Bossuet',
];

/* Acute, discrete events (not numeric drift) — used by spawnAlert and to give
   some seeded patients a non-vital trigger. Each carries its own sev + vital. */
export const EVENTS = [
  {
    type: 'Chute détectée', sev: 5, trig: 'Accéléromètre',
    vital: { n: 'Accéléromètre', val: 'Choc + immobilité', unit: '' },
    extra: { n: 'Capteur de lit', val: 'Hors du lit', unit: '' },
  },
  {
    type: 'Absence de mouvement', sev: 4, trig: 'Détecteur présence',
    vital: { n: 'Détecteur présence', val: 'Aucun mvt · 45 min', unit: '' },
    extra: { n: 'Ouverture porte', val: 'Fermée', unit: '' },
  },
];
