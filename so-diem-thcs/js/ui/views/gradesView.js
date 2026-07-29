import { el, clear } from '../../utils/dom.js';
import { SEMESTERS, PASS_FAIL_SUBJECTS, CONDUCT_ITEMS, CONDUCT_LEVELS, PASS_FAIL_LEVELS } from '../../config/subjects.config.js';
import { TX_SLOT_COUNT } from '../../config/scoring.config.js';
import {
  createEmptyGradeEntry,
  createEmptyPassFailEntry,
  createEmptyConductEntry,
  gradeEntryKey,
  txFilledCount
} from '../../models/subject.model.js';
import { computeSemesterAverage, compareToGoal } from '../../core/scoringEngine.js';
import { simulateAddTxScore, requiredCk, requiredCkForYearGoal, generateRecoveryScenarios } from '../../core/predictionEngine.js';
import { formatScore, formatSigned } from '../../utils/format.js';
import { clampScore } from '../../utils/validate.js';
import { progressBar } from '../components/progressBar.js';
import { showToast } from '../toast.js';

export function createGradesView(context) {
  const { appState } = context;
  const state = { activeSection: 'core', subjectId: null, semester: 1 };

  async function render(container, params = {}) {
    if (!state.subjectId) state.subjectId = appState.subjectsWithNames[0].id;
    if (params.subjectId) {
      state.subjectId = params.subjectId;
      state.activeSection = 'core';
    }
    paint(container);
  }

  function paint(container) {
    clear(container);
    const wrap = el('div', {}, [
      el('h1', { class: 'view-title' }, 'Nhập điểm'),
      appState.simulationMode ? renderSimBanner(appState, () => paint(container)) : renderSimToggle(appState, () => paint(container)),
      renderSectionTabs(state, () => paint(container)),
      state.activeSection === 'core'
        ? renderCoreSection(appState, state, () => paint(container))
        : state.activeSection === 'passfail'
        ? renderPassFailSection(appState)
        : renderConductSection(appState)
    ]);
    container.append(wrap);
  }

  return { render };
}

function renderSimBanner(appState, onChange) {
  return el('div', { class: 'sim-banner' }, [
    el('span', {}, [el('i', { class: 'fa-solid fa-flask' }), ' Chế độ giả lập đang bật — thay đổi sẽ không lưu vào dữ liệu thật']),
    el(
      'button',
      {
        class: 'btn btn--small btn--light',
        onClick: () => {
          appState.exitSimulationMode();
          onChange();
        }
      },
      'Thoát giả lập'
    )
  ]);
}

function renderSimToggle(appState, onChange) {
  return el('div', { class: 'sim-toggle-card' }, [
    el('span', {}, [el('i', { class: 'fa-solid fa-flask' }), ' Muốn thử một kịch bản điểm số mà không ảnh hưởng dữ liệu thật?']),
    el(
      'button',
      {
        class: 'btn btn--small btn--ghost',
        onClick: () => {
          appState.enterSimulationMode();
          onChange();
        }
      },
      'Bật chế độ giả lập'
    )
  ]);
}

function renderSectionTabs(state, onChange) {
  const tabs = [
    ['core', 'Môn tính điểm'],
    ['passfail', 'Đạt / Chưa đạt'],
    ['conduct', 'Hạnh kiểm']
  ];
  return el(
    'div',
    { class: 'subtab-row' },
    tabs.map(([id, label]) =>
      el(
        'button',
        {
          class: `subtab ${state.activeSection === id ? 'subtab--active' : ''}`,
          onClick: () => {
            state.activeSection = id;
            onChange();
          }
        },
        label
      )
    )
  );
}

