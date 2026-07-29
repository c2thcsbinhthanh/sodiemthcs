import { el, clear } from '../../utils/dom.js';
import { exportJson } from '../../export/jsonExport.js';
import { exportExcel } from '../../export/excelExport.js';
import { exportPdf } from '../../export/pdfExport.js';
import { readJsonFile, validateSnapshot } from '../../export/importHandler.js';
import { showToast } from '../toast.js';
import { confirmAction, alertInfo } from '../modal.js';

export function createExportView(context) {
  const { appState, navigate } = context;

  async function render(container) {
    clear(container);

    const exportJsonBtn = el(
      'button',
      {
        class: 'export-btn',
        onClick: async () => {
          const snapshot = await appState.exportSnapshot();
          exportJson(snapshot);
          showToast('Đã xuất tệp JSON.', 'success');
        }
      },
      [el('i', { class: 'fa-solid fa-file-code' }), el('span', {}, 'Xuất JSON')]
    );

    const exportExcelBtn = el(
      'button',
      {
        class: 'export-btn',
        onClick: async () => {
          try {
            exportExcel({
              subjectResults: appState.computeSubjectResults(),
              overallAverage: appState.computeOverallAverage(),
              goal: appState.goal,
              profile: appState.profile,
              absenceSummary: appState.computeAbsenceSummary()
            });
            showToast('Đã xuất tệp Excel.', 'success');
          } catch (error) {
            await alertInfo({ title: 'Không thể xuất Excel', text: error.message, icon: 'error' });
          }
        }
      },
      [el('i', { class: 'fa-solid fa-file-excel' }), el('span', {}, 'Xuất Excel')]
    );

    const exportPdfBtn = el(
      'button',
      {
        class: 'export-btn',
        onClick: async () => {
          try {
            exportPdf({
              subjectResults: appState.computeSubjectResults(),
              overallAverage: appState.computeOverallAverage(),
              goal: appState.goal,
              profile: appState.profile
            });
            showToast('Đã xuất tệp PDF.', 'success');
          } catch (error) {
            await alertInfo({ title: 'Không thể xuất PDF', text: error.message, icon: 'error' });
          }
        }
      },
      [el('i', { class: 'fa-solid fa-file-pdf' }), el('span', {}, 'Xuất PDF')]
    );

    const fileInput = el('input', { type: 'file', accept: 'application/json', class: 'file-input-hidden' });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      try {
        const data = await readJsonFile(file);
        const validation = validateSnapshot(data);
        if (!validation.valid) {
          await alertInfo({ title: 'Tệp không hợp lệ', text: validation.reason, icon: 'error' });
          return;
        }
        const confirmed = await confirmAction({
          title: 'Nhập dữ liệu?',
          text: 'Dữ liệu hiện tại sẽ được ghi đè bởi nội dung trong tệp này.',
          confirmText: 'Nhập dữ liệu',
          danger: true
        });
        if (!confirmed) return;
        await appState.importSnapshot(data);
        showToast('Đã nhập dữ liệu thành công.', 'success');
        navigate('home');
      } catch (error) {
        await alertInfo({ title: 'Không thể nhập dữ liệu', text: error.message, icon: 'error' });
      }
      fileInput.value = '';
    });

    const importBtn = el('button', { class: 'export-btn export-btn--import', onClick: () => fileInput.click() }, [
      el('i', { class: 'fa-solid fa-file-import' }),
      el('span', {}, 'Nhập từ JSON')
    ]);

    container.append(
      el('h1', { class: 'view-title' }, 'Xuất dữ liệu'),
      el('section', { class: 'card' }, [
        el('h2', {}, 'Sao lưu dữ liệu'),
        el('p', { class: 'text-muted' }, 'Xuất toàn bộ điểm số, mục tiêu, nghỉ học và lịch sử để sao lưu hoặc chuyển sang máy khác.'),
        el('div', { class: 'export-grid' }, [exportJsonBtn, exportExcelBtn, exportPdfBtn])
      ]),
      el('section', { class: 'card' }, [
        el('h2', {}, 'Khôi phục dữ liệu'),
        el('p', { class: 'text-muted' }, 'Nhập lại dữ liệu từ một tệp JSON đã xuất trước đó.'),
        importBtn,
        fileInput
      ])
    );
  }

  return { render };
}
