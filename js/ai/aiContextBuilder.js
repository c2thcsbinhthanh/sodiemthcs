import { formatScore } from '../utils/format.js';

export function buildSystemInstruction(profile) {
  const who = profile?.name ? `Học sinh tên ${profile.name}` : 'Một học sinh THCS';
  return [
    'Bạn là trợ lý học tập AI trong ứng dụng quản lý điểm dành cho học sinh trung học cơ sở tại Việt Nam.',
    `${who} đang trò chuyện với bạn.`,
    'Toàn bộ điểm số, phần trăm và số liệu trong phần "DỮ LIỆU HỆ THỐNG" bên dưới đã được phần mềm tính sẵn theo đúng công thức của Thông tư 22/2021/TT-BGDĐT.',
    'Bạn không được tự tính lại, ước lượng lại hoặc đưa ra con số khác với dữ liệu đã cho.',
    'Nhiệm vụ của bạn: giải thích kết quả, đưa ra lời khuyên học tập cụ thể, phân tích điểm mạnh và điểm yếu, giải thích nguyên nhân điểm tăng hoặc giảm, gợi ý môn nên ưu tiên, và nhận định khả năng đạt mục tiêu bằng ngôn ngữ dễ hiểu.',
    'Giọng văn gần gũi, ngắn gọn, tích cực và khích lệ, phù hợp với học sinh THCS. Luôn trả lời bằng tiếng Việt.'
  ].join(' ');
}

export function buildDataContext({ subjectResults, overallAverage, goal, absenceSummary, ranking }) {
  const lines = ['DỮ LIỆU HỆ THỐNG:'];

  lines.push(
    `Điểm trung bình cả năm hiện tại: ${overallAverage.value !== null ? formatScore(overallAverage.value) : 'chưa đủ dữ liệu'} (${overallAverage.isOfficial ? 'chính thức' : 'tạm tính'})`
  );
  if (goal?.yearAverageGoal) lines.push(`Mục tiêu điểm trung bình cả năm: ${goal.yearAverageGoal}`);
  if (goal?.studentTypeId) lines.push(`Loại học sinh mục tiêu đã chọn: ${goal.studentTypeId}`);

  lines.push('Chi tiết từng môn (HK1 / HK2 / Cả năm):');
  subjectResults.forEach(({ subject, hk1, hk2, year }) => {
    const goalValue = goal?.subjectGoals?.[subject.id];
    const goalText = goalValue !== null && goalValue !== undefined ? `, mục tiêu môn=${goalValue}` : '';
    lines.push(
      `- ${subject.name}: HK1=${hk1.value ?? 'chưa có'} (${hk1.statusLabel}), HK2=${hk2.value ?? 'chưa có'} (${hk2.statusLabel}), Cả năm=${year.value ?? 'chưa có'}${goalText}`
    );
  });

  if (ranking?.strongest) lines.push(`Môn mạnh nhất hiện tại: ${ranking.strongest.subject.name}`);
  if (ranking?.weakest) lines.push(`Môn yếu nhất hiện tại: ${ranking.weakest.subject.name}`);
  if (ranking?.mostNeedsImprovement) {
    lines.push(`Môn đang lệch xa mục tiêu nhất: ${ranking.mostNeedsImprovement.subject.name}`);
  }

  if (absenceSummary) {
    lines.push(
      `Nghỉ học cả năm: tổng ${absenceSummary.yearTotal} buổi (có phép: ${absenceSummary.byType.co_phep}, không phép: ${absenceSummary.byType.khong_phep}, ra về giữa buổi: ${absenceSummary.byType.ve_som}).`
    );
  }

  return lines.join('\n');
}
