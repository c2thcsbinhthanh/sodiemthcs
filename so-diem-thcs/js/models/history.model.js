export const HISTORY_CATEGORIES = {
  GRADE: 'grade',
  ABSENCE: 'absence',
  GOAL: 'goal',
  PROFILE: 'profile'
};

export function createHistoryEntry({ category, action, subjectId = null, description, before = null, after = null }) {
  return {
    id: `history_${Date.now()}_${Math.round(Math.random() * 10000)}`,
    category,
    action,
    subjectId,
    description,
    before,
    after,
    timestamp: new Date().toISOString()
  };
}