function renderCoreSection(appState, state, onChange) {
  const subjects = appState.subjectsWithNames;
  const subjectChips = el(
    'div',
    { class: 'chip-row' },
    subjects.map((subject) =>
      el(
        'button',
        {
          class: `chip ${state.subjectId === subject.id ? 'chip--active' : ''}`,
          onClick: () => {
            state.subjectId = subject.id;
            onChange();
          }
        },
        subject.name
      )
    )
  );

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
            onChange();
          }
        },
        sem.name
      )
    )
  );

  const entry = appState.activeGrades[gradeEntryKey(state.subjectId, state.semester)] || createEmptyGradeEntry(state.subjectId, state.semester);
  const result = computeSemesterAverage(entry);
  const subject = subjects.find((item) => item.id === state.subjectId);
  const goalValue = appState.goal.subjectGoals[state.subjectId];
  const semesterLabel = SEMESTERS.find((sem) => sem.id === state.semester).name;

  const statusBadgeClass =
    result.status === 'DA_DU_DU_LIEU' ? 'badge--success' : result.status === 'THIEU_DU_LIEU' ? 'badge--neutral' : 'badge--warning';

  const summaryCard = el('section', { class: 'card entry-summary' }, [
    el('div', { class: 'entry-summary__row' }, [el('h2', {}, `${subject.name} · ${semesterLabel}`), el('span', { class: `badge ${statusBadgeClass}` }, result.statusLabel)]),
    el('div', { class: 'entry-summary__score' }, formatScore(result.value)),
    el('p', { class: 'text-muted' }, result.isOfficial ? 'Điểm chính thức theo công thức Thông tư 22.' : 'Điểm tạm tính — cần đủ điểm giữa kỳ và cuối kỳ để có điểm chính thức.'),
    progressBar(result.progressPercent),
    goalValue !== undefined && goalValue !== null ? renderGoalCompare(result.value, goalValue) : null
  ]);

  async function commitEntry(nextEntry) {
    await appState.saveGradeEntry(nextEntry);
    onChange();
  }

  const txInputs = el(
    'div',
    { class: 'tx-grid' },
    Object.keys(entry.tx).map((slot) =>
      el('div', { class: 'tx-field' }, [
        el('label', {}, `TX${slot}`),
        el('input', {
          class: 'input input--number',
          type: 'number',
          min: '0',
          max: '10',
          step: '0.1',
          value: entry.tx[slot] ?? '',
          onChange: (event) => {
            const raw = event.target.value;
            const nextEntry = { ...entry, tx: { ...entry.tx, [slot]: raw === '' ? null : clampScore(Number(raw)) } };
            commitEntry(nextEntry);
          }
        })
      ])
    )
  );

  const gkCkInputs = el('div', { class: 'gkck-grid' }, [
    el('div', { class: 'tx-field' }, [
      el('label', {}, 'Giữa kỳ'),
      el('input', {
        class: 'input input--number',
        type: 'number',
        min: '0',
        max: '10',
        step: '0.1',
        value: entry.gk ?? '',
        onChange: (event) => {
          const raw = event.target.value;
          commitEntry({ ...entry, gk: raw === '' ? null : clampScore(Number(raw)) });
        }
      })
    ]),
    el('div', { class: 'tx-field' }, [
      el('label', {}, 'Cuối kỳ'),
      el('input', {
        class: 'input input--number',
        type: 'number',
        min: '0',
        max: '10',
        step: '0.1',
        value: entry.ck ?? '',
        onChange: (event) => {
          const raw = event.target.value;
          commitEntry({ ...entry, ck: raw === '' ? null : clampScore(Number(raw)) });
        }
      })
    ])
  ]);

  const entryFormCard = el('section', { class: 'card' }, [
    el('h3', {}, 'Điểm thường xuyên (tối đa 4 cột, không bắt buộc nhập đủ)'),
    txInputs,
    el('h3', { class: 'mt' }, 'Điểm định kỳ'),
    gkCkInputs
  ]);

  const predictionCard = renderPredictionCard(appState, state, entry, result, goalValue);

  return el('div', {}, [subjectChips, semesterToggle, summaryCard, entryFormCard, predictionCard]);
}

