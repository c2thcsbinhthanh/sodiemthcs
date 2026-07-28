import { el } from '../../utils/dom.js';
import { formatPercent } from '../../utils/format.js';

export function progressBar(percent, colorClass = '') {
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  return el('div', { class: 'progress-bar' }, [
    el('div', { class: `progress-bar__track` }, [
      el('div', { class: `progress-bar__fill ${colorClass}`, style: `width:${safePercent}%` })
    ]),
    el('span', { class: 'progress-bar__label' }, formatPercent(safePercent))
  ]);
}
