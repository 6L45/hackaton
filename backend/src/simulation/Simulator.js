/* =========================================================================
   Simulator.js — the live data engine.

   - Seeds ~10 patients with a mix of conditions (some already in alert).
   - tick() advances the scenario clock, drifts every patient's vitals, and
     occasionally makes a stable patient deteriorate (or a treated one recover).
   - spawnAlert() injects a fresh acute event, keeping the roster capped.
   ========================================================================= */
import { Patient } from '../models/Patient.js';
import {
  NOMS, PRENOMS, VILLES, RUES, EVENTS, SEVMETA,
} from '../data/pools.js';
import { ROSTER } from '../data/roster.js';
import { CONDITION_KEYS } from './vitals.js';
import { randInt, pick, chance } from './random.js';
import { BehavioralEngine } from '../phone/engine.js';

const MAX_PATIENTS = 12;       // hard cap on the roster ("une dizaine, pas plus")
const TICK_ADVANCE_MIN = 1;    // scenario minutes added per tick

export class Simulator {
  constructor() {
    this.nowMin = 15 * 60 + 4;   // 15:04
    this.seq = 0;
    this.patients = [];
    this.behavioral = new BehavioralEngine(); // seeds the phone DB if empty
    this.seed();
  }

  // ----- seeding ----------------------------------------------------------
  seed() {
    // Deterministic roster (ids shared with the phone DB) so the medical and
    // behavioral subsystems describe the same people.
    for (const r of ROSTER) {
      const p = new Patient({
        id: r.id, nom: r.nom, prenom: r.prenom, addr: r.addr, ville: r.ville,
        condition: r.medical.condition || 'healthy',
      });
      if (r.medical.eventIndex != null) p.event = EVENTS[r.medical.eventIndex];
      // Pre-warm a few ticks so abnormal conditions reach their target band.
      for (let i = 0; i < 6; i++) p.drift();
      p.assess(this.nowMin);
      // Mark a couple of older alerts as already being handled.
      if (p.sev >= 2 && chance(0.3)) p.status = 'treating';
      p.isnew = false;
      this.patients.push(p);
    }
    this.seq = Math.max(...ROSTER.map((r) => r.id)); // spawnAlert ids continue after the roster
  }

  makePatient({ condition = 'healthy', event = null } = {}) {
    const used = new Set(this.patients.map((p) => p.nom));
    const free = NOMS.filter((n) => !used.has(n));
    const p = new Patient({
      id: ++this.seq,
      nom: pick(free.length ? free : NOMS),
      prenom: pick(PRENOMS),
      addr: `${randInt(1, 80)} ${pick(RUES)}`,
      ville: pick(VILLES),
      condition,
    });
    if (event) p.event = event;
    return p;
  }

  // ----- per-tick evolution ----------------------------------------------
  tick() {
    this.nowMin += TICK_ADVANCE_MIN;
    for (const p of this.patients) {
      p.drift();
      // Random clinical drift: a stable patient may start to deteriorate;
      // a treated one may recover back to healthy.
      if (p.condition === 'healthy' && !p.event && chance(0.02)) {
        p.condition = pick(CONDITION_KEYS.filter((c) => c !== 'healthy'));
      } else if (p.status === 'treating' && chance(0.04)) {
        p.condition = 'healthy';
        p.event = null;
      }
      p.assess(this.nowMin);
    }
    return this.patients;
  }

  // ----- actions ----------------------------------------------------------
  /** Inject a brand-new acute alert (demo button / device ingestion stand-in). */
  spawnAlert() {
    this.nowMin += 3;
    this.enforceCap();
    const event = pick(EVENTS);
    const p = this.makePatient({ event });
    for (let i = 0; i < 4; i++) p.drift();
    p.assess(this.nowMin);
    p.markNew();
    this.patients.unshift(p);
    return p;
  }

  /** Keep the roster bounded: always evict the least-urgent patient.
      Priority to drop: not-being-treated → lowest severity → oldest alert. */
  enforceCap() {
    while (this.patients.length >= MAX_PATIENTS) {
      const victim = [...this.patients].sort((a, b) =>
        (a.status === 'treating' ? 1 : 0) - (b.status === 'treating' ? 1 : 0) ||
        a.sev - b.sev ||
        (a.alertSince ?? 0) - (b.alertSince ?? 0)
      )[0];
      this.patients.splice(this.patients.indexOf(victim), 1);
    }
  }

  setStatus(id, status) {
    const p = this.find(id);
    if (p) p.status = status;
    return p;
  }

  dispatch(id) {
    return this.find(id) || null;
  }

  /** Demo: trip a behavioral anomaly on a currently-normal patient. */
  injectBehavioral() {
    return this.behavioral.injectAnomaly();
  }

  find(id) {
    return this.patients.find((p) => p.id === Number(id));
  }

  // ----- views ------------------------------------------------------------
  snapshot() {
    return {
      patients: this.patients.map((p) => ({
        ...p.toJSON(),
        behavioral: this.behavioral.behavioralFor(p.id),
      })),
      nowMin: this.nowMin,
    };
  }
}

export { SEVMETA };
