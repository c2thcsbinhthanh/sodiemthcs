import { renderChart, baseOptions, themedPalette } from './chartFactory.js';
import { ENTRY_STATUS } from '../core/scoringEngine.js';

export function renderCompletionPieChart(canvasId, subjectResults) {
  const palette = themedPalette();
  let complete = 0;
  let partial = 0;
  let empty = 0;
  subjectResults.forEach((result) => {
    [result.hk1, result.hk2].forEach((semester) => {
      if (semester.status === ENTRY_STATUS.DA_DU_DU_LIEU) complete += 1;
      else if (semester.status === ENTRY_STATUS.THIEU_DU_LIEU) empty += 1;
      else partial += 1;
    });
  });
  return renderChart(canvasId, {
    type: 'pie',
    data: {
      labels: ['Đã đủ dữ liệu', 'Đang chờ dữ liệu', 'Thiếu dữ liệu'],
      datasets: [{ data: [complete, partial, empty], backgroundColor: [palette.success, palette.warning, palette.danger], borderWidth: 0 }]
    },
    options: baseOptions({ plugins: { legend: { position: 'bottom' } } })
  });
}

export function renderGoalProgressChart(canvasId, subjectResults, goal) {
  const palette = themedPalette();
  const labels = [];
  const achieved = [];
  const remaining = [];
  subjectResults.forEach((result) => {
    const goalValue = goal && goal.subjectGoals ? goal.subjectGoals[result.subject.id] : null;
    if (goalValue === null || goalValue === undefined) return;
    labels.push(result.subject.name);
    const current = result.year.value ?? 0;
    achieved.push(Math.min(current, goalValue));
    remaining.push(Math.max(0, Number((goalValue - current).toFixed(1))));
  });
  return renderChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Đã đạt', data: achieved, backgroundColor: palette.primary, stack: 'goal', borderRadius: 6 },
        { label: 'Còn thiếu', data: remaining, backgroundColor: palette.border, stack: 'goal', borderRadius: 6 }
      ]
    },
    options: baseOptions({
      indexAxis: 'y',
      scales: { x: { stacked: true, min: 0, max: 10 }, y: { stacked: true, grid: { display: false } } }
    })
  });
}
