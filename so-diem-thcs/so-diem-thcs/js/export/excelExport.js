import { downloadBlob, buildFileName } from './jsonExport.js';

export function exportExcel({ subjectResults, overallAverage, goal, profile, absenceSummary }) {
  if (!window.XLSX) {
    throw new Error('Thư viện xuất Excel chưa sẵn sàng, hãy thử tải lại trang.');
  }

  const summaryRows = [
    { 'Thông tin': 'Học sinh', 'Giá trị': profile?.name || '(chưa đặt tên)' },
    { 'Thông tin': 'Lớp', 'Giá trị': profile?.className || '' },
    { 'Thông tin': 'Điểm trung bình cả năm', 'Giá trị': overallAverage.value ?? 'Chưa đủ dữ liệu' },
    { 'Thông tin': 'Mục tiêu cả năm', 'Giá trị': goal?.yearAverageGoal ?? '' },
    { 'Thông tin': 'Tổng buổi nghỉ học', 'Giá trị': absenceSummary?.yearTotal ?? 0 }
  ];

  const subjectRows = subjectResults.map((result) => ({
    'Môn học': result.subject.name,
    'HK1': result.hk1.value ?? '',
    'Trạng thái HK1': result.hk1.statusLabel,
    'HK2': result.hk2.value ?? '',
    'Trạng thái HK2': result.hk2.statusLabel,
    'Cả năm': result.year.value ?? '',
    'Mục tiêu môn': goal?.subjectGoals?.[result.subject.id] ?? ''
  }));

  const workbook = window.XLSX.utils.book_new();
  const summarySheet = window.XLSX.utils.json_to_sheet(summaryRows);
  const subjectSheet = window.XLSX.utils.json_to_sheet(subjectRows);
  window.XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tong quan');
  window.XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Bang diem');

  const arrayBuffer = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  downloadBlob(blob, buildFileName('xlsx'));
}
