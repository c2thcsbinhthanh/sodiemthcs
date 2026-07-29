import { findTierById, STUDENT_TYPE_TIERS } from '../config/scoring.config.js';
import { CORE_SUBJECTS } from '../config/subjects.config.js';

export function validateGoal(goal) {
  const issues = [];
  if (!goal) return { valid: true, issues };

  const tier = goal.studentTypeId ? findTierById(goal.studentTypeId) : null;

  if (tier && goal.yearAverageGoal !== null && goal.yearAverageGoal !== undefined) {
    if (goal.yearAverageGoal < tier.minAverage) {
      issues.push({
        severity: 'error',
        code: 'YEAR_GOAL_BELOW_TIER',
        message: `Bạn chọn "${tier.label}" nhưng điểm trung bình mục tiêu cả năm (${goal.yearAverageGoal}) thấp hơn mức tối thiểu cần có (${tier.minAverage}). Hãy tăng điểm mục tiêu hoặc chọn loại học sinh phù hợp hơn.`
      });
    }
  }

  if (tier && goal.subjectGoals) {
    Object.entries(goal.subjectGoals).forEach(([subjectId, value]) => {
      if (value === null || value === undefined) return;
      if (value < tier.minSubjectAverage) {
        const subject = CORE_SUBJECTS.find((item) => item.id === subjectId);
        issues.push({
          severity: 'warning',
          code: 'SUBJECT_GOAL_BELOW_TIER',
          subjectId,
          message: `Môn ${subject ? subject.name : subjectId} đang đặt mục tiêu ${value}, thấp hơn mức khuyến nghị ${tier.minSubjectAverage} cho "${tier.label}".`
        });
      }
    });
  }

  if (goal.yearAverageGoal !== null && goal.yearAverageGoal !== undefined && goal.subjectGoals) {
    const subjectGoalValues = Object.values(goal.subjectGoals).filter((value) => value !== null && value !== undefined);
    if (subjectGoalValues.length > 0) {
      const average = subjectGoalValues.reduce((sum, value) => sum + value, 0) / subjectGoalValues.length;
      if (average < goal.yearAverageGoal - 0.5) {
        issues.push({
          severity: 'warning',
          code: 'SUBJECT_GOALS_INCONSISTENT_WITH_YEAR',
          message: `Trung bình các mục tiêu môn học (${average.toFixed(1)}) đang thấp hơn khá nhiều so với mục tiêu điểm trung bình cả năm (${goal.yearAverageGoal}). Hãy kiểm tra lại để mục tiêu nhất quán.`
        });
      }
    }
  }

  const hasError = issues.some((issue) => issue.severity === 'error');
  return { valid: !hasError, issues };
}

export function suggestTierForAverage(averageValue) {
  if (averageValue === null || averageValue === undefined) return null;
  const sorted = [...STUDENT_TYPE_TIERS].sort((a, b) => b.minAverage - a.minAverage);
  return sorted.find((tier) => averageValue >= tier.minAverage) || null;
}
