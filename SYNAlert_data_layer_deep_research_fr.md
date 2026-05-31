# Deep Research Data Layer — SYNAlert
## Data Science, Predictive Analytics et détection des signaux faibles chez les personnes âgées

**Contexte :** hackathon Silver Economy / SYNApps / SYNAlert  
**Destinataire :** partenaire responsable du Data Layer, des capteurs, de la data science et des décisions basées sur les données  
**Langue :** français  
**Positionnement :** vigilance non médicale, repérage précoce, rupture de routine, levée de doute, coordination humaine  
**Version :** v1 data research

---

## 0. Résumé exécutif

Le marché mondial du monitoring des seniors évolue clairement vers une logique de **prévention discrète** : moins de gros boutons SOS seuls, moins de solutions qui attendent un événement grave, plus de signaux faibles, plus d’analyse de routine, plus de fusion mobile + wearable + smart-home, et plus de boucles humaines : aidants, soignants, opérateurs, bénévoles vérifiés.

Pour SYNAlert, la meilleure stratégie n’est pas de construire une IA médicale. La meilleure stratégie est de construire une **couche de vigilance prédictive non médicale** :

> signaux du mobile + bracelet + smart-home + SYNApps → features simples → score de vigilance → Voice AI de levée de doute → Care Cockpit → action humaine seulement si nécessaire.

Le MVP hackathon doit rester simple, explicable et démoable.

---

# 1. Ce que le marché fait déjà

## 1.1 Smart-home / ambient monitoring

Le marché utilise de plus en plus des capteurs passifs dans l’habitat : mouvement, présence, ouverture de porte, usage de cuisine, sommeil, température, énergie, lumière, lit, salle de bain.

