import { SCORE_WEIGHTS, SCORE_MAX, SCORE_MIN, YEAR_WEIGHTS } from '../config/scoring.config.js';
import { roundScore, clamp } from '../utils/format.js';
import { txValuesOf, createEmptyGradeEntry, gradeEntryKey } from '../models/subject.model.js';
import { computeSemesterAverage } from './scoringEngine.js';

function cloneEntryWithNewTx(entry, newScore) {
  const tx = { ...entry.tx };
  const emptySlot = Object.keys(tx).find((slot) => tx[slot] === null || tx[slot] === undefined);
  if (emptySlot !== undefined) tx[emptySlot] = newScore;
  return { ...entry, tx };
}

export function simulateAddTxScore(entry, newScore) {
  const before = computeSemesterAverage(entry);
  const clonedEntry = cloneEntryWithNewTx(entry, newScore);
  const after = computeSemesterAverage(clonedEntry);
  return { before, after, entry: clonedEntry, delta: after.value !== null && before.value !== null ? roundScore(after.value - before.value) : null };
}

export function simulateOverride(entry, field, value) {
  const cloned = { ...entry, tx: { ...entry.tx }, [field]: value };
  return computeSemesterAverage(cloned);
}

export function requiredCk(entry, targetAverage) {
  const txVals = txValuesOf(entry);
  const n = txVals.length;
  const txSum = txVals.reduce((sum, value) => sum + value, 0);
  if (entry.gk === null || entry.gk === undefined) {
    return { possible: null, reason: 'Cần nhập điểm giữa kỳ trước khi dự đoán điểm cuối kỳ' };
  }
  const denominator = n + SCORE_WEIGHTS.gk + SCORE_WEIGHTS.ck;
  const needed = (targetAverage * denominator - txSum - SCORE_WEIGHTS.gk * entry.gk) / SCORE_WEIGHTS.ck;
  const rounded = roundScore(needed);
  if (rounded > SCORE_MAX) return { possible: false, value: rounded, reason: 'Không thể đạt mục tiêu này dù cuối kỳ đạt điểm tối đa' };
  if (rounded <= SCORE_MIN) return { possible: true, value: SCORE_MIN, guaranteed: true };
  return { possible: true, value: clamp(rounded, SCORE_MIN, SCORE_MAX) };
}

export function requiredGk(entry, targetAverage, assumedCk = null) {
  const txVals = txValuesOf(entry);
  const n = txVals.length;
  const txSum = txVals.reduce((sum, value) => sum + value, 0);
  const ckToUse = assumedCk !== null ? assumedCk : targetAverage;
  const denominator = n + SCORE_WEIGHTS.gk + SCORE_WEIGHTS.ck;
  const needed = (targetAverage * denominator - txSum - SCORE_WEIGHTS.ck * ckToUse) / SCORE_WEIGHTS.gk;
  const rounded = roundScore(needed);
  if (rounded > SCORE_MAX) return { possible: false, value: rounded, reason: 'Không thể đạt mục tiêu này dù giữa kỳ đạt điểm tối đa' };
  if (rounded <= SCORE_MIN) return { possible: true, value: SCORE_MIN, guaranteed: true };
  return { possible: true, value: clamp(rounded, SCORE_MIN, SCORE_MAX) };
}

export function requiredHk2Average(hk1Value, yearGoal) {
  const needed = (yearGoal * (YEAR_WEIGHTS.hk1 + YEAR_WEIGHTS.hk2) - hk1Value * YEAR_WEIGHTS.hk1) / YEAR_WEIGHTS.hk2;
  return roundScore(needed);
}

export function requiredCkForYearGoal(subjectId, gradesMap, yearGoal) {
  const hk1Entry = gradesMap[gradeEntryKey(subjectId, 1)] || createEmptyGradeEntry(subjectId, 1);
  const hk1Result = computeSemesterAverage(hk1Entry);
  if (!hk1Result.isOfficial) {
    return { possible: null, reason: 'Cần hoàn tất đủ điểm học kỳ I trước khi dự đoán cho cả năm' };
  }
  const neededHk2 = requiredHk2Average(hk1Result.value, yearGoal);
  if (neededHk2 > SCORE_MAX) return { possible: false, neededHk2, reason: 'Mục tiêu cả năm không còn khả thi với kết quả học kỳ I hiện tại' };
  if (neededHk2 <= SCORE_MIN) return { possible: true, neededHk2: SCORE_MIN, guaranteed: true };

  const hk2Entry = gradesMap[gradeEntryKey(subjectId, 2)] || createEmptyGradeEntry(subjectId, 2);
  if (hk2Entry.gk === null || hk2Entry.gk === undefined) {
    const txVals = txValuesOf(hk2Entry);
    const n = txVals.length;
    const txSum = txVals.reduce((sum, value) => sum + value, 0);
    const denominator = n + SCORE_WEIGHTS.gk + SCORE_WEIGHTS.ck;
    const neededWeightedRemaining = neededHk2 * denominator - txSum;
    const approxEach = roundScore(neededWeightedRemaining / (SCORE_WEIGHTS.gk + SCORE_WEIGHTS.ck));
    return {
      possible: approxEach <= SCORE_MAX,
      neededHk2,
      approxEach: clamp(approxEach, SCORE_MIN, SCORE_MAX),
      mode: 'both-missing'
    };
  }
  const ckResult = requiredCk(hk2Entry, neededHk2);
  return { ...ckResult, neededHk2, mode: 'ck-only' };
}

export function generateRecoveryScenarios(entry, goalValue) {
  const current = computeSemesterAverage(entry);
  if (current.value === null || goalValue === null || current.value >= goalValue) return [];
  return [8, 9, 10].map((hypothetical) => {
    const simulation = simulateAddTxScore(entry, hypothetical);
    return {
      hypothetical,
      resultValue: simulation.after.value,
      closesGap: simulation.after.value !== null && simulation.after.value >= goalValue
    };
  });
}