function renderGoalCompare(value, goalValue) {
  const comparison = compareToGoal(value, goalValue);
  if (!comparison) return null;
  const cls = comparison.achieved ? 'badge--success' : comparison.near ? 'badge--warning' : 'badge--danger';
  return el('p', { class: 'entry-summary__goal' }, [`Mục tiêu môn: ${goalValue} · `, el('span', { class: `badge ${cls}` }, comparison.label)]);
}

function renderPredictionCard(appState, state, entry, result, goalValue) {
  const sections = [el('h2', {}, [el('i', { class: 'fa-solid fa-wand-magic-sparkles' }), ' Dự đoán & thử kịch bản'])];

  if (txFilledCount(entry) < TX_SLOT_COUNT) {
    sections.push(renderWhatIfWidget(entry, goalValue));
  } else {
    sections.push(el('p', { class: 'text-muted' }, 'Đã đủ 4 cột điểm thường xuyên cho học kỳ này.'));
  }

  if (goalValue !== undefined && goalValue !== null) {
    if (entry.gk !== null && entry.gk !== undefined && (entry.ck === null || entry.ck === undefined)) {
      const ckNeeded = requiredCk(entry, goalValue);
      sections.push(renderRequiredScoreBox('Cần bao nhiêu điểm cuối kỳ để đạt mục tiêu môn này?', ckNeeded));
    }
    if (result.value !== null && result.value < goalValue) {
      const scenarios = generateRecoveryScenarios(entry, goalValue);
      if (scenarios.length > 0) {
        sections.push(
          el('div', { class: 'scenario-list' }, [
            el('p', {}, 'Kịch bản kéo điểm lên:'),
            ...scenarios.map((scenario) =>
              el(
                'div',
                { class: `scenario-chip ${scenario.closesGap ? 'scenario-chip--ok' : ''}` },
                `Nếu đạt ${scenario.hypothetical} → TB ${formatScore(scenario.resultValue)}${scenario.closesGap ? ' ✓ đạt mục tiêu' : ''}`
              )
            )
          ])
        );
      }
    }
  } else {
    sections.push(el('p', { class: 'text-muted' }, 'Đặt mục tiêu cho môn này ở tab Mục tiêu để xem dự đoán chi tiết hơn.'));
  }

  if (state.semester === 2 && appState.goal.yearAverageGoal) {
    const yearPrediction = requiredCkForYearGoal(state.subjectId, appState.activeGrades, appState.goal.yearAverageGoal);
    sections.push(renderYearPredictionBox(yearPrediction));
  }

  return el('section', { class: 'card prediction-card' }, sections);
}

function renderWhatIfWidget(entry, goalValue) {
  const slider = el('input', { type: 'range', min: '0', max: '10', step: '0.1', value: '8', class: 'slider' });
  const valueTag = el('span', { class: 'whatif-value' }, '8.0');
  const output = el('div', { class: 'whatif-result' });

  function update() {
    const hypothetical = Number(slider.value);
    valueTag.textContent = formatScore(hypothetical);
    const simulation = simulateAddTxScore(entry, hypothetical);
    clear(output);
    if (simulation.after.value === null) {
      output.append(el('p', {}, 'Chưa thể tính điểm trung bình.'));
      return;
    }
    output.append(el('p', {}, `Điểm trung bình mới: ${formatScore(simulation.after.value)} (${formatSigned(simulation.delta)})`));
    if (goalValue !== undefined && goalValue !== null) {
      const meets = simulation.after.value >= goalValue;
      output.append(el('p', { class: meets ? 'text-success' : 'text-warning' }, meets ? 'Đủ để đạt mục tiêu môn này ✓' : 'Vẫn chưa đạt mục tiêu môn này'));
    }
  }

  slider.addEventListener('input', update);
  update();

  return el('div', { class: 'whatif-widget' }, [el('label', {}, ['Thử nhập một điểm thường xuyên mới: ', valueTag]), slider, output]);
}

