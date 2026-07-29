import { buildFileName } from './jsonExport.js';
import { removeDiacritics, formatScore } from '../utils/format.js';

export function exportPdf({ subjectResults, overallAverage, goal, profile }) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('Thư viện xuất PDF chưa sẵn sàng, hãy thử tải lại trang.');
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(removeDiacritics('BẢNG ĐIỂM HỌC SINH THCS'), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const studentLine = profile?.name
    ? `Hoc sinh: ${removeDiacritics(profile.name)}${profile.className ? ` - Lop ${removeDiacritics(profile.className)}` : ''}`
    : 'Hoc sinh: (chua dat ten)';
  doc.text(studentLine, 14, 26);
  doc.text(
    `Diem trung binh ca nam: ${overallAverage.value !== null ? formatScore(overallAverage.value) : 'chua du du lieu'}`,
    14,
    33
  );
  if (goal?.yearAverageGoal) {
    doc.text(`Muc tieu ca nam: ${goal.yearAverageGoal}`, 14, 40);
  }

  const body = subjectResults.map((result) => [
    removeDiacritics(result.subject.name),
    result.hk1.value !== null ? formatScore(result.hk1.value) : '-',
    result.hk2.value !== null ? formatScore(result.hk2.value) : '-',
    result.year.value !== null ? formatScore(result.year.value) : '-',
    goal?.subjectGoals?.[result.subject.id] ?? '-'
  ]);

  doc.autoTable({
    startY: goal?.yearAverageGoal ? 46 : 40,
    head: [['Mon hoc', 'HK1', 'HK2', 'Ca nam', 'Muc tieu']],
    body,
    headStyles: { fillColor: [14, 124, 107] },
    styles: { font: 'helvetica', fontSize: 10 }
  });

  doc.setFontSize(8);
  doc.text(
    'Ghi chu: ban PDF hien thi tieng Viet khong dau do gioi han font chuan. Ban Excel/JSON co day du dau tieng Viet.',
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  doc.save(buildFileName('pdf'));
}
