import { el } from '../../utils/dom.js';
import { formatScore } from '../../utils/format.js';
import { progressBar } from './progressBar.js';
import { compareToGoal, ENTRY_STATUS } from '../../core/scoringEngine.js';

export function subjectCard(result, goalValue, onViewDetail) {
  const { subject, year, hk1, hk2 } = result;
  const comparison = compareToGoal(year.value, goalValue);
  let statusClass = 'badge--neutral';
  let statusText = year.statusLabel;
  if (comparison) {
    statusClass = comparison.achieved ? 'badge--success' : comparison.near ? 'badge--warning' : 'badge--danger';
    statusText = comparison.label;
  }

  const missing = [];
  if (hk1.status !== ENTRY_STATUS.DA_DU_DU_LIEU) missing.push('HK1');
  if (hk2.status !== ENTRY_STATUS.DA_DU_DU_LIEU) missing.push('HK2');

  const overallProgress = (hk1.progressPercent + hk2.progressPercent) / 2;

  return el('article', { class: 'subject-card', dataset: { subjectId: subject.id } }, [
    el('div', { class: 'subject-card__header' }, [
      el('span', { class: 'subject-card__icon' }, [el('i', { class: `fa-solid ${subject.icon || 'fa-book'}` })]),
      el('h3', { class: 'subject-card__name' }, subject.name)
    ]),
    el('div', { class: 'subject-card__score-row' }, [
      el('span', { class: 'subject-card__score-value' }, formatScore(year.value)),
      el('span', { class: `badge ${statusClass}` }, statusText)
    ]),
    progressBar(overallProgress),
    missing.length > 0
      ? el('p', { class: 'subject-card__missing' }, [
          el('i', { class: 'fa-solid fa-triangle-exclamation' }),
          ` Thiếu dữ liệu: ${missing.join(', ')}`
        ])
      : el('p', { class: 'subject-card__missing subject-card__missing--ok' }, [
          el('i', { class: 'fa-solid fa-circle-check' }),
          ' Đã đủ dữ liệu cả năm'
        ]),
    el(
      'button',
      { class: 'btn btn--ghost btn--small subject-card__detail', onClick: () => onViewDetail(subject.id) },
      ['Xem chi tiết ', el('i', { class: 'fa-solid fa-arrow-right' })]
    )
  ]);
}
