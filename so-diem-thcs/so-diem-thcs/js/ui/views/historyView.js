import { el, clear } from '../../utils/dom.js';
import { formatDateTimeVi } from '../../utils/date.js';

const CATEGORY_LABEL = {
  grade: 'Điểm số',
  absence: 'Nghỉ học',
  goal: 'Mục tiêu',
  profile: 'Hồ sơ'
};
const CATEGORY_ICON = {
  grade: 'fa-pen-to-square',
  absence: 'fa-calendar-xmark',
  goal: 'fa-bullseye',
  profile: 'fa-user'
};

export function createHistoryView(context) {
  const { appState } = context;
  const state = { category: 'all', subjectId: 'all' };

  async function render(container) {
    paint(container);
  }

  function paint(container) {
    clear(container);
    const subjectOptions = ['all', ...appState.subjectsWithNames.map((subject) => subject.id)];

    const categoryFilter = el(
      'div',
      { class: 'chip-row' },
      ['all', ...Object.keys(CATEGORY_LABEL)].map((cat) =>
        el(
          'button',
          {
            class: `chip ${state.category === cat ? 'chip--active' : ''}`,
            onClick: () => {
              state.category = cat;
              paint(container);
            }
          },
          cat === 'all' ? 'Tất cả' : CATEGORY_LABEL[cat]
        )
      )
    );

    const subjectSelect = el(
      'select',
      { class: 'input' },
      subjectOptions.map((id) => el('option', { value: id }, id === 'all' ? 'Tất cả môn học' : appState.nameOfSubject(id)))
    );
    subjectSelect.value = state.subjectId;
    subjectSelect.addEventListener('change', () => {
      state.subjectId = subjectSelect.value;
      paint(container);
    });

    const filtered = appState.history.filter((entry) => {
      if (state.category !== 'all' && entry.category !== state.category) return false;
      if (state.subjectId !== 'all' && entry.subjectId !== state.subjectId) return false;
      return true;
    });

    const list =
      filtered.length === 0
        ? el('p', { class: 'empty-state' }, 'Không có lịch sử phù hợp.')
        : el(
            'ul',
            { class: 'history-list' },
            filtered.map((entry) =>
              el('li', { class: 'history-item' }, [
                el('i', { class: `fa-solid ${CATEGORY_ICON[entry.category] || 'fa-clock-rotate-left'}` }),
                el('div', { class: 'history-item__body' }, [
                  el('p', { class: 'history-item__desc' }, entry.description),
                  el('p', { class: 'history-item__time' }, formatDateTimeVi(entry.timestamp))
                ])
              ])
            )
          );

    container.append(
      el('h1', { class: 'view-title' }, 'Lịch sử'),
      el('section', { class: 'card' }, [el('h2', {}, 'Bộ lọc'), categoryFilter, el('label', { class: 'field-label' }, 'Theo môn học'), subjectSelect]),
      el('section', { class: 'card' }, [el('h2', {}, `Kết quả (${filtered.length})`), list])
    );
  }

  return { render };
}
