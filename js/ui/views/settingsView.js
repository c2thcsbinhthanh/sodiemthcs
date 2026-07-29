import { el, clear } from '../../utils/dom.js';
import { CORE_SUBJECTS } from '../../config/subjects.config.js';
import { GEMINI_DEFAULTS, APP_VERSION } from '../../config/app.config.js';
import { toggleTheme, currentTheme } from '../theme.js';
import { showToast } from '../toast.js';
import { confirmAction } from '../modal.js';

const GEMINI_MODEL_OPTIONS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

export function createSettingsView(context) {
  const { appState, navigate } = context;

  async function render(container) {
    paint(container);
  }

  function paint(container) {
    clear(container);

    const themeToggleBtn = el(
      'button',
      { class: 'toggle-switch' },
      [el('i', { class: `fa-solid ${currentTheme() === 'dark' ? 'fa-moon' : 'fa-sun'}` }), el('span', {}, currentTheme() === 'dark' ? 'Chế độ tối' : 'Chế độ sáng')]
    );
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
      paint(container);
    });

    const apiKeyInput = el('input', {
      class: 'input',
      type: 'password',
      placeholder: 'Dán khóa API Gemini của bạn',
      value: appState.settings.geminiApiKey || ''
    });
    const modelSelect = el('select', { class: 'input' }, GEMINI_MODEL_OPTIONS.map((model) => el('option', { value: model }, model)));
    modelSelect.value = appState.settings.geminiModel || GEMINI_DEFAULTS.model;

    const aiCard = el('section', { class: 'card' }, [
      el('h2', {}, 'Trợ lý AI (Gemini)'),
      el('p', { class: 'text-muted' }, 'Khóa API được lưu trên trình duyệt này và chỉ dùng để gọi trực tiếp tới Gemini.'),
      el('label', { class: 'field-label' }, 'Khóa API Gemini'),
      apiKeyInput,
      el('label', { class: 'field-label' }, 'Mô hình'),
      modelSelect,
      el(
        'button',
        {
          class: 'btn btn--primary',
          onClick: async () => {
            await appState.saveSettings({ ...appState.settings, geminiApiKey: apiKeyInput.value.trim(), geminiModel: modelSelect.value });
            showToast('Đã lưu cấu hình AI.', 'success');
          }
        },
        'Lưu cấu hình AI'
      )
    ]);

    const googleClientInput = el('input', {
      class: 'input',
      type: 'text',
      placeholder: 'Google OAuth Client ID (tùy chọn)',
      value: appState.settings.googleClientId || ''
    });
    const googleCard = el('section', { class: 'card' }, [
      el('h2', {}, 'Đăng nhập Google (nâng cao)'),
      el('p', { class: 'text-muted' }, 'Chỉ cần thiết nếu bạn muốn ghi đè Client ID mặc định của ứng dụng.'),
      googleClientInput,
      el(
        'button',
        {
          class: 'btn btn--ghost',
          onClick: async () => {
            await appState.saveSettings({ ...appState.settings, googleClientId: googleClientInput.value.trim() });
            showToast('Đã lưu cấu hình đăng nhập Google.', 'success');
          }
        },
        'Lưu'
      )
    ]);

    const subjectNameInputs = {};
    const subjectNameSection = el('section', { class: 'card' }, [
      el('h2', {}, 'Tên môn học'),
      el('p', { class: 'text-muted' }, 'Chỉnh sửa tên môn cho phù hợp với chương trình học thực tế của trường bạn.'),
      el(
        'div',
        { class: 'subject-name-grid' },
        CORE_SUBJECTS.map((subject) => {
          const input = el('input', { class: 'input', type: 'text', value: appState.subjectNameOverrides[subject.id] || subject.name });
          subjectNameInputs[subject.id] = input;
          return el('div', { class: 'subject-name-row' }, [el('label', {}, subject.name), input]);
        })
      ),
      el(
        'button',
        {
          class: 'btn btn--primary',
          onClick: async () => {
            const overrides = {};
            CORE_SUBJECTS.forEach((subject) => {
              const value = subjectNameInputs[subject.id].value.trim();
              if (value && value !== subject.name) overrides[subject.id] = value;
            });
            await appState.saveSubjectNameOverrides(overrides);
            showToast('Đã lưu tên môn học.', 'success');
          }
        },
        'Lưu tên môn học'
      )
    ]);

    const storageCard = el('section', { class: 'card' }, [
      el('h2', {}, 'Lưu trữ dữ liệu'),
      el('p', {}, ['Đang lưu bằng: ', el('strong', {}, appState.repository.backendName)]),
      el(
        'p',
        { class: 'text-muted' },
        'Kiến trúc ứng dụng cho phép thay thế bằng Firebase, Supabase, MySQL hoặc MongoDB thông qua lớp Repository mà không cần sửa logic nghiệp vụ.'
      )
    ]);

    const dangerCard = el('section', { class: 'card danger-card' }, [
      el('h2', {}, 'Xóa toàn bộ dữ liệu'),
      el('p', {}, 'Thao tác này sẽ xóa toàn bộ điểm số, mục tiêu, lịch sử nghỉ học và không thể hoàn tác.'),
      el(
        'button',
        {
          class: 'btn btn--danger',
          onClick: async () => {
            const confirmed = await confirmAction({
              title: 'Xóa toàn bộ dữ liệu?',
              text: 'Toàn bộ điểm số, mục tiêu và lịch sử sẽ bị xóa vĩnh viễn khỏi trình duyệt này.',
              danger: true,
              confirmText: 'Xóa tất cả'
            });
            if (confirmed) {
              await appState.resetAll();
              showToast('Đã xóa toàn bộ dữ liệu.', 'success');
              navigate('home');
            }
          }
        },
        'Xóa toàn bộ dữ liệu'
      )
    ]);

    container.append(
      el('h1', { class: 'view-title' }, 'Cài đặt'),
      el('section', { class: 'card' }, [el('h2', {}, 'Giao diện'), themeToggleBtn]),
      aiCard,
      googleCard,
      subjectNameSection,
      storageCard,
      dangerCard,
      el('p', { class: 'app-version' }, `Sổ Điểm THCS · phiên bản ${APP_VERSION}`)
    );
  }

  return { render };
}
