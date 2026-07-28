export const CORE_SUBJECTS = [
  { id: 'toan', name: 'Toán', icon: 'fa-square-root-variable' },
  { id: 'nguvan', name: 'Ngữ văn', icon: 'fa-book-open' },
  { id: 'tienganh', name: 'Tiếng Anh', icon: 'fa-language' },
  { id: 'khtn', name: 'Khoa học tự nhiên', icon: 'fa-flask' },
  { id: 'lichsudialy', name: 'Lịch sử và Địa lí', icon: 'fa-earth-asia' },
  { id: 'gdcd', name: 'Giáo dục công dân', icon: 'fa-scale-balanced' },
  { id: 'congnghe', name: 'Công nghệ', icon: 'fa-gears' },
  { id: 'tinhoc', name: 'Tin học', icon: 'fa-laptop-code' }
];

export const PASS_FAIL_SUBJECTS = [
  { id: 'gdtc', name: 'Giáo dục thể chất', icon: 'fa-person-running' },
  { id: 'amnhac', name: 'Âm nhạc', icon: 'fa-music' },
  { id: 'mythuat', name: 'Mỹ thuật', icon: 'fa-palette' },
  { id: 'trainghiem', name: 'Hoạt động trải nghiệm, hướng nghiệp', icon: 'fa-compass' },
  { id: 'diaphuong', name: 'Nội dung giáo dục địa phương', icon: 'fa-map-location-dot' }
];

export const CONDUCT_ITEMS = [
  { id: 'hanhkiem_hk1', name: 'Hạnh kiểm học kỳ I', semester: 1 },
  { id: 'hanhkiem_hk2', name: 'Hạnh kiểm học kỳ II', semester: 2 }
];

export const CONDUCT_LEVELS = ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'];

export const PASS_FAIL_LEVELS = ['Đạt', 'Chưa đạt'];

export const SEMESTERS = [
  { id: 1, name: 'Học kỳ I' },
  { id: 2, name: 'Học kỳ II' }
];

export function getAllScoredSubjects() {
  return [...CORE_SUBJECTS];
}

export function findSubjectById(subjectId) {
  return CORE_SUBJECTS.find((subject) => subject.id === subjectId) ||
    PASS_FAIL_SUBJECTS.find((subject) => subject.id === subjectId) ||
    null;
}
