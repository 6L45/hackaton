# Triage Patients

Appli médicale de triage : file d'attente de patients avec sévérité, alertes,
données capteurs IoT et position GPS. Le design hi-fi de départ (Claude Design)
se trouve dans [hifi/](hifi/) ; le code applicatif vit dans `frontend/` et `backend/`.

## Structure

```
frontend/   App Vite + React (la maquette convertie en vrais modules)
backend/    API Node/Express + simulation (vitals IoT + routine téléphone, SQLite)
hifi/        Maquette d'origine (référence design, ne pas développer dessus)
API-CONTRACT.md   Contrat d'API entre front et back
```

## Deux sources d'alerte simulées

1. **IoT médical** — constantes vitales qui dérivent dans le temps → sévérité 1–5
   (vert→rouge). Code : `backend/src/simulation/`.
2. **Routine comportementale** — signaux téléphone (réveil, usage écran, appels manqués,
   contact référent non rappelé, inactivité). Une base SQLite garde ~30 jours d'historique
   par patient ; le détecteur compare le jour courant à la routine (z-score) et lève un
   warning « Il y a peut-être quelque chose qui ne va pas » affiché en **magenta** (source
   distincte). Code : `backend/src/phone/` + `backend/src/db/`. La DB se crée et se seed
   toute seule au 1ᵉʳ démarrage (`backend/data/triage.db`, ignorée par git).

## Démarrage

Le plus simple — un seul terminal (installe les deps au besoin, lance les deux,
Ctrl+C arrête tout) :

```bash
./start.sh
```

Ou manuellement, deux terminaux :

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
