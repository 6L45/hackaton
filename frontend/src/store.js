/* =========================================================================
   store.js — triage state + the bridge to the backend.

   Strategy: try the real API first. If the backend is unreachable, fall back
   to the bundled mock data so the UI stays usable while the backend is being
   built. `state.online` reflects which mode we're in.

   Status model: patient.status = 'open' (à traiter) | 'treating' (en cours)
   ========================================================================= */
import { useSyncExternalStore } from 'react';
import * as api from './api/client.js';
import { PATIENTS as MOCK_PATIENTS, NOW_MIN } from './mockData.js';

const POLL_MS = 4000;

const Store = {
  state: { patients: [], nowMin: NOW_MIN, online: false, loading: true },
  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  getState() {
    return this.state;
  },
  _set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  },

  // ----- loading -----------------------------------------------------------
  async refresh() {
    try {
      const data = await api.getPatients();
      this._set({
        patients: data.patients.map(withStatus),
        nowMin: data.nowMin ?? this.state.nowMin,
        online: true,
        loading: false,
      });
    } catch {
      // Backend offline → mock fallback (only seed once).
      if (!this.state.online && this.state.patients.length === 0) {
        this._set({ patients: MOCK_PATIENTS.map(withStatus), online: false, loading: false });
      } else {
        this._set({ online: false, loading: false });
      }
    }
  },

  start() {
    if (this._timer) return;
    this.refresh();
    this._timer = setInterval(() => this.refresh(), POLL_MS);
  },
  stop() {
    clearInterval(this._timer);
    this._timer = null;
  },

  // ----- actions -----------------------------------------------------------
  async setStatus(id, status) {
    this._patch(id, { status }); // optimistic
    if (this.state.online) {
      try {
        await api.setPatientStatus(id, status);
      } catch {
        this.refresh();
      }
    }
  },

  async dispatch(id, opts) {
    if (this.state.online) {
      try {
        await api.dispatchTeam(id, opts);
      } catch {
        /* surface later if needed */
      }
    }
  },

  async injectAlert() {
    if (this.state.online) {
      try {
        await api.simulateAlert();
        await this.refresh();
        return;
      } catch {
        /* fall through to local mock injection */
      }
    }
    this._injectLocal();
  },

  // ----- helpers -----------------------------------------------------------
  _patch(id, patch) {
    this._set({
      patients: this.state.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  },

  _seq: 100,
  _pool: [
    { nom: 'Lambert', prenom: 'Yves', addr: '9 rue Sully', ville: 'Lyon 6e', type: 'Chute détectée', trig: 'Accéléromètre' },
    { nom: 'Caron', prenom: 'Nadia', addr: '14 rue Bossuet', ville: 'Lyon 6e', type: 'SpO₂ basse', trig: 'SpO₂' },
    { nom: 'Roux', prenom: 'Denis', addr: "5 rue d'Alsace", ville: 'Villeurbanne', type: 'Bradycardie', trig: 'Fréq. cardiaque' },
  ],
  _injectLocal() {
    const nowMin = this.state.nowMin + 3;
    const tpl = this._pool[this._seq % this._pool.length];
    const id = ++this._seq;
    const hh = String(Math.floor(nowMin / 60)).padStart(2, '0');
    const mm = String(nowMin % 60).padStart(2, '0');
    const patient = {
      id, ...tpl, sev: 5, time: `${hh}:${mm}`, status: 'open', isnew: true, trigVital: tpl.trig,
      vitals: [
        { n: tpl.trig, val: 'Seuil franchi', unit: '', trig: true },
        { n: 'Fréq. cardiaque', val: '124', unit: 'bpm' },
        { n: 'SpO₂', val: '88', unit: '%' },
      ],
    };
    this._set({ nowMin, patients: [patient, ...this.state.patients] });
    setTimeout(() => this._patch(id, { isnew: false }), 7500);
  },
};

// Derive the working `status` from the backend `acked` flag if not provided.
function withStatus(p) {
  if (p.status) return p;
  return { ...p, status: p.acked ? 'treating' : 'open' };
}

export const TriageStore = Store;

// React binding
export function useTriage() {
  return useSyncExternalStore(
    (cb) => Store.subscribe(cb),
    () => Store.getState()
  );
}
