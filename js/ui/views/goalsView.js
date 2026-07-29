import { el, clear } from '../../utils/dom.js';
import { STUDENT_TYPE_TIERS } from '../../config/scoring.config.js';
import { validateGoal } from '../../core/goalValidator.js';
import { setSubjectGoal } from '../../models/goal.model.js';
import { showToast } from '../toast.js';

export function createGoalsView(context) {
  const { appState } = context;

  async function render(container) {
    let draft = { ...appState.goal, subjectGoals: { ...appState.goal.subjectGoals } };

    function paint() {
      clear(container);
      const validation = validateGoal(draft);

      const tierSection = el('section', { class: 'card' }, [
        el('h2', {}, 'Chọn loại học sinh mục tiêu'),
        el(
          'div',
          { class: 'tier-grid' },
          STUDENT_TYPE_TIERS.map((tier) =>
            el(
              'button',
              {
                class: `tier-card tier-card--${tier.color} ${draft.studentTypeId === tier.id ? 'tier-card--selected' : ''}`,
                onClick: () => {
                  draft.studentTypeId = draft.studentTypeId === tier.id ? null : tier.id;
                  paint();
                }
              },
              [el('h3', {}, tier.label), el('p', {}, `Tối thiểu ${tier.minAverage} điểm TB · các môn ≥ ${tier.minSubjectAverage}`)]
            )
          )
        )
      ]);

      const yearGoalInput = el('input', {
        class: 'input input--number',
        type: 'number',
        step: '0.1',
        min: '0',
        max: '10',
        value: draft.yearAverageGoal ?? '',
        placeholder: 'Ví dụ: 8.5',
        onChange: (event) => {
          draft.yearAverageGoal = event.target.value === '' ? null : Number(event.target.value);
          paint();
        }
      });
      const yearGoalSection = el('section', { class: 'card' }, [el('h2', {}, 'Mục tiêu điểm trung bình cả năm'), yearGoalInput]);

      const subjectGoalSection = el('section', { class: 'card' }, [
        el('h2', {}, 'Mục tiêu điểm từng môn'),
        el(
          'div',
          { class: 'subject-goal-grid' },
          appState.subjectsWithNames.map((subject) =>
            el('div', { class: 'subject-goal-row' }, [
              el('label', {}, subject.name),
              el('input', {
                class: 'input input--number',
                type: 'number',
                step: '0.1',
                min: '0',
                max: '10',
                value: draft.subjectGoals[subject.id] ?? '',
                onChange: (event) => {
                  draft = setSubjectGoal(draft, subject.id, event.target.value === '' ? null : Number(event.target.value));
                  paint();
                }
              })
            ])
          )
        )
      ]);

      const validationSection =
        validation.issues.length > 0
          ? el('section', { class: 'card validation-card' }, [
              el('h2', {}, 'Kiểm tra tính hợp lệ'),
              ...validation.issues.map((issue) =>
                el('p', { class: `validation-message validation-message--${issue.severity}` }, [
                  el('i', { class: `fa-solid ${issue.severity === 'error' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}` }),
                  ` ${issue.message}`
                ])
              )
            ])
          : el('section', { class: 'card validation-card validation-card--ok' }, [
              el('p', {}, [el('i', { class: 'fa-solid fa-circle-check' }), ' Mục tiêu hiện tại đang nhất quán.'])
            ]);

      const saveButton = el(
        'button',
        {
          class: 'btn btn--primary btn--block',
          onClick: async () => {
            await appState.saveGoal(draft);
            showToast('Đã lưu mục tiêu học tập.', 'success');
          }
        },
        ['Lưu mục tiêu ', el('i', { class: 'fa-solid fa-floppy-disk' })]
      );

      container.append(el('h1', { class: 'view-title' }, 'Mục tiêu học tập'), tierSection, yearGoalSection, subjectGoalSection, validationSection, saveButton);
    }

    paint();
  }

  return { render };
}
