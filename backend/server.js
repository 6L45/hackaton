/* =========================================================================
   server.js — mock triage API (Express, in-memory).

   This is a runnable stub that implements the contract in API-CONTRACT.md.
   Replace the in-memory `db` with your real persistence + device ingestion;
   keep the routes/response shapes so the frontend keeps working.
   ========================================================================= */
import express from 'express';
import { SEED_PATIENTS, ALERT_POOL, SEED_NOW_MIN } from './seed.js';

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

// --- in-memory state (the "database") -----------------------------------
const db = {
  patients: SEED_PATIENTS.map((p) => ({ ...p, status: p.acked ? 'treating' : 'open' })),
  nowMin: SEED_NOW_MIN,
  seq: 100,
};

const findPatient = (id) => db.patients.find((p) => p.id === Number(id));

// --- routes -------------------------------------------------------------

// GET /api/patients → full queue + reference clock
app.get('/api/patients', (_req, res) => {
  res.json({ patients: db.patients, nowMin: db.nowMin });
});

// GET /api/patients/:id → single patient
app.get('/api/patients/:id', (req, res) => {
  const p = findPatient(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(p);
});

// PATCH /api/patients/:id/status → { status: 'open' | 'treating' }
app.patch('/api/patients/:id/status', (req, res) => {
  const p = findPatient(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const { status } = req.body || {};
  if (!['open', 'treating'].includes(status)) {
    return res.status(400).json({ error: 'invalid_status' });
  }
  p.status = status;
  p.acked = status === 'treating';
  res.json(p);
});

// POST /api/patients/:id/dispatch → record that a team was sent
app.post('/api/patients/:id/dispatch', (req, res) => {
  const p = findPatient(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const { force = false } = req.body || {};
  // TODO(backend): actually trigger the dispatch workflow.
  console.log(`[dispatch] patient=${p.id} ${p.nom} force=${force}`);
  res.json({ ok: true, patientId: p.id, force });
});

// POST /api/simulate/alert → fabricate a new incoming critical alert (demo)
app.post('/api/simulate/alert', (_req, res) => {
  db.nowMin += 3;
  const tpl = ALERT_POOL[db.seq % ALERT_POOL.length];
  const id = ++db.seq;
  const hh = String(Math.floor(db.nowMin / 60)).padStart(2, '0');
  const mm = String(db.nowMin % 60).padStart(2, '0');
  const patient = {
    id, ...tpl, sev: 5, time: `${hh}:${mm}`, status: 'open', acked: false, isnew: true,
    trigVital: tpl.trig,
    vitals: [
      { n: tpl.trig, val: 'Seuil franchi', unit: '', trig: true },
      { n: 'Fréq. cardiaque', val: '124', unit: 'bpm' },
      { n: 'SpO₂', val: '88', unit: '%' },
    ],
  };
  delete patient.trig;
  db.patients.unshift(patient);
  setTimeout(() => { const p = findPatient(id); if (p) p.isnew = false; }, 7500);
  res.status(201).json(patient);
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Triage mock API → http://localhost:${PORT}/api`);
});
