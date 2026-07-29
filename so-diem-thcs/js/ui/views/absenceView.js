import { el, clear } from '../../utils/dom.js';
import { ABSENCE_TYPES, ABSENCE_THRESHOLDS } from '../../config/absence.config.js';
import { SEMESTERS } from '../../config/subjects.config.js';
import { createAbsenceEntry } from '../../models/absence.model.js';
import { formatDateVi } from '../../utils/date.js';
import { formatAbsenceUnit } from '../../utils/format.js';
import { showToast } from '../toast.js';
import { confirmAction } from '../modal.js';

export function createAbsenceView(context) {
  const { appState } = context;
  const state = { semester: 1 };

  async function render(container) {
    paint(container);
  }

  function paint(container) {
    clear(container);
    const summary = appState.computeAbsenceSummary();

    const semesterToggle = el(
      'div',
      { class: 'segmented' },
      SEMESTERS.map((sem) =>
        el(
          'button',
          {
            class: `segmented__option ${state.semester === sem.id ? 'segmented__option--active' : ''}`,
            onClick: () => {
              state.semester = sem.id;
              paint(container);
            }
          },
          sem.name
        )
      )
    );

    const quickAddRow = el(
      'div',
      { class: 'quick-add-row' },
      ABSENCE_TYPES.map((type) =>
        el(
          'button',
          {
            class: `quick-add-btn quick-add-btn--${type.color}`,
            onClick: async () => {
              const entry = createAbsenceEntry({ type: type.id, semester: state.semester });
              await appState.addAbsence(entry);
              showToast(`Đã thêm: ${type.label}`, 'success');
              paint(container);
            }
          },
          [el('i', { class: `fa-solid ${type.icon}` }), el('span', {}, type.label), el('span', { class: 'quick-add-btn__plus' }, '+1')]
        )
      )
    );

    const warningBanner =
      summary.warningLevel !== 'ok'
        ? el('div', { class: `absence-warning absence-warning--${summary.warningLevel}` }, [
            el('i', { class: 'fa-solid fa-triangle-exclamation' }),
            ` Tổng số buổi nghỉ cả năm: ${summary.yearTotal}/${ABSENCE_THRESHOLDS.yearDanger} — ${
              summary.warningLevel === 'danger' ? 'đã vượt mốc cảnh báo, có thể ảnh hưởng việc lên lớp!' : 'đang gần mốc cảnh báo.'
            }`
          ])
        : null;

    const statsGrid = el('div', { class: 'absence-stats-grid' }, [
      absenceStat('Học kỳ I', summary.bySemester[1]),
      absenceStat('Học kỳ II', summary.bySemester[2]),
      absenceStat('Cả năm', summary.yearTotal, true)
    ]);

    const byTypeGrid = el('div', { class: 'absence-stats-grid' }, ABSENCE_TYPES.map((type) => absenceStat(type.label, summary.byType[type.id])));

    const historyList = renderAbsenceHistory(appState, container, paint);

    container.append(
      el('h1', { class: 'view-title' }, 'Theo dõi nghỉ học'),
      warningBanner,
      el('section', { class: 'card' }, [el('h2', {}, 'Thêm nhanh'), semesterToggle, quickAddRow]),
      el('section', { class: 'card' }, [el('h2', {}, 'Tổng quan theo học kỳ'), statsGrid]),
      el('section', { class: 'card' }, [el('h2', {}, 'Tổng quan theo loại'), byTypeGrid]),
      el('section', { class: 'card' }, [el('h2', {}, 'Lịch sử nghỉ học'), historyList])
    );
  }

  return { render };
}

function absenceStat(label, value, emphasize = false) {
  return el('div', { class: `absence-stat ${emphasize ? 'absence-stat--emphasize' : ''}` }, [
    el('span', { class: 'absence-stat__value' }, formatAbsenceUnit(value)),
    el('span', { class: 'absence-stat__label' }, label)
  ]);
}

function renderAbsenceHistory(appState, container, paint) {
  const sorted = [...appState.absences].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return el('p', { class: 'empty-state' }, 'Chưa có bản ghi nghỉ học nào.');
  return el(
    'ul',
    { class: 'absence-history-list' },
    sorted.map((entry) => {
      const type = ABSENCE_TYPES.find((item) => item.id === entry.type);
      return el('li', { class: 'absence-history-item' }, [
        el('i', { class: `fa-solid ${type ? type.icon : 'fa-calendar'}` }),
        el('span', { class: 'absence-history-item__label' }, type ? type.label : entry.type),
        el('span', { class: 'absence-history-item__date' }, formatDateVi(entry.date)),
        el(
          'button',
          {
            class: 'icon-btn',
            onClick: async () => {
              const confirmed = await confirmAction({ title: 'Xóa bản ghi nghỉ học?', text: 'Hành động này không thể hoàn tác.', danger: true });
              if (confirmed) {
                await appState.removeAbsence(entry.id);
                paint(container);
              }
            }
          },
          [el('i', { class: 'fa-solid fa-trash' })]
        )
      ]);
    })
  );
}
