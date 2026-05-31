/* =========================================================================
   roster.js — the FIXED set of monitored patients.

   Deterministic identities (stable ids) shared by both subsystems:
   - the medical vitals Simulator (src/simulation),
   - the behavioral/phone routine engine + SQLite seed (src/phone, src/db).

   `medical` = how the vitals Simulator should seed this patient
     ({ condition } from vitals.js, or { eventIndex } into pools.EVENTS).
   `keyContact` = the "référent" used by the behavioral key-contact rule.
   ========================================================================= */

export const ROSTER = [
  { id: 1, nom: 'Marchand', prenom: 'Élise', addr: '12 rue des Lilas', ville: 'Lyon 7e', keyContact: 'Camille (fille)', medical: { eventIndex: 0 } },
  { id: 2, nom: 'Nguyen', prenom: 'Karim', addr: '8 av. Jean Jaurès', ville: 'Villeurbanne', keyContact: 'Linh (sœur)', medical: { condition: 'desaturation' } },
  { id: 3, nom: 'Faure', prenom: 'Amina', addr: '44 cours Lafayette', ville: 'Lyon 3e', keyContact: 'Yasmine (fille)', medical: { eventIndex: 1 } },
  { id: 4, nom: 'Dubois', prenom: 'Hélène', addr: '3 imp. du Verger', ville: 'Lyon 5e', keyContact: 'Marc (fils)', medical: { condition: 'tachycardia' } },
  { id: 5, nom: 'Moreau', prenom: 'Théo', addr: '31 rue Vauban', ville: 'Lyon 6e', keyContact: 'Julie (épouse)', medical: { condition: 'fever' } },
  { id: 6, nom: 'Rossi', prenom: 'Marco', addr: '27 bd Stalingrad', ville: 'Lyon 6e', keyContact: 'Paolo (frère)', medical: { condition: 'tachycardia' } },
  { id: 7, nom: 'Lefèvre', prenom: 'Sophie', addr: '5 rue Garibaldi', ville: 'Lyon 3e', keyContact: 'Anne (voisine)', medical: { condition: 'healthy' } },
  { id: 8, nom: 'Petit', prenom: 'Jeanne', addr: '2 place Bellecour', ville: 'Lyon 2e', keyContact: 'Robert (fils)', medical: { condition: 'healthy' } },
  { id: 9, nom: 'Bernard', prenom: 'Paul', addr: '19 rue de la Paix', ville: 'Lyon 1er', keyContact: 'Sylvie (fille)', medical: { condition: 'healthy' } },
  { id: 10, nom: 'Girard', prenom: 'Léa', addr: '7 quai Claude Bernard', ville: 'Lyon 7e', keyContact: 'Thomas (fils)', medical: { condition: 'healthy' } },
];
