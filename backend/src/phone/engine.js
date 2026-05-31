/* =========================================================================
   engine.js — behavioral subsystem facade.

   On boot: seed the SQLite DB (roster + ~30 days of routine history + today)
   if empty. Exposes:
     - behavioralFor(id) → the `behavioral` verdict for a patient (or null)
     - injectAnomaly()   → make a currently-normal patient deviate today (demo)
   ========================================================================= */
import { ROSTER } from '../data/roster.js';
import { isEmpty } from '../db/database.js';
import { profileFor } from './profile.js';
import { generateDay } from './generator.js';
import { detect } from './detector.js';
import { insertPatient, insertDay, getHistory, getDay, tx } from './repository.js';

const HISTORY_DAYS = 30;
// Behavioral "today" is evaluated at a fixed reference time (15:04) so the
// inactivity rule is stable across a demo session (independent of the vitals clock).
const REFERENCE_NOW = 15 * 60 + 4;

const isoDay = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export class BehavioralEngine {
  // A couple of patients start the day already deviating, to showcase the alert.
  static TODAYS_DEVIATIONS = {
    7: ['late_wake', 'low_usage'], // → alert
    8: ['key_contact', 'inactive'], // → alert
    9: ['missed_calls'],            // → watch
  };

  constructor() {
    this.today = isoDay(0);
    this.contacts = Object.fromEntries(ROSTER.map((p) => [p.id, p.keyContact]));
    if (isEmpty()) this.seed();
    else this.ensureToday(); // DB persisted from a previous (earlier) day → make sure "today" exists
  }

  seed() {
    tx(() => {
      for (const p of ROSTER) {
        insertPatient(p);
        const profile = profileFor(p.id);
        for (let k = HISTORY_DAYS; k >= 1; k--) {
          insertDay(p.id, isoDay(-k), generateDay(profile));
        }
        const dev = BehavioralEngine.TODAYS_DEVIATIONS[p.id] || [];
        insertDay(p.id, this.today, generateDay(profile, dev, { now: REFERENCE_NOW }));
      }
    })();
    console.log(`[phone] seeded ${ROSTER.length} patients × ${HISTORY_DAYS + 1} days`);
  }

  /** Ensure each roster patient has a row for `today` (handles a date rollover
      between runs, where the persisted DB only holds older days). */
  ensureToday() {
    const missing = ROSTER.filter((p) => !getDay(p.id, this.today));
    if (!missing.length) return;
    tx(() => {
      for (const p of missing) {
        const dev = BehavioralEngine.TODAYS_DEVIATIONS[p.id] || [];
        insertDay(p.id, this.today, generateDay(profileFor(p.id), dev, { now: REFERENCE_NOW }));
      }
    })();
    console.log(`[phone] generated today's row for ${missing.length} patients`);
  }

  behavioralFor(id) {
    const today = getDay(id, this.today);
    if (!today) return null; // patient has no phone history (e.g. spawned alert)
    const history = getHistory(id, this.today);
    return detect(history, today, { nowMin: REFERENCE_NOW, keyContact: this.contacts[id] });
  }

  /** Demo: force a currently-normal patient into a deviating day. Returns the id. */
  injectAnomaly() {
    const normal = ROSTER.map((p) => p.id).filter((id) => !this.behavioralFor(id));
    const id = normal.length ? normal[Math.floor(Math.random() * normal.length)] : ROSTER[0].id;
    const dev = [['late_wake', 'low_usage'], ['missed_calls', 'inactive'], ['key_contact']][
      Math.floor(Math.random() * 3)
    ];
    insertDay(id, this.today, generateDay(profileFor(id), dev, { now: REFERENCE_NOW }));
    return id;
  }
}
