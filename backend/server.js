/* =========================================================================
   server.js — HTTP layer for the triage API (Express).

   All domain logic lives in src/simulation; this file only maps routes to
   the Simulator and ticks it on a timer so the frontend sees live data.
   Contract: see ../API-CONTRACT.md
   ========================================================================= */
import express from 'express';
import { Simulator } from './src/simulation/Simulator.js';

const PORT = process.env.PORT || 3001;
const TICK_MS = 5000; // how often vitals drift / alerts may evolve

const sim = new Simulator();
setInterval(() => sim.tick(), TICK_MS);

const app = express();
app.use(express.json());

// GET /api/patients → full queue + reference clock
app.get('/api/patients', (_req, res) => {
  res.json(sim.snapshot());
});

// GET /api/patients/:id → single patient
app.get('/api/patients/:id', (req, res) => {
  const p = sim.find(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(p.toJSON());
});

// PATCH /api/patients/:id/status → { status: 'open' | 'treating' }
app.patch('/api/patients/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!['open', 'treating'].includes(status)) {
    return res.status(400).json({ error: 'invalid_status' });
  }
  const p = sim.setStatus(req.params.id, status);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(p.toJSON());
});

// POST /api/patients/:id/dispatch → record that a team was sent
app.post('/api/patients/:id/dispatch', (req, res) => {
  const p = sim.dispatch(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  const { force = false } = req.body || {};
  console.log(`[dispatch] patient=${p.id} ${p.nom} force=${force}`);
  res.json({ ok: true, patientId: p.id, force });
});

// POST /api/simulate/alert → inject a fresh acute alert (demo)
app.post('/api/simulate/alert', (_req, res) => {
  const p = sim.spawnAlert();
  res.status(201).json(p.toJSON());
});

// POST /api/simulate/behavioral → trip a behavioral routine anomaly (demo)
app.post('/api/simulate/behavioral', (_req, res) => {
  const id = sim.injectBehavioral();
  res.status(201).json({ ok: true, patientId: id });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Triage simulation API → http://localhost:${PORT}/api  (tick ${TICK_MS}ms)`);
});
