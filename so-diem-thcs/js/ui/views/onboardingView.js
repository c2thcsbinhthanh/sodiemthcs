import { el, qs, clear } from '../../utils/dom.js';
import { createStudentProfile } from '../../models/student.model.js';
import { EDUCATION_LEVELS, USER_ROLES, ENTRY_MODES, GOOGLE_CLIENT_ID } from '../../config/app.config.js';
import { confirmAction, alertInfo } from '../modal.js';
import { showToast } from '../toast.js';
import { initGoogleAuth, renderGoogleButton } from '../../auth/googleAuth.js';

export function createOnboardingView(context) {
  const { appState, navigate } = context;
  let step = 1;
  const draft = {
    mode: null,
    name: '',
    className: '',
    level: 'thcs',
    role: 'hocsinh',
    authProvider: null,
    email: null,
    avatarUrl: null
  };

  async function render(container) {
    clear(container);
    container.append(el('div', { class: 'onboarding-shell' }, [renderStep(container)]));
  }

  function renderStep(container) {
    if (step === 1) return renderModeStep(container);
    if (step === 2) return renderInfoStep(container);
    if (step === 3) return renderLevelStep(container);
    if (step === 4) return renderRoleStep(container);
    return renderInfoStep(container);
  }

  function goToStep(container, next) {
    step = next;
    clear(container);
    container.append(el('div', { class: 'onboarding-shell' }, [renderStep(container)]));
  }

  function renderModeStep(container) {
    return el('div', { class: 'onboarding-step' }, [
      el('div', { class: 'onboarding-badge' }, [el('i', { class: 'fa-solid fa-graduation-cap' })]),
      el('h1', { class: 'onboarding-title' }, 'Chào mừng đến với Sổ Điểm THCS'),
      el('p', { class: 'onboarding-subtitle' }, 'Bạn muốn bắt đầu như thế nào?'),
      el('div', { class: 'onboarding-choices' }, [
        el(
          'button',
          {
            class: 'choice-card',
            onClick: () => {
              draft.mode = ENTRY_MODES.QUICK;
              goToStep(container, 2);
            }
          },
          [
            el('i', { class: 'fa-solid fa-bolt choice-card__icon' }),
            el('h3', {}, 'Tính điểm ngay'),
            el('p', {}, 'Không cần đăng nhập, dữ liệu lưu tạm trên trình duyệt này.')
          ]
        ),
        el('button', { class: 'choice-card', onClick: () => handleSavedMode(container) }, [
          el('i', { class: 'fa-solid fa-cloud-arrow-up choice-card__icon' }),
          el('h3', {}, 'Lưu dữ liệu lâu dài'),
          el('p', {}, 'Đăng nhập bằng Google để đồng bộ và lưu trữ lâu dài.')
        ])
      ])
    ]);
  }

  async function handleSavedMode(container) {
    draft.mode = ENTRY_MODES.SAVED;
    clear(container);
    const googleContainerId = 'google-signin-button';
    container.append(
      el('div', { class: 'onboarding-step' }, [
        el('h1', { class: 'onboarding-title' }, 'Đăng nhập bằng Google'),
        el('p', { class: 'onboarding-subtitle' }, 'Đăng nhập để đồng bộ và lưu điểm lâu dài trên nhiều thiết bị.'),
        el('div', { id: googleContainerId, class: 'google-button-slot' }),
        el('div', { class: 'onboarding-actions' }, [
          el('button', { class: 'btn btn--ghost', onClick: () => goToStep(container, 1) }, 'Quay lại'),
          el(
            'button',
            {
              class: 'btn btn--link',
              onClick: async () => {
                const proceed = await confirmAction({
                  title: 'Tiếp tục không cần đăng nhập?',
                  text: 'Dữ liệu sẽ chỉ lưu tạm trên trình duyệt này thay vì đồng bộ lâu dài.',
                  confirmText: 'Tiếp tục',
                  cancelText: 'Ở lại'
                });
                if (proceed) {
                  draft.mode = ENTRY_MODES.QUICK;
                  goToStep(container, 2);
                }
              }
            },
            'Bỏ qua, dùng chế độ nhanh'
          )
        ])
      ])
    );

    const clientId = (appState.settings && appState.settings.googleClientId) || GOOGLE_CLIENT_ID;
    if (!clientId) {
      await alertInfo({
        title: 'Chưa cấu hình Google Sign-In',
        text: 'Ứng dụng chưa được gắn Google Client ID. Bạn có thể dùng chế độ Tính điểm ngay, hoặc nhờ người phát triển thêm Client ID vào cấu hình.',
        icon: 'info'
      });
      return;
    }
    const ready = initGoogleAuth(clientId, (user, error) => {
      if (error || !user) {
        showToast('Đăng nhập thất bại, hãy thử lại.', 'error');
        return;
      }
      draft.authProvider = 'google';
      draft.email = user.email;
      draft.avatarUrl = user.avatarUrl;
      draft.name = draft.name || user.name;
      goToStep(container, 2);
    });
    if (ready) renderGoogleButton(qs(`#${googleContainerId}`));
  }

  function renderInfoStep(container) {
    const nameInput = el('input', { class: 'input', type: 'text', placeholder: 'Ví dụ: Nguyễn Văn A', value: draft.name });
    const classInput = el('input', { class: 'input', type: 'text', placeholder: 'Ví dụ: 8A2', value: draft.className });
    return el('div', { class: 'onboarding-step' }, [
      el('h1', { class: 'onboarding-title' }, 'Thông tin của bạn'),
      el('p', { class: 'onboarding-subtitle' }, 'Không bắt buộc, bạn có thể để trống và bổ sung sau.'),
      el('label', { class: 'field-label' }, 'Tên'),
      nameInput,
      el('label', { class: 'field-label' }, 'Lớp'),
      classInput,
      el('div', { class: 'onboarding-actions' }, [
        el('button', { class: 'btn btn--ghost', onClick: () => goToStep(container, 1) }, 'Quay lại'),
        el(
          'button',
          {
            class: 'btn btn--primary',
            onClick: () => {
              draft.name = nameInput.value.trim();
              draft.className = classInput.value.trim();
              goToStep(container, 3);
            }
          },
          ['Tiếp tục ', el('i', { class: 'fa-solid fa-arrow-right' })]
        )
      ])
    ]);
  }

  function renderLevelStep(container) {
    return el('div', { class: 'onboarding-step' }, [
      el('h1', { class: 'onboarding-title' }, 'Chọn cấp học'),
      el('p', { class: 'onboarding-subtitle' }, 'Trung học cơ sở đang hoạt động đầy đủ, các cấp khác đang ở chế độ Beta.'),
      el(
        'div',
        { class: 'onboarding-grid' },
        EDUCATION_LEVELS.map((level) =>
          el(
            'button',
            {
              class: `option-card ${draft.level === level.id ? 'option-card--selected' : ''}`,
              onClick: async () => {
                if (level.status === 'beta') {
                  const proceed = await confirmAction({
                    title: `${level.label} đang ở chế độ Beta`,
                    text: 'Một số tính năng có thể chưa khả dụng đầy đủ cho cấp học này. Bạn có muốn tiếp tục?',
                    confirmText: 'Tiếp tục',
                    cancelText: 'Chọn cấp khác'
                  });
                  if (!proceed) return;
                }
                draft.level = level.id;
                goToStep(container, 4);
              }
            },
            [
              el(
                'span',
                { class: `status-pill ${level.status === 'active' ? 'status-pill--active' : 'status-pill--beta'}` },
                level.status === 'active' ? 'Hoạt động' : 'Beta'
              ),
              el('h3', {}, level.label)
            ]
          )
        )
      ),
      el('button', { class: 'btn btn--ghost', onClick: () => goToStep(container, 2) }, 'Quay lại')
    ]);
  }

  function renderRoleStep(container) {
    return el('div', { class: 'onboarding-step' }, [
      el('h1', { class: 'onboarding-title' }, 'Bạn là ai?'),
      el('p', { class: 'onboarding-subtitle' }, 'Vai trò Học sinh đang hoạt động đầy đủ, các vai trò khác đang ở chế độ Beta.'),
      el(
        'div',
        { class: 'onboarding-grid' },
        USER_ROLES.map((role) =>
          el(
            'button',
            {
              class: `option-card ${draft.role === role.id ? 'option-card--selected' : ''}`,
              onClick: async () => {
                if (role.status === 'beta') {
                  const proceed = await confirmAction({
                    title: `${role.label} đang ở chế độ Beta`,
                    text: 'Một số tính năng có thể chưa khả dụng đầy đủ cho vai trò này. Bạn có muốn tiếp tục?',
                    confirmText: 'Tiếp tục',
                    cancelText: 'Chọn vai trò khác'
                  });
                  if (!proceed) return;
                }
                draft.role = role.id;
                await finishOnboarding();
              }
            },
            [
              el(
                'span',
                { class: `status-pill ${role.status === 'active' ? 'status-pill--active' : 'status-pill--beta'}` },
                role.status === 'active' ? 'Hoạt động' : 'Beta'
              ),
              el('h3', {}, role.label)
            ]
          )
        )
      ),
      el('button', { class: 'btn btn--ghost', onClick: () => goToStep(container, 3) }, 'Quay lại')
    ]);
  }

  async function finishOnboarding() {
    const profile = createStudentProfile(draft);
    await appState.saveProfile(profile);
    await appState.setOnboardingDone(true);
    showToast('Thiết lập hoàn tất, chúc bạn học tốt!', 'success');
    navigate('home');
  }

  return { render };
}
