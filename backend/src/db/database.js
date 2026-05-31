/* =========================================================================
   database.js — SQLite (better-sqlite3) connection + schema.

   Stores the patient roster and their day-by-day phone signals, from which
   the behavioral baseline (routine) is computed. See src/phone/.
   ========================================================================= */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(here, '..', '..', 'data', 'triage.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id      INTEGER PRIMARY KEY,
    nom     TEXT NOT NULL,
    prenom  TEXT NOT NULL,
    addr    TEXT,
    ville   TEXT,
    key_contact TEXT
  );

  CREATE TABLE IF NOT EXISTS phone_days (
    patient_id        INTEGER NOT NULL,
    day               TEXT NOT NULL,        -- ISO date YYYY-MM-DD
    wake_min          INTEGER,              -- first activity, minutes since midnight
    screen_min        INTEGER,              -- total screen time (min)
    pickups           INTEGER,              -- phone unlocks
    calls_received    INTEGER,
    calls_answered    INTEGER,
    calls_missed      INTEGER,
    key_contact_missed   INTEGER,           -- 0/1
    key_contact_returned INTEGER,           -- 0/1
    last_activity_min INTEGER,              -- last interaction, minutes since midnight
    PRIMARY KEY (patient_id, day)
  );
`);

export function isEmpty() {
  return db.prepare('SELECT COUNT(*) AS n FROM patients').get().n === 0;
}