function renderRequiredScoreBox(title, resultObj) {
  if (resultObj.possible === null) return el('p', { class: 'text-muted' }, resultObj.reason);
  if (resultObj.possible === false) {
    return el('p', { class: 'text-danger' }, [el('i', { class: 'fa-solid fa-circle-exclamation' }), ` ${resultObj.reason}`]);
  }
  return el('div', { class: 'required-box' }, [
    el('p', {}, title),
    el('span', { class: 'required-box__value' }, formatScore(resultObj.value)),
    resultObj.guaranteed ? el('p', { class: 'text-success' }, 'Mục tiêu đã chắc chắn đạt được!') : null
  ]);
}

function renderYearPredictionBox(pred) {
  if (pred.possible === null) return el('p', { class: 'text-muted' }, pred.reason);
  const box = [el('h3', {}, 'Dự đoán cho mục tiêu cả năm')];
  if (pred.possible === false) {
    box.push(el('p', { class: 'text-danger' }, [el('i', { class: 'fa-solid fa-circle-exclamation' }), ` ${pred.reason || 'Mục tiêu cả năm không còn khả thi.'}`]));
    return el('div', {}, box);
  }
  box.push(el('p', {}, `Cần trung bình học kỳ II khoảng ${formatScore(pred.neededHk2)} để đạt mục tiêu cả năm.`));
  if (pred.mode === 'ck-only') {
    box.push(el('p', {}, `→ Cụ thể, điểm cuối kỳ II cần đạt khoảng ${formatScore(pred.value)}.`));
  } else if (pred.mode === 'both-missing') {
    box.push(el('p', {}, `→ Giữa kỳ và cuối kỳ II nên đạt trung bình khoảng ${formatScore(pred.approxEach)} mỗi bài.`));
  }
  if (pred.guaranteed) box.push(el('p', { class: 'text-success' }, 'Mục tiêu cả năm gần như chắc chắn đạt được!'));
  return el('div', {}, box);
}

function renderPassFailSection(appState) {
  const rows = [];
  PASS_FAIL_SUBJECTS.forEach((subject) => {
    SEMESTERS.forEach((sem) => {
      const key = gradeEntryKey(subject.id, sem.id);
      const entry = appState.passFail[key] || createEmptyPassFailEntry(subject.id, sem.id);
      const select = el(
        'select',
        { class: 'input' },
        [el('option', { value: '' }, '— Chưa đánh giá —'), ...PASS_FAIL_LEVELS.map((level) => el('option', { value: level }, level))]
      );
      select.value = entry.result || '';
      select.addEventListener('change', async () => {
        await appState.savePassFailEntry({ ...entry, result: select.value || null });
        showToast('Đã lưu.', 'success');
      });
      rows.push(el('div', { class: 'passfail-row' }, [el('span', {}, `${subject.name} · ${sem.name}`), select]));
    });
  });
  return el('section', { class: 'card' }, [el('h2', {}, 'Các môn đánh giá Đạt / Chưa đạt'), el('div', { class: 'passfail-grid' }, rows)]);
}

function renderConductSection(appState) {
  const rows = CONDUCT_ITEMS.map((item) => {
    const entry = appState.conduct[item.id] || createEmptyConductEntry(item.id, item.semester);
    const select = el('select', { class: 'input' }, [
      el('option', { value: '' }, '— Chưa đánh giá —'),
      ...CONDUCT_LEVELS.map((level) => el('option', { value: level }, level))
    ]);
    select.value = entry.level || '';
    select.addEventListener('change', async () => {
      await appState.saveConductEntry({ ...entry, level: select.value || null });
      showToast('Đã lưu.', 'success');
    });
    return el('div', { class: 'passfail-row' }, [el('span', {}, item.name), select]);
  });
  return el('section', { class: 'card' }, [el('h2', {}, 'Hạnh kiểm'), el('div', { class: 'passfail-grid' }, rows)]);
}
