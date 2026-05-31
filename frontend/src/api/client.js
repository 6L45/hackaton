/* =========================================================================
   api/client.js — the ONLY place that talks to the backend.
   Every endpoint the Node backend must expose is listed here. See
   ../../API-CONTRACT.md for the request/response schemas.

   In dev, requests to /api are proxied to http://localhost:3001 (vite.config.js).
   ========================================================================= */

const BASE = import.meta.env.VITE_API_URL ?? '';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${options.method ?? 'GET'} ${path} → ${res.status}`);
  }
  // 204 No Content → nothing to parse
  return res.status === 204 ? null : res.json();
}

/** GET /api/patients → { patients: Patient[], nowMin: number } */
export function getPatients() {
  return req('/patients');
}

/** PATCH /api/patients/:id/status → updated Patient */
export function setPatientStatus(id, status) {
  return req(`/patients/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** POST /api/patients/:id/dispatch → { ok: true } (send a team) */
export function dispatchTeam(id, { force = false } = {}) {
  return req(`/patients/${id}/dispatch`, {
    method: 'POST',
    body: JSON.stringify({ force }),
  });
}

/** POST /api/simulate/alert → newly created Patient (demo helper) */
export function simulateAlert() {
  return req('/simulate/alert', { method: 'POST' });
}

/** POST /api/simulate/behavioral → { ok, patientId } (demo helper) */
export function simulateBehavioral() {
  return req('/simulate/behavioral', { method: 'POST' });
}
