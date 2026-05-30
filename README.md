# Triage Patients

Appli médicale de triage : file d'attente de patients avec sévérité, alertes,
données capteurs IoT et position GPS. Le design hi-fi de départ (Claude Design)
se trouve dans [hifi/](hifi/) ; le code applicatif vit dans `frontend/` et `backend/`.

## Structure

```
frontend/   App Vite + React (la maquette convertie en vrais modules)
backend/    Mock API Node/Express (à remplacer par le vrai backend)
hifi/        Maquette d'origine (référence design, ne pas développer dessus)
API-CONTRACT.md   Contrat d'API entre front et back
```

## Démarrage

Deux terminaux :

```bash
# 1) backend (port 3001)
cd backend && npm install && npm run dev

# 2) frontend (port 5173, proxy /api → 3001)
cd frontend && npm install && npm run dev
```

Ouvrir http://localhost:5173.

> Si le backend n'est pas lancé, le front bascule automatiquement sur des
> données de démonstration (badge « hors-ligne (mock) » dans l'en-tête).

## Pour coder le backend

- Le seul point de contact front↔back est [frontend/src/api/client.js](frontend/src/api/client.js).
- Le contrat (routes + schémas JSON) est dans [API-CONTRACT.md](API-CONTRACT.md).
- [backend/server.js](backend/server.js) est un stub Express runnable qui
  implémente déjà ce contrat avec un store en mémoire. Remplace
  progressivement le store par ta vraie persistance / ingestion capteurs en
  gardant les mêmes routes.