| Acteur / solution | Capteurs / données | Logique analytique | Inspiration pour SYNAlert |
|---|---|---|---|
| [Telegrafik / OTONO-mE](https://www.telegrafik.fr/en/) | Capteurs communicants, rythme de vie, activité, sommeil | Détection d’anomalies du rythme de vie, signes d’affaiblissement, baisse d’activité, isolement, troubles du sommeil | Très proche de notre logique : rupture de routine + vigilance |
| [Telegrafik Platform](https://www.telegrafik.fr/en/telegrafik-platform/) | Agrégation de capteurs + écosystème métier | Plateforme intelligente, prédictive, agrégative ; collecte capteurs, alertes, infos utiles aux pros | Benchmark direct pour data layer + orchestration |
| [Legrand Care](https://www.legrand.com/legrandcare/) | Maison connectée, cloud, routines, monitoring temps réel | Personnalisation, algorithmes intelligents, analyse des routines quotidiennes | Confirme que l’habitat connecté peut fournir des signaux de routine |
| [Withings Elderly Care](https://www.withings.com/us/en/health-solutions/elderly-care) | Signaux vitaux, nuit, sorties de lit | Détection précoce de détérioration, errance, risque | Très utile pour expliquer “bed / sleep / night routine” |
| [Withings Sleep Analyzer](https://www.withings.com/eu/en/sleep-analyzer) | Capteur sous-matelas | Sommeil, ronflement, fréquence cardiaque, apnée du sommeil | Exemple de capteur passif non wearable |
| [Vayyar Care](https://vayyar.com/care/) | Radar RF / 4D, sans caméra, sans wearable | Chutes, mouvements inhabituels, alertes temps réel | Bon benchmark privacy-friendly |
| [Nobi Smart Lamps](https://www.nobi.life/en_GB/product) | Lampe intelligente, vision IA | Détection de chute, réaction rapide, prévention | Benchmark visuel puissant, mais plus intrusif |
| [SafelyYou](https://www.safely-you.com/safelyyou-safety-ai/) | Vision IA en senior living | Détection et analyse des chutes, revue des événements | Puissant mais moins adapté à notre pitch CNIL/privacy |
| [OSO-AI / Orikio](https://www.orikio.com/en) | Monitoring acoustique | Chutes, appels à l’aide, détresse respiratoire, urgences | Important pour Voice/son, mais attention privacy |
| [Sensi.AI](https://www.sensi.ai/product/) | Audio care intelligence | Monitoring 24/7, insights prédictifs, alertes proactives | Benchmark pour care intelligence audio, mais à positionner avec prudence |

**Insight marché :** les meilleurs produits ne se contentent pas de détecter une chute. Ils apprennent le rythme normal et cherchent une **déviation du comportement quotidien**.

---

## 1.2 Wearables et bracelets

Les wearables apportent des signaux plus personnels : pas, activité, rythme cardiaque, sommeil, SOS, chute, absence de mouvement, port du bracelet.

| Acteur / solution | Données clés | Logique analytique | Inspiration |
|---|---|---|---|
| [CarePredict Tempo](https://www.carepredict.com/) | Wearable + ADL : manger, dormir, marcher, hygiène | Apprend le “tempo” individuel, détecte les changements de comportement | Très proche de notre narrative “routine personnelle” |
| [CarePredict Tempo article Analog Devices](https://www.analog.com/en/signals/articles/carepredict.html) | Geste, dominante main, repas, activités | Gesture recognition + daily tempo + early intervention | Très utile pour expliquer feature engineering sur ADL |
| Bracelets SOS classiques | Appui bouton, chute, absence d’activité | Post-event / urgence | Utile pour emergency bypass, moins pour prévention |
| Apple Watch / Android Wear / Fitbit | Pas, fréquence cardiaque, sommeil, activité, chute selon device | Monitoring passif + alertes | Bon pour MVP si données accessibles via HealthKit / Health Connect |

**Insight marché :** les wearables seuls ne suffisent pas. Les seniors peuvent oublier de les porter ou de les charger. Le meilleur modèle est **hybride** : wearable + mobile + smart-home.

---

## 1.3 Smartphone comme capteur

Le smartphone peut déjà fournir de nombreuses données utiles : activité dans l’app, check-in manqué, temps depuis dernière ouverture, géolocalisation approximative ou zone de vie si consentement, pas / distance / activité, mobilité / gait sur iOS, activité détectée sur Android, réponse à notifications, usage de la voix si Voice AI est intégré.

### iOS

Sources principales :

- [Apple HealthKit](https://developer.apple.com/documentation/healthkit)
- [Apple Core Motion](https://developer.apple.com/documentation/coremotion/)
- [CMPedometer](https://developer.apple.com/documentation/coremotion/cmpedometer)
- [Apple Mobility Metrics PDF](https://www.apple.com/healthcare/docs/site/Measuring_Walking_Quality_Through_iPhone_Mobility_Metrics.pdf)
- [Walking Steadiness on iPhone](https://support.apple.com/guide/iphone/monitor-your-walking-steadiness-iphff1bf03ed/ios)

Données utiles iOS :

| Donnée iOS | Source | Utilité SYNAlert |
|---|---|---|
| Steps | HealthKit / CMPedometer | baisse d’activité |
| Distance | CMPedometer | baisse mobilité |
| Floors ascended | CMPedometer | baisse effort |
| Walking speed | HealthKit Mobility | dégradation mobilité |
| Step length | HealthKit Mobility | mobilité / fragilité |
| Double support time | HealthKit Mobility | stabilité marche |
| Walking asymmetry | HealthKit Mobility | déséquilibre potentiel |
| Walking steadiness | Health app / HealthKit | signal mobilité / chute potentielle |
| App usage / check-in | app SYNApps | engagement / isolement / risque |
| Local notifications response | app | capacité à répondre / routine |

Recommandation iOS pour MVP :

1. **Ne pas commencer par raw accelerometer.**
2. Utiliser d’abord les données agrégées HealthKit / Core Motion si disponibles.
3. Priorité : steps, walking speed, step length, double support, walking steadiness, last app interaction, missed check-in.

### Android

Sources principales :

- [Health Connect](https://developer.android.com/health-and-fitness/health-connect)
- [Health Connect data types](https://developer.android.com/health-and-fitness/health-connect/data-types)
- [Activity Recognition Transition API](https://developer.android.com/develop/sensors-and-location/location/transitions)
- [DetectedActivity](https://developers.google.com/android/reference/com/google/android/gms/location/DetectedActivity)
- [Google Fit migration guide](https://developer.android.com/health-and-fitness/health-connect/migration/fit)

Important : Google recommande de migrer les usages Google Fit vers **Health Connect** ou Google Health API selon le cas ; pour un MVP mobile-first Android, Health Connect est le choix logique.

Données utiles Android :

| Donnée Android | Source | Utilité SYNAlert |
|---|---|---|
| Steps | Health Connect | activité quotidienne |
| Distance | Health Connect / apps tierces | mobilité |
| Heart rate si wearable | Health Connect | signal support, pas diagnostic |
| Sleep sessions | Health Connect | routine sommeil |
| Exercise / active calories | Health Connect | variation activité |
| Activity type | Activity Recognition API | still / walking / running / in vehicle |
| Activity transition | Activity Transition API | entrées/sorties de marche, immobilité |
| App usage / check-in | app SYNApps | engagement |
| Notification response | app | levée de doute digitale |

Recommandation Android pour MVP :

1. Utiliser **Health Connect** pour les données santé/fitness structurées.
2. Utiliser **Activity Recognition Transition API** pour détecter changement d’état : STILL, WALKING, RUNNING, IN_VEHICLE.
3. Ne pas dépendre de Google Fit direct.
4. Ajouter les données app SYNApps : check-in, dernière interaction, réponse notification.

---

# 2. Typologie des signaux à exploiter

## 2.1 Signaux mobile

| Signal | Feature brute | Feature engineering | Interprétation non médicale |
|---|---|---|---|
| Check-in manqué | pas de check-in avant heure attendue | missed_checkin_count_24h, delay_minutes | rupture de routine |
| Baisse d’usage app | dernière ouverture | hours_since_last_open | possible désengagement |
| Pas / distance | steps daily | % vs baseline 7 jours / 30 jours | baisse d’activité |
| Réponse notification | notification envoyée, réponse ou non | response_delay, no_response_count | besoin levée de doute |
| Géozone consentie | sortie domicile / quartier | no_exit_days, unusual_exit_time | isolement ou routine changée |
| Appels Voice AI | answered / not answered | call_answered, call_result | levée de doute |

## 2.2 Signaux wearable / bracelet

| Signal | Feature brute | Feature engineering | Interprétation |
|---|---|---|---|
| Appui SOS | event | emergency_bypass = true | urgence ou besoin explicite |
| Pas / activité | steps, movement | drop_vs_baseline | baisse activité |
| Inactivité | no motion | inactive_duration | rupture de routine |
| Sommeil | sleep duration / wake time | late_wakeup, fragmented_sleep | vigilance |
| Fréquence cardiaque si dispo | HR / resting HR | deviation_vs_baseline | signal secondaire |
| Port du bracelet | worn / not worn | not_worn_duration | fiabilité capteur faible |

## 2.3 Signaux smart-home

| Signal smart-home | Exemple | Feature engineering | Interprétation non médicale |
|---|---|---|---|
| Mouvement | capteur présence salon | no_motion_morning, motion_count_delta | routine cassée |
| Cuisine | prise bouilloire / frigo / lumière cuisine | kitchen_inactive_morning | repas potentiellement manqué |
| Lumière | lumière non allumée | no_light_after_wakeup_window | journée non commencée |
| Porte | porte non ouverte | no_door_open_24h | isolement / absence sortie |
| Lit | pression lit / sommeil | bed_exit_missing, late_bed_exit | routine sommeil perturbée |
| Température | froid / chaleur | unsafe_temperature | risque environnemental |
| Fumée | smoke alarm | emergency_bypass | urgence directe |
| Énergie | consommation faible/anormale | power_usage_drop | routine anormale |

## 2.4 Signaux SYNApps / care circle

| Signal | Feature engineering | Utilité |
|---|---|---|
| Pas de message depuis X jours | silence_duration | isolement social |
| Agenda non confirmé | missed_appointment_response | fragilité organisationnelle |
| Aidant surcharge | tasks_per_aidant_week | prévention burnout aidant |
| Historique fausses alertes | false_alert_rate | calibration modèle |
| Feedback visite | resolved / escalated / false alarm | apprentissage boucle fermée |
| Activités locales non consultées | engagement_drop | isolement / désengagement |

---

# 3. Modèles et méthodes Data Science

## 3.1 Méthode 1 — Baseline individuelle + règles explicables

C’est la meilleure méthode pour le hackathon.

### Principe

On apprend la routine normale de Jeanne : heure moyenne du lever, nombre moyen de pas, usage cuisine le matin, ouverture de l’application, temps de réponse habituel, fréquence de sortie du domicile, interactions sociales.

Ensuite, on détecte les écarts.

### Features simples

```text
steps_today_vs_7d_avg
motion_morning_vs_baseline
kitchen_activity_missing
missed_checkin
hours_since_last_app_open
call_answered
voice_check_result
door_open_count_vs_baseline
sleep_end_time_delay
```

### Score simple

```text
score = 0

if missed_checkin: score += 20
if no_motion_morning: score += 25
if kitchen_activity_missing: score += 15
if steps_drop_over_50_percent: score += 20
if voice_call_not_answered: score += 25
if previous_day_fatigue_declared: score += 10

Green: 0-20
Yellow: 21-40
Orange: 41-70
Red: >70 or emergency bypass
```

### Avantages

- très rapide à coder ;
- très explicable ;
- bon pour pitch ;
- facile à montrer ;
- éthique : pas de boîte noire ;
- compatible CNIL / consentement.

### Limites

- pas vraiment “machine learning” ;
- dépend de règles ;
- nécessite calibration.

### Recommandation

**À faire absolument pour le MVP.**

---

## 3.2 Méthode 2 — Z-score / EWMA / CUSUM sur routine

### Principe

On compare chaque signal au comportement habituel :

```text
z = (valeur_du_jour - moyenne_baseline) / écart_type_baseline
```

Ou on utilise EWMA pour lisser :

```text
ewma_today = alpha * value_today + (1-alpha) * ewma_yesterday
```

CUSUM aide à détecter des dérives progressives.

### Bon usage

- baisse progressive des pas ;
- lever de plus en plus tardif ;
- moins de cuisine ;
- moins de sorties ;
- plus de non-réponses.

### Avantages

- simple ;
- robuste ;
- explicable ;
- bon pour signaux faibles.

### Recommandation

**Très bon complément au score de règles.**

---

## 3.3 Méthode 3 — Isolation Forest / One-Class SVM

### Principe

On apprend les journées normales, puis on détecte les journées inhabituelles.

### Features

```text
steps
motion_count
kitchen_events
door_events
app_opens
checkin_delay
notification_response_delay
sleep_duration
voice_call_answered
```

### Avantages

- pas besoin de labels “danger / pas danger” ;
- utile quand on a seulement données normales ;
- bon pour anomaly detection.

### Limites

- moins explicable que règles ;
- besoin de données historiques ;
- peut générer faux positifs.

### Recommandation

**Bon pour une version “tech demo”, mais pas comme seul moteur.**

---

## 3.4 Méthode 4 — Classification supervisée : Logistic Regression / Random Forest / XGBoost

### Principe

Si on a des labels : false alert, resolved, family notified, volunteer visit, escalation nurse, emergency, on peut entraîner un modèle de classification.

### Avantages

- puissant ;
- améliore les décisions avec feedback ;
- bon après pilote.

### Limites

- nécessite données annotées ;
- attention biais ;
- expliquer la décision devient plus difficile.

### Recommandation

**Pas pour le hackathon core. À présenter comme roadmap.**

---

## 3.5 Méthode 5 — LSTM / Autoencoder / Forecasting séries temporelles

### Principe

Prédire la prochaine activité ou journée, puis détecter l’écart entre attendu et observé.

Exemples : LSTM prédit séquence d’ADL ; autoencoder reconstruit journée normale ; si erreur de reconstruction élevée → anomalie.

### Avantages

- très avancé ;
- utile pour grandes séries temporelles ;
- intéressant pour roadmap.

### Limites

- trop lourd pour hackathon ;
- données insuffisantes ;
- difficile à expliquer à CCI / CNIL ;
- risque boîte noire.

### Recommandation

**À mentionner seulement comme futur, pas à coder maintenant.**

---

# 4. Architecture data recommandée pour SYNAlert

## 4.1 Pipeline simple

```text
1. Event ingestion
   mobile, bracelet, smart-home, SYNApps

2. Feature builder
   transforme les événements en features quotidiennes / horaires

3. Baseline builder
   calcule la routine normale individuelle

4. Risk scorer
   règles + z-score + optional anomaly model

5. Explanation card
   explique pourquoi Yellow / Orange / Red

6. Orchestration decision
   no action / Voice AI / Care Cockpit / volunteer / nurse / emergency

7. Feedback loop
   false alert / resolved / confirmed risk / escalated

8. Model calibration
   ajuste seuils et règles
```

## 4.2 Exemple de JSON d’événement

```json
{
  "person_id": "jeanne_83",
  "timestamp": "2026-05-31T09:42:00+02:00",
  "source": "smart_home",
  "event_type": "no_motion_morning",
  "value": true,
  "confidence": 0.91,
  "privacy_level": "non_medical",
  "raw_payload_stored": false
}
```

## 4.3 Exemple de features agrégées

```json
{
  "person_id": "jeanne_83",
  "date": "2026-05-31",
  "missed_checkin": true,
  "hours_since_last_app_open": 18,
  "steps_vs_baseline_pct": -62,
  "motion_morning_vs_baseline_pct": -80,
  "kitchen_activity_missing": true,
  "door_open_count_vs_baseline_pct": -100,
  "bracelet_sos_pressed": false,
  "smoke_alarm": false,
  "voice_call_answered": null
}
```

## 4.4 Exemple de décision

```json
{
  "risk_level": "orange",
  "risk_score": 68,
  "explanation": [
    "Check-in du matin manqué",
    "Activité domicile très inférieure à la routine",
    "Pas d'activité cuisine détectée",
    "Pas de signal SOS explicite"
  ],
  "next_action": "voice_ai_check",
  "emergency_bypass": false
}
```

---

# 5. Data iOS vs Android : recommandation pratique

## 5.1 iOS : ce qu’il faut prendre

| Priorité | Donnée | API / source | Pourquoi |
|---|---|---|---|
| 1 | Steps | HealthKit / CMPedometer | facile, utile, explicable |
| 2 | Walking speed | HealthKit Mobility | indicateur mobilité |
| 3 | Step length | HealthKit Mobility | mobilité / démarche |
| 4 | Double support time | HealthKit Mobility | stabilité |
| 5 | Walking steadiness | Health app / HealthKit selon accès | risque mobilité |
| 6 | App check-in | SYNApps | signal fort |
| 7 | Notification response | app | levée de doute digitale |
| 8 | Geofence consentie | Core Location | isolement / sortie quartier |

### MVP iOS recommandé

- steps ;
- walking speed ;
- step length ;
- last app interaction ;
- missed check-in ;
- notification response.

Ne pas commencer avec : raw accelerometer, raw gyroscope, microphone passif, biométrie vocale.

## 5.2 Android : ce qu’il faut prendre

| Priorité | Donnée | API / source | Pourquoi |
|---|---|---|---|
| 1 | Steps | Health Connect | standard Android moderne |
| 2 | Sleep | Health Connect si dispo | routine sommeil |
| 3 | Heart rate | Health Connect si wearable | signal secondaire |
| 4 | Activity transitions | Activity Recognition API | still / walking / running |
| 5 | App check-in | SYNApps | signal très direct |
| 6 | Notification response | app | levée de doute |
| 7 | Geofence consentie | Location APIs | routine sortie |

### MVP Android recommandé

- Health Connect steps ;
- Activity Recognition STILL/WALKING ;
- last app open ;
- missed check-in ;
- optional sleep if wearable available ;
- optional heart rate if wearable available.

Ne pas utiliser Google Fit direct pour nouveau développement, car Google recommande la migration vers Health Connect / Google Health API.

---

# 6. Les 4 meilleurs MVP à vibe-coder

## MVP 1 — Routine Disruption Score

### Idée

Détecter si la journée de Jeanne ne ressemble pas à sa routine normale.

### Data

- app check-in ;
- steps ;
- last app open ;
- smart-home motion ;
- kitchen activity ;
- door events.

### Modèle

- baseline 7 jours / 30 jours ;
- règles ;
- z-score ;
- score Green/Yellow/Orange/Red.

### Output

```text
Orange: check-in manqué + mouvement faible + cuisine inactive.
Action recommandée: Voice AI check.
```

### Pourquoi c’est le meilleur

- très facile à coder ;
- très visuel ;
- très aligné avec signaux faibles ;
- pas médical ;
- parfait pour pitch.

## MVP 2 — Voice AI Trigger Engine

### Idée

Ne pas envoyer humain tout de suite. Utiliser data layer pour décider quand déclencher un appel Voice AI.

### Data

- risk_score ;
- missed_checkin ;
- inactivity ;
- previous alerts ;
- no emergency bypass.

### Modèle

- règles d’orchestration ;
- decision tree simple.

### Output

```text
Si Yellow léger → notification.
Si Orange → Voice AI call.
Si Red ou emergency → bypass humain.
```

### Pourquoi c’est fort

- connecte data + Voice AI ;
- réduit charge nurses / volunteers ;
- montre l’intelligence de décision.

## MVP 3 — Mobility Decline Signal

### Idée

Repérer une baisse progressive de mobilité, sans diagnostic.

### Data iOS

- steps ;
- walking speed ;
- step length ;
- double support time ;
- walking steadiness.

### Data Android

- steps ;
- activity transitions ;
- sleep / activity si dispo ;
- wearable heart rate si dispo.

### Modèle

- moyenne mobile 7 jours ;
- trend slope ;
- z-score ;
- seuils simples.

### Output

```text
Yellow: baisse mobilité 3 jours consécutifs.
Action: check-in doux ou Voice AI.
```

### Pourquoi c’est utile

- très crédible pour elderly care ;
- proche prévention chute ;
- mais à formuler sans diagnostic.

## MVP 4 — Smart-Home Meal / Hydration Routine Risk

### Idée

Détecter un risque de routine alimentaire perturbée via cuisine.

### Data

- prise bouilloire / micro-ondes / frigo ;
- lumière cuisine ;
- mouvement cuisine ;
- check-in “j’ai mangé” ;
- voice response.

### Modèle

- règle simple : pas d’activité cuisine dans fenêtre habituelle ;
- baseline horaire ;
- confirmation Voice AI.

### Output

```text
Yellow/Orange: aucune activité cuisine ce matin + check-in manqué.
Action: Voice AI demande si Jeanne a mangé / bu.
```

### Pourquoi c’est fort

- très concret ;
- facile à comprendre ;
- lié à dénutrition / hydratation sans faire diagnostic.

---

# 7. Ce que je recommande vraiment pour le hackathon

## Faire 1 core demo, pas 4 produits

Le meilleur demo flow :

```text
Jeanne → signaux faibles → Routine Disruption Score → Voice AI Trigger → Care Cockpit → SYNAlert volunteer → feedback
```

## Algorithme recommandé

### Version hackathon

```text
Rule-based scoring + baseline + explanation card
```

### Version si temps

```text
Isolation Forest sur features journalières simulées
```

### Version roadmap

```text
Supervised model avec labels terrain + feedback boucle fermée
```

---

# 8. Feature engineering concret pour la démo

## Features immédiates

```text
missed_checkin
hours_since_last_app_open
steps_today
steps_vs_7d_avg
motion_morning_count
motion_vs_baseline
kitchen_activity_missing
door_not_opened
bracelet_sos_pressed
smoke_alarm
voice_call_answered
voice_call_result
previous_false_alert_rate
```

## Score hackathon proposé

```text
risk_score = 0

if missed_checkin:
    risk_score += 20

if hours_since_last_app_open > 12:
    risk_score += 10

if steps_vs_7d_avg < -50%:
    risk_score += 15

if motion_vs_baseline < -70%:
    risk_score += 20

if kitchen_activity_missing:
    risk_score += 15

if door_not_opened:
    risk_score += 10

if previous_day_fatigue_declared:
    risk_score += 10

if voice_call_answered == false:
    risk_score += 20

if voice_call_result == "needs_help":
    risk_score += 30

if bracelet_sos_pressed or smoke_alarm:
    emergency_bypass = true
```

## Niveaux

```text
0-20: Green
21-40: Yellow
41-70: Orange
71+: Red

Emergency bypass:
SOS bracelet / smoke / explicit emergency → Red direct
```

---

# 9. Ce qu’il faut éviter

Ne pas dire : diagnostic, prédire une maladie, biomarqueurs vocaux, surveillance, monitoring médical, détection de démence, décision automatique de soin, remplacement des soignants.

Dire plutôt : signaux faibles, rupture de routine, vigilance non médicale, repérage précoce, levée de doute, aide à la décision, coordination humaine, human-in-the-loop, proportionnalité, consentement, privacy-by-design.

---

# 10. Slide recommandée pour le partenaire Data

## Titre

**Data Layer: transformer des signaux quotidiens en vigilance préventive**

## Visuel

Pipeline :

```text
Mobile + Bracelet + Smart-home + SYNApps
        ↓
Feature engineering
        ↓
Baseline individuelle
        ↓
Score Green / Yellow / Orange / Red
        ↓
Voice AI / Care Cockpit / SYNAlert
        ↓
Feedback terrain
        ↓
Modèle amélioré
```

## Bullets

- Fusion des signaux faibles : mobile, bracelet, smart-home.
- Baseline individuelle : on compare Jeanne à sa propre routine, pas à une moyenne générale.
- Modèle simple et explicable : règles + z-score + score de vigilance.
- Aucun diagnostic : seulement rupture de routine et levée de doute.
- Boucle fermée : chaque appel ou visite améliore les futures alertes.

---

# 11. Sources et liens utiles

## Documentation plateformes

- [Apple HealthKit](https://developer.apple.com/documentation/healthkit)
- [Apple Core Motion](https://developer.apple.com/documentation/coremotion/)
- [Apple CMPedometer](https://developer.apple.com/documentation/coremotion/cmpedometer)
- [Apple Mobility Metrics PDF](https://www.apple.com/healthcare/docs/site/Measuring_Walking_Quality_Through_iPhone_Mobility_Metrics.pdf)
- [Apple Walking Steadiness](https://support.apple.com/guide/iphone/monitor-your-walking-steadiness-iphff1bf03ed/ios)
- [Android Health Connect](https://developer.android.com/health-and-fitness/health-connect)
- [Android Health Connect Data Types](https://developer.android.com/health-and-fitness/health-connect/data-types)
- [Android Activity Recognition Transition API](https://developer.android.com/develop/sensors-and-location/location/transitions)
- [Google Fit Migration Guide](https://developer.android.com/health-and-fitness/health-connect/migration/fit)

## Marché et benchmarks

- [Telegrafik](https://www.telegrafik.fr/en/)
- [Telegrafik Platform](https://www.telegrafik.fr/en/telegrafik-platform/)
- [Legrand Care](https://www.legrand.com/legrandcare/)
- [Withings Elderly Care](https://www.withings.com/us/en/health-solutions/elderly-care)
- [CarePredict](https://www.carepredict.com/)
- [CarePredict Tempo / Analog Devices](https://www.analog.com/en/signals/articles/carepredict.html)
- [Vayyar Care](https://vayyar.com/care/)
- [SafelyYou](https://www.safely-you.com/safelyyou-safety-ai/)
- [Nobi Smart Lamps](https://www.nobi.life/en_GB/product)
- [Sensi.AI](https://www.sensi.ai/product/)
- [OSO-AI / Orikio](https://www.orikio.com/en)
- [CNIL Silver Economy Sandbox](https://www.cnil.fr/fr/bac-a-sable-silver-economie-la-cnil-accompagne-6-projets-innovants)

## Research papers / reviews

- [Smart home-assisted anomaly detection system for older adults](https://pmc.ncbi.nlm.nih.gov/articles/PMC12106144/)
- [Indoor abnormal behavior detection for the elderly: review](https://www.mdpi.com/1424-8220/25/11/3313)
- [Fall detection in elderly people: systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12609574/)
- [Smart Healthcare at Home: AI-enabled monitoring review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12526596/)
- [Wearable, Environmental, and Smartphone-Based Passive Sensing](https://openaccess.city.ac.uk/id/eprint/26555/1/fdgth-03-662811.pdf)
- [Identifying fall risk predictors by monitoring daily activities at home](https://perso.unifr.ch/jean-pierre.bresciani/publications/Dubois21.pdf)

---

# 12. Conclusion

Pour le partenaire Data, la ligne à tenir est simple :

> Nous ne faisons pas de diagnostic médical.  
> Nous construisons un data layer de vigilance, explicable, basé sur les routines individuelles, pour déclencher la bonne levée de doute et éviter les escalades inutiles.

Le meilleur choix hackathon :

1. Routine Disruption Score.
2. Voice AI Trigger Engine.
3. Care Cockpit explanation card.
4. Feedback loop.

C’est faisable, démontrable, crédible, et directement aligné avec SYNAlert.
