export const APP_NAME = 'Sổ Điểm THCS';

export const APP_VERSION = '1.0.0';

export const EDUCATION_LEVELS = [
  { id: 'tieuhoc', label: 'Tiểu học', status: 'beta' },
  { id: 'thcs', label: 'Trung học cơ sở', status: 'active' },
  { id: 'thpt', label: 'Trung học phổ thông', status: 'beta' },
  { id: 'daihoc', label: 'Đại học', status: 'beta' }
];

export const USER_ROLES = [
  { id: 'hocsinh', label: 'Học sinh', status: 'active' },
  { id: 'giaovien', label: 'Giáo viên', status: 'beta' },
  { id: 'phuhuynh', label: 'Phụ huynh', status: 'beta' }
];

export const ENTRY_MODES = {
  QUICK: 'quick',
  SAVED: 'saved'
};

export const STORAGE_KEYS = {
  PROFILE: 'profile',
  SUBJECT_NAMES: 'subject_names',
  GRADES: 'grades',
  PASS_FAIL: 'pass_fail',
  CONDUCT: 'conduct',
  GOALS: 'goals',
  ABSENCES: 'absences',
  HISTORY: 'history',
  SETTINGS: 'settings',
  ONBOARDING_DONE: 'onboarding_done',
  CHAT_LOG: 'chat_log'
};

export const STORAGE_DB_NAME = 'thcs_grade_app_db';

export const STORAGE_DB_VERSION = 1;

export const GEMINI_DEFAULTS = {
  model: 'gemini-3.5-flash',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  temperature: 0.6,
  maxOutputTokens: 1024
};

export const GOOGLE_CLIENT_ID = '8772827804-vtfggm9m3lr5dt8tb3amk6vt3v4et6r3.apps.googleusercontent.com';

export const THEME_STORAGE_KEY = 'thcs_theme_preference';

export const STALE_DATA_DAYS = 7;

export const TABS = [
  { id: 'home', label: 'Trang chủ', icon: 'fa-house' },
  { id: 'goals', label: 'Mục tiêu', icon: 'fa-bullseye' },
  { id: 'grades', label: 'Nhập điểm', icon: 'fa-pen-to-square' },
  { id: 'charts', label: 'Biểu đồ', icon: 'fa-chart-column' },
  { id: 'ai', label: 'AI phân tích', icon: 'fa-wand-magic-sparkles' },
  { id: 'absence', label: 'Nghỉ học', icon: 'fa-calendar-xmark' },
  { id: 'history', label: 'Lịch sử', icon: 'fa-clock-rotate-left' },
  { id: 'settings', label: 'Cài đặt', icon: 'fa-gear' },
  { id: 'export', label: 'Xuất dữ liệu', icon: 'fa-file-export' }
];
