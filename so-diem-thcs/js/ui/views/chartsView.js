import { el, clear } from '../../utils/dom.js';
import { SEMESTERS } from '../../config/subjects.config.js';
import { gradeEntryKey, createEmptyGradeEntry } from '../../models/subject.model.js';
import { renderSubjectBarChart, renderTxLineChart } from '../../charts/subjectCharts.js';
import { renderCompletionPieChart, renderGoalProgressChart } from '../../charts/progressCharts.js';
import { destroyAllCharts } from '../../charts/chartFactory.js';

export function createChartsView(context) {
  const { appState } = context;
  const state = { field: 'year', subjectId: null, lineSemester: 1 };

  async function render(container) {
    if (!state.subjectId) state.subjectId = appState.subjectsWithNames[0].id;
    clear(container);
    destroyAllCharts();

    const subjectResults = appState.computeSubjectResults();

    const fieldToggle = el(
      'div',
      { class: 'segmented' },
      [
        ['hk1', 'Học kỳ I'],
        ['hk2', 'Học kỳ II'],
        ['year', 'Cả năm']
      ].map(([id, label]) =>
        el(
          'button',
          {
            class: `segmented__option ${state.field === id ? 'segmented__option--active' : ''}`,
            onClick: () => {
              state.field = id;
              render(container);
            }
          },
          label
        )
      )
    );

    const subjectChips = el(
      'div',
      { class: 'chip-row' },
      appState.subjectsWithNames.map((subject) =>
        el(
          'button',
          {
            class: `chip ${state.subjectId === subject.id ? 'chip--active' : ''}`,
            onClick: () => {
              state.subjectId = subject.id;
              render(container);
            }
          },
          subject.name
        )
      )
    );

    const lineSemesterToggle = el(
      'div',
      { class: 'segmented segmented--small' },
      SEMESTERS.map((sem) =>
        el(
          'button',
          {
            class: `segmented__option ${state.lineSemester === sem.id ? 'segmented__option--active' : ''}`,
            onClick: () => {
              state.lineSemester = sem.id;
              render(container);
            }
          },
          sem.name
        )
      )
    );

    const barCanvas = el('canvas', { id: 'chart-subject-bar' });
    const pieCanvas = el('canvas', { id: 'chart-completion-pie' });
    const goalCanvas = el('canvas', { id: 'chart-goal-progress' });
    const lineCanvas = el('canvas', { id: 'chart-tx-line' });

    container.append(
      el('h1', { class: 'view-title' }, 'Biểu đồ'),
      el('section', { class: 'card' }, [el('h2', {}, 'So sánh điểm giữa các môn'), fieldToggle, el('div', { class: 'chart-box' }, [barCanvas])]),
      el('section', { class: 'card' }, [el('h2', {}, 'Tỷ lệ hoàn thành nhập điểm'), el('div', { class: 'chart-box chart-box--small' }, [pieCanvas])]),
      el('section', { class: 'card' }, [el('h2', {}, 'Tiến độ đạt mục tiêu từng môn'), el('div', { class: 'chart-box' }, [goalCanvas])]),
      el('section', { class: 'card' }, [
        el('h2', {}, 'Diễn biến điểm theo môn'),
        subjectChips,
        lineSemesterToggle,
        el('div', { class: 'chart-box' }, [lineCanvas])
      ])
    );

    requestAnimationFrame(() => {
      renderSubjectBarChart('chart-subject-bar', subjectResults, state.field);
      renderCompletionPieChart('chart-completion-pie', subjectResults);
      renderGoalProgressChart('chart-goal-progress', subjectResults, appState.goal);
      const entry =
        appState.activeGrades[gradeEntryKey(state.subjectId, state.lineSemester)] || createEmptyGradeEntry(state.subjectId, state.lineSemester);
      const semesterLabel = SEMESTERS.find((sem) => sem.id === state.lineSemester).name;
      renderTxLineChart('chart-tx-line', entry, `${appState.nameOfSubject(state.subjectId)} · ${semesterLabel}`);
    });
  }

  return { render };
}
