import { ENTRY_STATUS } from './scoringEngine.js';
import { CONDUCT_ITEMS } from '../config/subjects.config.js';
import { daysSince } from '../utils/date.js';

const ABSENCE_REVIEW_INTERVAL_DAYS = 14;

export function generateTodoList({ subjectResults, goal, conductMap, lastAbsenceCheckAt }) {
  const todos = [];

  subjectResults.forEach(({ subject, hk1, hk2 }) => {
    [['I', hk1], ['II', hk2]].forEach(([label, semResult]) => {
      if (semResult.status !== ENTRY_STATUS.DA_DU_DU_LIEU) {
        todos.push({
          id: `todo_grade_${subject.id}_${label}`,
          category: 'diem',
          icon: 'fa-pen',
          message: `Nhập thêm điểm môn ${subject.name} - học kỳ ${label}`,
          subjectId: subject.id
        });
      }
    });
  });

  if (!goal || !goal.studentTypeId) {
    todos.push({
      id: 'todo_goal_tier',
      category: 'muctieu',
      icon: 'fa-bullseye',
      message: 'Chọn loại học sinh mục tiêu cho năm học này'
    });
  }
  if (!goal || goal.yearAverageGoal === null || goal.yearAverageGoal === undefined) {
    todos.push({
      id: 'todo_goal_year',
      category: 'muctieu',
      icon: 'fa-bullseye',
      message: 'Đặt mục tiêu điểm trung bình cả năm'
    });
  }

  CONDUCT_ITEMS.forEach((item) => {
    const entry = conductMap ? conductMap[item.id] : null;
    if (!entry || !entry.level) {
      todos.push({
        id: `todo_conduct_${item.id}`,
        category: 'hanhkiem',
        icon: 'fa-user-check',
        message: `Cập nhật ${item.name}`
      });
    }
  });

  if (!lastAbsenceCheckAt || daysSince(lastAbsenceCheckAt) >= ABSENCE_REVIEW_INTERVAL_DAYS) {
    todos.push({
      id: 'todo_absence_review',
      category: 'nghihoc',
      icon: 'fa-calendar-check',
      message: 'Kiểm tra và cập nhật số buổi nghỉ học gần đây (nếu có)'
    });
  }

  return todos;
}
