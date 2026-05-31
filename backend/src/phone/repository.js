/* =========================================================================
   repository.js — read/write phone_days & patients in SQLite.
   ========================================================================= */
import { db } from '../db/database.js';

const insertPatientStmt = db.prepare(
  `INSERT OR REPLACE INTO patients (id, nom, prenom, addr, ville, key_contact)
   VALUES (@id, @nom, @prenom, @addr, @ville, @keyContact)`
);

const insertDayStmt = db.prepare(
  `INSERT OR REPLACE INTO phone_days
     (patient_id, day, wake_min, screen_min, pickups,
      calls_received, calls_answered, calls_missed,
      key_contact_missed, key_contact_returned, last_activity_min)
   VALUES
     (@patientId, @day, @wakeMin, @screenMin, @pickups,
      @callsReceived, @callsAnswered, @callsMissed,
      @keyContactMissed, @keyContactReturned, @lastActivityMin)`
);

const historyStmt = db.prepare(
  `SELECT * FROM phone_days WHERE patient_id = ? AND day < ? ORDER BY day`
);
const dayStmt = db.prepare(
  `SELECT * FROM phone_days WHERE patient_id = ? AND day = ?`
);

const mapRow = (r) =>
  r && {
    day: r.day,
    wakeMin: r.wake_min,
    screenMin: r.screen_min,
    pickups: r.pickups,
    callsReceived: r.calls_received,
    callsAnswered: r.calls_answered,
    callsMissed: r.calls_missed,
    keyContactMissed: r.key_contact_missed,
    keyContactReturned: r.key_contact_returned,
    lastActivityMin: r.last_activity_min,
  };

export const insertPatient = (p) => insertPatientStmt.run(p);
export const insertDay = (patientId, day, d) =>
  insertDayStmt.run({ patientId, day, ...d });

export const getHistory = (patientId, today) =>
  historyStmt.all(patientId, today).map(mapRow);
export const getDay = (patientId, day) => mapRow(dayStmt.get(patientId, day));

// transaction helper for bulk seeding
export const tx = (fn) => db.transaction(fn);
