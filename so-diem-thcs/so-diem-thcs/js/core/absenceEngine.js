import { ABSENCE_TYPES, ABSENCE_THRESHOLDS, unitOf } from '../config/absence.config.js';

export function summarizeAbsences(absenceEntries) {
  const bySemester = { 1: 0, 2: 0 };
  const byType = {};
  ABSENCE_TYPES.forEach((type) => {
    byType[type.id] = 0;
  });

  absenceEntries.forEach((entry) => {
    const units = unitOf(entry.type);
    bySemester[entry.semester] = (bySemester[entry.semester] || 0) + units;
    byType[entry.type] = (byType[entry.type] || 0) + units;
  });

  const yearTotal = roundHalf(bySemester[1] + bySemester[2]);

  let warningLevel = 'ok';
  if (yearTotal >= ABSENCE_THRESHOLDS.yearDanger) warningLevel = 'danger';
  else if (yearTotal >= ABSENCE_THRESHOLDS.yearWarning) warningLevel = 'warning';

  return {
    bySemester: { 1: roundHalf(bySemester[1]), 2: roundHalf(bySemester[2]) },
    byType,
    yearTotal,
    warningLevel,
    remainingToDanger: Math.max(0, roundHalf(ABSENCE_THRESHOLDS.yearDanger - yearTotal))
  };
}

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

export function lastAbsenceTimestamp(absenceEntries) {
  if (!absenceEntries || absenceEntries.length === 0) return null;
  return absenceEntries.reduce((latest, entry) => (entry.createdAt > latest ? entry.createdAt : latest), absenceEntries[0].createdAt);
}
