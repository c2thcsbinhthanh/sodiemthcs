export function createAbsenceEntry({ type, semester, date = null, note = '' }) {
  const timestamp = new Date().toISOString();
  return {
    id: `absence_${Date.now()}_${Math.round(Math.random() * 10000)}`,
    type,
    semester,
    date: date || timestamp.slice(0, 10),
    note,
    createdAt: timestamp
  };
}
