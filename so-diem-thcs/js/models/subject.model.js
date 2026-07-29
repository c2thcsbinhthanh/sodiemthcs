import { TX_SLOT_COUNT } from '../config/scoring.config.js';

export function createEmptyGradeEntry(subjectId, semester) {
  const tx = {};
  for (let slot = 1; slot <= TX_SLOT_COUNT; slot += 1) {
    tx[slot] = null;
  }
  return {
    subjectId,
    semester,
    tx,
    gk: null,
    ck: null,
    updatedAt: null
  };
}

export function createEmptyPassFailEntry(subjectId, semester) {
  return {
    subjectId,
    semester,
    result: null,
    updatedAt: null
  };
}

export function createEmptyConductEntry(conductId, semester) {
  return {
    conductId,
    semester,
    level: null,
    updatedAt: null
  };
}

export function gradeEntryKey(subjectId, semester) {
  return `${subjectId}_hk${semester}`;
}

export function txValuesOf(entry) {
  return Object.values(entry.tx).filter((value) => value !== null && value !== undefined);
}

export function txFilledCount(entry) {
  return txValuesOf(entry).length;
}
