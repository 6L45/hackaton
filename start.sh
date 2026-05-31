#!/usr/bin/env bash
# =============================================================================
# start.sh — lance le backend (API + simulation) et le frontend (Vite) ensemble.
# Installe les dépendances au besoin. Ctrl+C arrête les deux proprement.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- dépendances (install seulement si manquantes) ---------------------------
if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "→ Installation des dépendances backend…"
  (cd "$ROOT/backend" && npm install)
fi
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "→ Installation des dépendances frontend…"
  (cd "$ROOT/frontend" && npm install)
fi

# --- arrêt propre des deux process à la sortie -------------------------------
pids=()
cleanup() {
  echo
  echo "→ Arrêt des serveurs…"
  kill "${pids[@]}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- lancement ----------------------------------------------------------------
echo "→ Backend  : http://localhost:3001/api"
(cd "$ROOT/backend" && npm run dev) &
pids+=($!)

echo "→ Frontend : http://localhost:5173"
(cd "$ROOT/frontend" && npm run dev) &
pids+=($!)

echo "→ Prêt. Ctrl+C pour tout arrêter."
wait
