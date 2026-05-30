# Contrat d'API — Triage Patients

Le frontend ne parle au backend qu'à travers [frontend/src/api/client.js](frontend/src/api/client.js).
Tant que le backend respecte les routes et les formats ci-dessous, l'UI fonctionne.
Toutes les routes sont préfixées par `/api`.

## Objet `Patient`

```jsonc
{
  "id": 1,                          // number, identifiant unique
  "nom": "Marchand",                // string
  "prenom": "Élise",                // string
  "initials": "ÉM",                 // string (optionnel)
  "addr": "12 rue des Lilas",       // string, adresse
  "ville": "Lyon 7e",               // string
  "sev": 5,                         // number 1..5 (5 = Critique … 1 = Stable)
  "type": "Chute détectée",         // string, libellé du type d'alerte ("" ou "—" si aucune)
  "time": "14:32",                  // string "HH:MM" de l'alerte ("" si aucune alerte)
  "acked": false,                   // bool, alerte prise en compte
  "status": "open",                 // "open" (à traiter) | "treating" (en cours)
  "trigVital": "Accéléromètre",     // string, métrique qui a déclenché l'alerte
  "vitals": [                       // données capteurs IoT affichées dans le détail
    { "n": "Accéléromètre", "val": "Choc + immobilité", "unit": "", "trig": true },
    { "n": "Fréq. cardiaque", "val": "118", "unit": "bpm", "trig": false }
  ]
}
```

Notes :
- `sev` pilote la couleur/le tri. Échelle : `5` Critique, `4` Alerte, `3` Attention, `2` Surveillance, `1` Stable.
- Dans `vitals`, le champ avec `trig: true` est mis en avant comme « déclencheur ».
- `status` est le champ de travail. Si le backend ne l'envoie pas, le front le dérive de `acked`.

## Endpoints

| Méthode | Route                          | Body                          | Réponse                                  |
|---------|--------------------------------|-------------------------------|------------------------------------------|
| GET     | `/api/patients`                | —                             | `{ "patients": Patient[], "nowMin": n }` |
| GET     | `/api/patients/:id`            | —                             | `Patient`                                |
| PATCH   | `/api/patients/:id/status`     | `{ "status": "open\|treating" }` | `Patient` (mis à jour)                |
| POST    | `/api/patients/:id/dispatch`   | `{ "force": false }`          | `{ "ok": true, "patientId": n }`         |
| POST    | `/api/simulate/alert`          | —                             | `Patient` (nouvelle alerte, démo)        |
| GET     | `/api/health`                  | —                             | `{ "ok": true }`                         |

- `nowMin` = « maintenant » en minutes depuis minuit, sert à calculer les temps relatifs (« il y a 12 min »). Avec un vrai backend, renvoyer l'heure courante.
- `dispatch` = envoyer une équipe ; `force: true` quand une équipe est déjà en route et qu'on confirme un nouvel envoi.
- `simulate/alert` est un utilitaire de démo (bouton « Simuler une alerte »). En prod, les nouvelles alertes proviennent de l'ingestion des capteurs.

## Temps réel (à venir)

Le front fait actuellement un **polling** toutes les 4 s sur `GET /api/patients`.
Pour du vrai temps réel, exposer plus tard un flux **SSE** (`GET /api/stream`) ou un **WebSocket** émettant les nouveaux patients / changements de statut — il suffira d'adapter `frontend/src/store.js`.
