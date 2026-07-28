import { SCORE_WEIGHTS, TX_SLOT_COUNT, YEAR_WEIGHTS, GAN_DAT_THRESHOLD } from '../config/scoring.config.js';
import { roundScore } from '../utils/format.js';
import { txValuesOf, createEmptyGradeEntry, gradeEntryKey } from '../models/subject.model.js';

export const ENTRY_STATUS = {
  THIEU_DU_LIEU: 'THIEU_DU_LIEU',
  DANG_CHO_GIUA_KY: 'DANG_CHO_GIUA_KY',
  DANG_CHO_CUOI_KY: 'DANG_CHO_CUOI_KY',
  DA_DU_DU_LIEU: 'DA_DU_DU_LIEU'
};

export const ENTRY_STATUS_LABEL = {
  THIEU_DU_LIEU: 'Thiếu dữ liệu',
  DANG_CHO_GIUA_KY: 'Đang chờ giữa kỳ',
  DANG_CHO_CUOI_KY: 'Đang chờ cuối kỳ',
  DA_DU_DU_LIEU: 'Đã đủ dữ liệu'
};

export const YEAR_STATUS = {
  DANG_CHO_DU_DE_TINH: 'DANG_CHO_DU_DE_TINH',
  DA_DU_DU_LIEU: 'DA_DU_DU_LIEU'
};

export const YEAR_STATUS_LABEL = {
  DANG_CHO_DU_DE_TINH: 'Đang chờ đủ để tính',
  DA_DU_DU_LIEU: 'Đã đủ dữ liệu'
};

export function computeSemesterAverage(entry) {
  const txVals = txValuesOf(entry);
  const txSum = txVals.reduce((sum, value) => sum + value, 0);
  const txCount = txVals.length;
  const hasGk = entry.gk !== null && entry.gk !== undefined;
  const hasCk = entry.ck !== null && entry.ck !== undefined;

  let status = ENTRY_STATUS.DANG_CHO_CUOI_KY;
  if (!hasGk) status = ENTRY_STATUS.DANG_CHO_GIUA_KY;
  if (hasGk && hasCk) status = ENTRY_STATUS.DA_DU_DU_LIEU;
  if (txCount === 0 && !hasGk && !hasCk) status = ENTRY_STATUS.THIEU_DU_LIEU;

  const weightSum = txCount * SCORE_WEIGHTS.tx + (hasGk ? SCORE_WEIGHTS.gk : 0) + (hasCk ? SCORE_WEIGHTS.ck : 0);
  let provisionalValue = null;
  if (weightSum > 0) {
    const scoreSum = txSum * SCORE_WEIGHTS.tx
      + (hasGk ? entry.gk * SCORE_WEIGHTS.gk : 0)
      + (hasCk ? entry.ck * SCORE_WEIGHTS.ck : 0);
    provisionalValue = roundScore(scoreSum / weightSum);
  }

  let officialValue = null;
  if (hasGk && hasCk) {
    const officialDenominator = txCount + SCORE_WEIGHTS.gk + SCORE_WEIGHTS.ck;
    officialValue = roundScore((txSum + entry.gk * SCORE_WEIGHTS.gk + entry.ck * SCORE_WEIGHTS.ck) / officialDenominator);
  }

  const filledSlots = txCount + (hasGk ? 1 : 0) + (hasCk ? 1 : 0);
  const totalSlots = TX_SLOT_COUNT + 2;
  const progressPercent = (filledSlots / totalSlots) * 100;

  return {
    value: officialValue !== null ? officialValue : provisionalValue,
    officialValue,
    provisionalValue,
    isOfficial: officialValue !== null,
    status,
    statusLabel: ENTRY_STATUS_LABEL[status],
    txCount,
    txSum,
    hasGk,
    hasCk,
    progressPercent
  };
}

export function computeYearAverage(hk1Result, hk2Result) {
  if (!hk1Result.isOfficial || !hk2Result.isOfficial) {
    return {
      value: null,
      isOfficial: false,
      status: YEAR_STATUS.DANG_CHO_DU_DE_TINH,
      statusLabel: YEAR_STATUS_LABEL.DANG_CHO_DU_DE_TINH
    };
  }
  const value = roundScore(
    (hk1Result.value * YEAR_WEIGHTS.hk1 + hk2Result.value * YEAR_WEIGHTS.hk2) / (YEAR_WEIGHTS.hk1 + YEAR_WEIGHTS.hk2)
  );
  return {
    value,
    isOfficial: true,
    status: YEAR_STATUS.DA_DU_DU_LIEU,
    statusLabel: YEAR_STATUS_LABEL.DA_DU_DU_LIEU
  };
}

export function computeSubjectFull(subjectId, gradesMap) {
  const hk1Entry = gradesMap[gradeEntryKey(subjectId, 1)] || createEmptyGradeEntry(subjectId, 1);
  const hk2Entry = gradesMap[gradeEntryKey(subjectId, 2)] || createEmptyGradeEntry(subjectId, 2);
  const hk1 = computeSemesterAverage(hk1Entry);
  const hk2 = computeSemesterAverage(hk2Entry);
  const year = computeYearAverage(hk1, hk2);
  return { subjectId, hk1, hk2, year, hk1Entry, hk2Entry };
}

export function computeAllSubjects(subjectList, gradesMap) {
  return subjectList.map((subject) => ({ subject, ...computeSubjectFull(subject.id, gradesMap) }));
}

export function computeOverallAverage(subjectResults, field = 'year') {
  const values = subjectResults.map((result) => result[field].value).filter((value) => value !== null);
  if (values.length === 0) return { value: null, isOfficial: false, countedSubjects: 0, totalSubjects: subjectResults.length };
  const allOfficial = subjectResults.every((result) => result[field].isOfficial);
  const value = roundScore(values.reduce((sum, current) => sum + current, 0) / values.length);
  return { value, isOfficial: allOfficial, countedSubjects: values.length, totalSubjects: subjectResults.length };
}

export function compareToGoal(currentValue, goalValue) {
  if (currentValue === null || currentValue === undefined) return null;
  if (goalValue === null || goalValue === undefined) return null;
  const diff = roundScore(currentValue - goalValue);
  if (diff >= 0) return { achieved: true, near: false, diff, label: 'Đạt mục tiêu' };
  if (diff >= -GAN_DAT_THRESHOLD) return { achieved: false, near: true, diff, label: 'Gần đạt mục tiêu' };
  return { achieved: false, near: false, diff, label: 'Chưa đạt mục tiêu' };
}
