import { el, clear } from '../../utils/dom.js';
import { formatScore } from '../../utils/format.js';
import { subjectCard } from '../components/subjectCard.js';

export function createHomeView(context) {
  const { appState, navigate } = context;

  async function render(container) {
    clear(container);
    const subjectResults = appState.computeSubjectResults();
    const overall = appState.computeOverallAverage();
    const ranking = appState.computeRanking();
    const todos = appState.computeTodoList();
    const notifications = appState.computeNotifications();
    const absenceSummary = appState.computeAbsenceSummary();
    const goal = appState.goal;

    const percent = overall.value !== null ? (overall.value / 10) * 100 : 0;

    const heroSection = el('section', { class: 'home-hero card' }, [
      renderProgressRing(percent),
      el('div', { class: 'home-hero__info' }, [
        appState.simulationMode
          ? el('p', { class: 'home-hero__eyebrow home-hero__eyebrow--sim' }, [
              el('i', { class: 'fa-solid fa-flask' }),
              ' ĐANG Ở CHẾ ĐỘ GIẢ LẬP'
            ])
          : el('p', { class: 'home-hero__eyebrow' }, 'Điểm trung bình cả năm'),
        el('h2', { class: 'home-hero__value' }, formatScore(overall.value)),
        el('p', { class: 'home-hero__meta' }, overall.isOfficial ? 'Đã đủ dữ liệu chính thức' : 'Đang tạm tính'),
        goal.yearAverageGoal
          ? el('p', { class: 'home-hero__goal' }, `Mục tiêu cả năm: ${goal.yearAverageGoal}`)
          : el('button', { class: 'btn btn--small btn--ghost', onClick: () => navigate('goals') }, 'Đặt mục tiêu ngay')
      ])
    ]);

    const statsRow = el('section', { class: 'home-stats' }, [
      statCard('fa-list-check', `${overall.countedSubjects}/${overall.totalSubjects}`, 'Môn đã có dữ liệu'),
      statCard('fa-calendar-xmark', `${absenceSummary.yearTotal}`, 'Buổi nghỉ cả năm'),
      statCard('fa-bell', `${notifications.length}`, 'Thông báo cần chú ý'),
      statCard('fa-list-ol', `${todos.length}`, 'Việc cần làm')
    ]);

    const rankingSection = renderRankingSection(ranking, navigate);
    const todoSection = renderTodoSection(todos);
    const notificationSection = renderNotificationSection(notifications);

    const subjectsSection = el('section', {}, [
      el('div', { class: 'section-header' }, [
        el('h2', {}, 'Tổng quan các môn'),
        el('button', { class: 'btn btn--ghost btn--small', onClick: () => navigate('grades') }, ['Nhập điểm ', el('i', { class: 'fa-solid fa-arrow-right' })])
      ]),
      el(
        'div',
        { class: 'subject-grid' },
        subjectResults.map((result) =>
          subjectCard(result, goal.subjectGoals[result.subject.id], (subjectId) => navigate('grades', { subjectId }))
        )
      )
    ]);

    container.append(heroSection, statsRow, rankingSection, todoSection, notificationSection, subjectsSection);
  }

  return { render };
}

function statCard(icon, value, label) {
  return el('div', { class: 'stat-card' }, [
    el('i', { class: `fa-solid ${icon} stat-card__icon` }),
    el('span', { class: 'stat-card__value' }, value),
    el('span', { class: 'stat-card__label' }, label)
  ]);
}

function renderRankingSection(ranking, navigate) {
  const items = [
    ['fa-trophy', 'Môn mạnh nhất', ranking.strongest],
    ['fa-arrow-trend-down', 'Môn yếu nhất', ranking.weakest],
    ['fa-bullseye', 'Gần đạt mục tiêu nhất', ranking.closestToGoal],
    ['fa-fire', 'Cần cải thiện nhất', ranking.mostNeedsImprovement]
  ];
  return el('section', { class: 'card ranking-card' }, [
    el('h2', {}, 'Xếp hạng nội bộ'),
    el(
      'div',
      { class: 'ranking-grid' },
      items.map(([icon, label, result]) =>
        el(
          'button',
          { class: 'ranking-item', onClick: () => result && navigate('grades', { subjectId: result.subject.id }) },
          [
            el('i', { class: `fa-solid ${icon}` }),
            el('span', { class: 'ranking-item__label' }, label),
            el('span', { class: 'ranking-item__value' }, result ? result.subject.name : 'Chưa đủ dữ liệu')
          ]
        )
      )
    )
  ]);
}

function renderTodoSection(todos) {
  if (todos.length === 0) {
    return el('section', { class: 'card' }, [
      el('h2', {}, 'Việc cần làm'),
      el('p', { class: 'empty-state' }, [el('i', { class: 'fa-solid fa-circle-check' }), ' Bạn đã hoàn thành mọi việc!'])
    ]);
  }
  return el('section', { class: 'card' }, [
    el('h2', {}, `Việc cần làm (${todos.length})`),
    el(
      'ul',
      { class: 'todo-list' },
      todos.slice(0, 6).map((todo) => el('li', { class: 'todo-item' }, [el('i', { class: `fa-solid ${todo.icon}` }), el('span', {}, todo.message)]))
    )
  ]);
}

function renderNotificationSection(notifications) {
  if (notifications.length === 0) return el('div', {});
  return el('section', { class: 'card' }, [
    el('h2', {}, 'Thông báo thông minh'),
    el(
      'ul',
      { class: 'notification-list' },
      notifications
        .slice(0, 6)
        .map((notification) =>
          el('li', { class: `notification-item notification-item--${notification.severity}` }, [
            el('i', { class: `fa-solid ${notification.icon}` }),
            el('span', {}, notification.message)
          ])
        )
    )
  ]);
}

function renderProgressRing(percent) {
  const radius = 76;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const wrapper = el('div', { class: 'progress-ring-wrap' });
  wrapper.innerHTML = `
    <svg width="180" height="180" viewBox="0 0 180 180" class="progress-ring">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--color-primary)" />
          <stop offset="100%" stop-color="var(--color-gold)" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="${normalizedRadius}" class="progress-ring__track" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="90" cy="90" r="${normalizedRadius}" class="progress-ring__fill" stroke-width="${stroke}" fill="none"
        stroke-linecap="round"
        stroke-dasharray="${circumference} ${circumference}"
        style="stroke-dashoffset:${circumference}"
        transform="rotate(-90 90 90)"></circle>
    </svg>
  `;
  const fillCircle = wrapper.querySelector('.progress-ring__fill');
  const target = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fillCircle.style.strokeDashoffset = String(target);
    });
  });
  return wrapper;
}
