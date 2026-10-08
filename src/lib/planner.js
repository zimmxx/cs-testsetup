export const plannerDefaults = {
  units: 4, diesPerWafer: 20, sites: 12, sweeps: 2, conditions: 1,
  acquisition: 'continuous', startNm: 1520, endNm: 1625, stepNm: 0.1, sweepSpeed: 10,
  dwellMs: 20, settleMs: 10, overhead: 3,
  setupMinutes: 20, loadMinutes: 3, alignmentSeconds: 45,
  referenceSeconds: 60, postMinutes: 10, marginPercent: 20,
};

export function estimateTime(values, { spectral = true, wafer = false } = {}) {
  const errors = {};
  const v = {};
  for (const key of Object.keys(plannerDefaults)) {
    if (key === 'acquisition') continue;
    const raw = values[key];
    v[key] = Number(raw);
    if (raw === '' || raw === null || raw === undefined || !Number.isFinite(v[key]) || v[key] < 0 || v[key] > 1e9) errors[key] = 'Enter a finite, non-negative value (maximum 1 billion).';
  }
  for (const key of ['units', ...(wafer ? ['diesPerWafer'] : []), 'sites', 'sweeps', 'conditions']) {
    if (!Number.isInteger(v[key]) || v[key] < 1) errors[key] = 'Enter a whole number of at least 1.';
  }
  if (spectral) {
    if (v.endNm <= v.startNm) errors.endNm = 'End wavelength must be greater than start.';
    if (values.acquisition === 'continuous' && v.sweepSpeed <= 0) errors.sweepSpeed = 'Sweep speed must be greater than zero.';
    if (values.acquisition === 'stepped' && v.stepNm <= 0) errors.stepNm = 'Wavelength step must be greater than zero.';
    if (!['continuous', 'stepped'].includes(values.acquisition)) errors.acquisition = 'Select an acquisition model.';
  } else if (v.dwellMs <= 0) errors.dwellMs = 'Acquisition duration must be greater than zero.';
  if (Object.keys(errors).length) return { errors, valid: false };
  const points = spectral && values.acquisition === 'stepped' ? Math.floor((v.endNm - v.startNm) / v.stepNm + 1e-8) + 1 : null;
  const scanSeconds = spectral ? (values.acquisition === 'continuous' ? (v.endNm - v.startNm) / v.sweepSpeed : points * (v.dwellMs + v.settleMs) / 1000) : v.dwellMs / 1000;
  const devices = v.units * (wafer ? v.diesPerWafer : 1) * v.sites;
  const scans = devices * v.sweeps * v.conditions;
  const parts = [
    { label: 'Setup & checks', seconds: v.setupMinutes * 60, color: '#8175df' },
    { label: 'Loading & references', seconds: v.units * (v.loadMinutes * 60 + v.referenceSeconds), color: '#b4abea' },
    { label: 'Alignment', seconds: devices * v.alignmentSeconds, color: '#e1c451' },
    { label: 'Acquisition', seconds: scans * (scanSeconds + v.overhead), color: '#5b50c9' },
    { label: 'Post-processing', seconds: v.postMinutes * 60, color: '#9dabc1' },
  ];
  const base = parts.reduce((sum, p) => sum + p.seconds, 0);
  const contingency = base * v.marginPercent / 100;
  const total = base + contingency;
  if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER || !Number.isSafeInteger(scans)) return { valid: false, errors: { units: 'This job is too large to calculate accurately. Reduce the counts or durations.' } };
  return { valid: true, errors: {}, devices, scans, points, scanSeconds, parts, base, contingency, total };
}

export function formatDuration(seconds) {
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
