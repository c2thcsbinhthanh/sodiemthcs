import { ENTRY_STATUS } from './scoringEngine.js';
import { requiredCk } from './predictionEngine.js';
import { daysSince } from '../utils/date.js';
import { STALE_DATA_DAYS } from '../config/app.config.js';
import { ABSENCE_THRESHOLDS } from '../config/absence.config.js';
import { gradeEntryKey } from '../models/subject.model.js';

export function generateNotifications({ subjectResults, goal, gradesMap, lastActivityAt, absenceSummary }) {
  const notifications = [];

  subjectResults.forEach(({ subject, hk1, hk2, year }) => {
    [['I', hk1], ['II', hk2]].forEach(([label, semResult]) => {
      if (semResult.status === ENTRY_STATUS.THIEU_DU_LIEU) {
        notifications.push({
          id: `missing_${subject.id}_${label}`,
          severity: 'info',
          icon: 'fa-circle-info',
          subjectId: subject.id,
          message: `Môn ${subject.name} học kỳ ${label} chưa có dữ liệu điểm.`
        });
      } else if (semResult.status === ENTRY_STATUS.DANG_CHO_GIUA_KY) {
        notifications.push({
          id: `waitgk_${subject.id}_${label}`,
          severity: 'info',
          icon: 'fa-hourglass-half',
          subjectId: subject.id,
          message: `Môn ${subject.name} học kỳ ${label} còn thiếu điểm giữa kỳ.`
        });
      } else if (semResult.status === ENTRY_STATUS.DANG_CHO_CUOI_KY) {
        notifications.push({
          id: `waitck_${subject.id}_${label}`,
          severity: 'info',
          icon: 'fa-hourglass-end',
          subjectId: subject.id,
          message: `Môn ${subject.name} học kỳ ${label} còn thiếu điểm cuối kỳ.`
        });
      }
    });

    const goalValue = goal && goal.subjectGoals ? goal.subjectGoals[subject.id] : null;
    if (goalValue !== null && goalValue !== undefined) {
      if (year.value !== null && year.value < goalValue - 0.3) {
        notifications.push({
          id: `low_${subject.id}`,
          severity: 'warning',
          icon: 'fa-triangle-exclamation',
          subjectId: subject.id,
          message: `Môn ${subject.name} đang thấp hơn mục tiêu ${goalValue} khá nhiều (hiện tại ${year.value ?? '—'}).`
        });
      }
      if (hk2.hasGk && !hk2.hasCk && gradesMap) {
        const hk2Entry = gradesMap[gradeEntryKey(subject.id, 2)];
        const ckCheck = hk2Entry ? requiredCk(hk2Entry, goalValue) : null;
        if (ckCheck && ckCheck.possible === false) {
          notifications.push({
            id: `unreachable_${subject.id}`,
            severity: 'danger',
            icon: 'fa-circle-exclamation',
            subjectId: subject.id,
            message: `Mục tiêu môn ${subject.name} khó đạt được trong học kỳ này, hãy xem lại mục tiêu hoặc dồn sức cải thiện ngay.`
          });
        }
      }
    }
  });

  if (lastActivityAt) {
    const days = daysSince(lastActivityAt);
    if (days >= STALE_DATA_DAYS) {
      notifications.push({
        id: 'stale_data',
        severity: 'info',
        icon: 'fa-clock',
        message: `Đã ${days} ngày bạn chưa cập nhật điểm mới. Cập nhật thường xuyên giúp dự đoán chính xác hơn.`
      });
    }
  }

  if (absenceSummary) {
    if (absenceSummary.yearTotal >= ABSENCE_THRESHOLDS.yearDanger) {
      notifications.push({
        id: 'absence_danger',
        severity: 'danger',
        icon: 'fa-calendar-xmark',
        message: `Số buổi nghỉ học cả năm đã đạt ${absenceSummary.yearTotal} buổi, vượt mốc ${ABSENCE_THRESHOLDS.yearDanger} buổi có thể ảnh hưởng đến việc lên lớp.`
      });
    } else if (absenceSummary.yearTotal >= ABSENCE_THRESHOLDS.yearWarning) {
      notifications.push({
        id: 'absence_warning',
        severity: 'warning',
        icon: 'fa-calendar-day',
        message: `Số buổi nghỉ học cả năm đang gần mức cảnh báo (${absenceSummary.yearTotal}/${ABSENCE_THRESHOLDS.yearDanger} buổi).`
      });
    }
  }

  return notifications;
}
