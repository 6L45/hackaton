/* =========================================================================
   vitals.js — catalogue of numeric vital signs.

   Each vital knows its normal/absolute ranges, how volatile it is, how to
   render its value, and how to assess severity (1..5) from a raw value.
   The Simulator drifts the raw numbers; the Patient model renders them.
   ========================================================================= */

export const VITALS = {
  hr: {
    key: 'hr', n: 'Fréq. cardiaque', unit: 'bpm',
    normal: [62, 88], absolute: [40, 170], volatility: 3,
    display: (v) => String(Math.round(v)),
    assess(v) {
      if (v >= 140) return { sev: 5, type: 'Tachycardie sévère' };
      if (v <= 42) return { sev: 5, type: 'Bradycardie sévère' };
      if (v >= 120) return { sev: 4, type: 'Tachycardie' };
      if (v <= 48) return { sev: 4, type: 'Bradycardie' };
      if (v >= 105) return { sev: 3, type: 'Fréq. cardiaque élevée' };
      if (v >= 95) return { sev: 2, type: 'Fréq. cardiaque limite' };
      return { sev: 1, type: null };
    },
  },

  spo2: {
    key: 'spo2', n: 'SpO₂', unit: '%',
    normal: [96, 99], absolute: [80, 100], volatility: 1,
    display: (v) => String(Math.round(v)),
    assess(v) {
      if (v < 87) return { sev: 5, type: 'SpO₂ critique' };
      if (v < 90) return { sev: 4, type: 'SpO₂ basse' };
      if (v < 93) return { sev: 3, type: 'SpO₂ basse' };
      if (v < 95) return { sev: 2, type: 'Saturation limite' };
      return { sev: 1, type: null };
    },
  },

  temp: {
    key: 'temp', n: 'Température', unit: '°C',
    normal: [36.4, 37.3], absolute: [34.5, 41], volatility: 0.12,
    display: (v) => v.toFixed(1),
    assess(v) {
      if (v >= 40 || v <= 35) return { sev: 5, type: v >= 40 ? 'Hyperthermie' : 'Hypothermie' };
      if (v >= 38.5) return { sev: 4, type: 'Hyperthermie' };
      if (v >= 38.0) return { sev: 3, type: 'Fièvre' };
      if (v >= 37.6) return { sev: 2, type: 'Température limite' };
      return { sev: 1, type: null };
    },
  },
};

export const VITAL_KEYS = Object.keys(VITALS);

/** Clinical conditions: a target band that pulls a patient's vital off-normal. */
export const CONDITIONS = {
  healthy: null,
  tachycardia: { vital: 'hr', target: [118, 145] },
  bradycardia: { vital: 'hr', target: [44, 52] },
  desaturation: { vital: 'spo2', target: [84, 92] },
  fever: { vital: 'temp', target: [38.2, 39.4] },
};

export const CONDITION_KEYS = Object.keys(CONDITIONS);
