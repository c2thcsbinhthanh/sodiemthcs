import { renderChart, baseOptions, themedPalette } from './chartFactory.js';

export function scoreColor(value, palette) {
  if (value === null || value === undefined) return palette.border;
  if (value >= 8) return palette.success;
  if (value >= 6.5) return palette.primary;
  if (value >= 5) return palette.warning;
  return palette.danger;
}

export function renderSubjectBarChart(canvasId, subjectResults, field = 'year') {
  const palette = themedPalette();
  const labels = subjectResults.map((result) => result.subject.name);
  const data = subjectResults.map((result) => result[field].value);
  const colors = data.map((value) => scoreColor(value, palette));
  return renderChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Điểm trung bình', data, backgroundColor: colors, borderRadius: 8, maxBarThickness: 34 }]
    },
    options: baseOptions({
      scales: {
        y: { min: 0, max: 10, ticks: { stepSize: 2 }, grid: { color: palette.border } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    })
  });
}

export function renderTxLineChart(canvasId, entry, label) {
  const palette = themedPalette();
  const slots = Object.keys(entry.tx).sort((a, b) => Number(a) - Number(b));
  const data = slots.map((slot) => entry.tx[slot]);
  const points = [];
  if (entry.gk !== null && entry.gk !== undefined) points.push('GK');
  if (entry.ck !== null && entry.ck !== undefined) points.push('CK');
  return renderChart(canvasId, {
    type: 'line',
    data: {
      labels: [...slots.map((slot) => `TX${slot}`), ...points],
      datasets: [
        {
          label: label || 'Diễn biến điểm',
          data: [...data, ...(entry.gk !== null && entry.gk !== undefined ? [entry.gk] : []), ...(entry.ck !== null && entry.ck !== undefined ? [entry.ck] : [])],
          borderColor: palette.primary,
          backgroundColor: `${palette.primary}33`,
          tension: 0.35,
          spanGaps: true,
          pointRadius: 5,
          pointBackgroundColor: palette.primary,
          fill: true
        }
      ]
    },
    options: baseOptions({ scales: { y: { min: 0, max: 10, grid: { color: palette.border } }, x: { grid: { display: false } } } })
  });
}
