import { AppState } from './state/appState.js';
import { LocalStorageAdapter } from './data/localStorageAdapter.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { Router } from './ui/router.js';
import { el, qs } from './utils/dom.js';
import { createOnboardingView } from './ui/views/onboardingView.js';
import { createHomeView } from './ui/views/homeView.js';
import { createGoalsView } from './ui/views/goalsView.js';
import { createGradesView } from './ui/views/gradesView.js';
import { createChartsView } from './ui/views/chartsView.js';
import { createAiView } from './ui/views/aiView.js';
import { createAbsenceView } from './ui/views/absenceView.js';
import { createHistoryView } from './ui/views/historyView.js';
import { createSettingsView } from './ui/views/settingsView.js';
import { createExportView } from './ui/views/exportView.js';

async function bootstrap() {
  initTheme();

  const appState = new AppState();
  await appState.init(new LocalStorageAdapter());

  const appShell = qs('#app-shell');
  const onboardingOutlet = qs('#onboarding-outlet');
  const globalSimBanner = qs('#global-sim-banner');

  const context = {
    appState,
    navigate: (tabId, params) => router.navigate(tabId, params)
  };

  const views = {
    home: createHomeView(context),
    goals: createGoalsView(context),
    grades: createGradesView(context),
    charts: createChartsView(context),
    ai: createAiView(context),
    absence: createAbsenceView(context),
    history: createHistoryView(context),
    settings: createSettingsView(context),
    export: createExportView(context)
  };

  const router = new Router({
    outletSelector: '#view-outlet',
    navSelector: '#nav-desktop',
    navSelectorMobile: '#nav-mobile',
    views
  });

  function updateGlobalSimBanner() {
    if (!globalSimBanner) return;
    if (appState.simulationMode) {
      globalSimBanner.hidden = false;
      globalSimBanner.replaceChildren(
        el('span', {}, [el('i', { class: 'fa-solid fa-flask' }), ' Đang ở chế độ giả lập — dữ liệu thật không bị ảnh hưởng']),
        el(
          'button',
          {
            class: 'btn btn--small btn--light',
            onClick: async () => {
              appState.exitSimulationMode();
              await router.refresh();
            }
          },
          'Thoát'
        )
      );
    } else {
      globalSimBanner.hidden = true;
    }
  }
  appState.subscribe(updateGlobalSimBanner);
  updateGlobalSimBanner();

  async function showApp() {
    onboardingOutlet.hidden = true;
    appShell.hidden = false;
    await router.navigate('home');
  }

  async function showOnboarding() {
    appShell.hidden = true;
    onboardingOutlet.hidden = false;
    const onboardingView = createOnboardingView({ appState, navigate: () => showApp() });
    await onboardingView.render(onboardingOutlet);
  }

  if (appState.onboardingDone && appState.profile) {
    await showApp();
  } else {
    await showOnboarding();
  }

  const loader = qs('#app-loader');
  if (loader) loader.remove();

  const themeToggleDesktop = qs('#theme-toggle-desktop');
  const themeToggleMobile = qs('#theme-toggle-mobile');
  [themeToggleDesktop, themeToggleMobile].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', () => toggleTheme());
  });
}

bootstrap().catch((error) => {
  console.error(error);
  const root = qs('#app-loader') || document.body;
  root.innerHTML = '<div class="fatal-error"><i class="fa-solid fa-triangle-exclamation"></i><p>Đã xảy ra lỗi khi khởi động ứng dụng. Vui lòng tải lại trang.</p></div>';
});
