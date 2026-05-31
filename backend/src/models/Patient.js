/* =========================================================================
   Patient.js — domain model for a monitored patient.

   Holds RAW numeric vital values + a clinical condition. The Simulator drifts
   the raw numbers each tick; `assess()` recomputes severity, and `toJSON()`
   renders the object exactly as the frontend contract expects
   (see API-CONTRACT.md).
   ========================================================================= */
import { VITALS, CONDITIONS } from '../simulation/vitals.js';
import { clamp, randFloat } from '../simulation/random.js';

const minToHHMM = (min) => {
  const h = String(Math.floor((min % 1440) / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const initialsOf = (prenom, nom) => (prenom[0] || '') + (nom[0] || '');

export class Patient {
  constructor({ id, nom, prenom, addr, ville, condition = 'healthy' }) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.addr = addr;
    this.ville = ville;

    this.condition = condition;
    this.status = 'open';          // 'open' | 'treating'
    this.event = null;             // discrete acute event (chute, etc.) or null
    this.alertSince = null;        // minutes-since-midnight when alert was raised
    this.isnew = false;

    // Seed raw numeric vitals from each vital's normal range.
    this.raw = {};
    for (const key of Object.keys(VITALS)) {
      const [lo, hi] = VITALS[key].normal;
      this.raw[key] = randFloat(lo, hi);
    }
    // Computed fields (filled by assess()).
    this.sev = 1;
    this.type = '—';
    this.trigVital = '';
  }

  /** Random-walk every vital one step, pulled toward its condition target. */
  drift() {
    const cond = CONDITIONS[this.condition];
    for (const key of Object.keys(VITALS)) {
      const meta = VITALS[key];
      const [aLo, aHi] = meta.absolute;
      // Pull target: the condition's band for the affected vital, else normal.
      let target;
      if (cond && cond.vital === key) {
        target = (cond.target[0] + cond.target[1]) / 2;
      } else {
        target = (meta.normal[0] + meta.normal[1]) / 2;
      }
      const pull = (target - this.raw[key]) * 0.15;
      const wobble = (Math.random() - 0.5) * meta.volatility;
      this.raw[key] = clamp(this.raw[key] + pull + wobble, aLo, aHi);
    }
  }

  /** Recompute sev/type/trigVital from current raw vitals (+ any event). */
  assess(nowMin) {
    let worst = { sev: 1, type: null, key: null };

    if (this.event) {
      worst = { sev: this.event.sev, type: this.event.type, key: 'event' };
    }
    for (const key of Object.keys(VITALS)) {
      const r = VITALS[key].assess(this.raw[key]);
      if (r.sev > worst.sev) worst = { ...r, key };
    }

    const prevSev = this.sev;
    this.sev = worst.sev;
    this.type = worst.type || '—';
    this.trigVital = worst.key === 'event' ? this.event.trig : (worst.key ? VITALS[worst.key].n : '');

    // Manage the alert timestamp: stamp it when crossing into alert territory,
    // clear it when the patient returns to stable.
    if (this.sev >= 2 && prevSev < 2) {
      this.alertSince = nowMin;
      if (this.sev >= 4) this.markNew();
    } else if (this.sev < 2) {
      this.alertSince = null;
    }
    return this;
  }

  markNew() {
    this.isnew = true;
    clearTimeout(this._newTimer);
    this._newTimer = setTimeout(() => { this.isnew = false; }, 7500);
  }

  /** Serialize to the exact shape the frontend consumes. */
  toJSON() {
    const trigKey = this.trigVital;
    const vitals = [];

    // Event vital(s) first, flagged as the trigger.
    if (this.event) {
      vitals.push({ ...this.event.vital, trig: true });
      if (this.event.extra) vitals.push({ ...this.event.extra, trig: false });
    }
    for (const key of Object.keys(VITALS)) {
      const meta = VITALS[key];
      vitals.push({
        n: meta.n,
        val: meta.display(this.raw[key]),
        unit: meta.unit,
        trig: !this.event && meta.n === trigKey,
      });
    }

    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      initials: initialsOf(this.prenom, this.nom),
      addr: this.addr,
      ville: this.ville,
      sev: this.sev,
      type: this.type,
      time: this.alertSince != null ? minToHHMM(this.alertSince) : '',
      acked: this.status === 'treating',
      status: this.status,
      trigVital: this.trigVital,
      isnew: this.isnew,
      vitals,
    };
  }
}
