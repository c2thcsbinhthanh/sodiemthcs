const instances = new Map();

export function themedPalette() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    primary: read('--color-primary', '#0E7C6B'),
    gold: read('--color-gold', '#E8A33D'),
    success: read('--color-success', '#2F9E5B'),
    warning: read('--color-warning', '#E0A526'),
    danger: read('--color-danger', '#E1543F'),
    ink: read('--color-ink', '#1B2A27'),
    inkMuted: read('--color-ink-muted', '#5B6B65'),
    border: read('--color-border', '#E1E4DC')
  };
}

export function renderChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return null;
  const existing = instances.get(canvasId);
  if (existing) existing.destroy();
  const chart = new window.Chart(canvas, config);
  instances.set(canvasId, chart);
  return chart;
}

export function destroyChart(canvasId) {
  const existing = instances.get(canvasId);
  if (existing) {
    existing.destroy();
    instances.delete(canvasId);
  }
}

export function destroyAllCharts() {
  instances.forEach((chart) => chart.destroy());
  instances.clear();
}

export function baseOptions(extra = {}) {
  const palette = themedPalette();
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { plugins, ...rest } = extra;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion ? false : { duration: 650, easing: 'easeOutQuart' },
    plugins: {
      legend: { labels: { color: palette.ink, font: { family: "'Be Vietnam Pro', sans-serif", size: 12 } } },
      tooltip: {
        backgroundColor: palette.ink,
        titleFont: { family: "'Be Vietnam Pro', sans-serif" },
        bodyFont: { family: "'JetBrains Mono', monospace" },
        padding: 10,
        cornerRadius: 8
      },
      ...plugins
    },
    ...rest
  };
}
