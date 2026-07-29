export const ABSENCE_TYPES = [
  { id: 'co_phep', label: 'Nghỉ có phép', unit: 1, icon: 'fa-file-circle-check', color: 'info' },
  { id: 'khong_phep', label: 'Nghỉ không phép', unit: 1, icon: 'fa-file-circle-xmark', color: 'danger' },
  { id: 've_som', label: 'Ra về giữa buổi', unit: 0.5, icon: 'fa-person-walking-arrow-right', color: 'warning' }
];

export const ABSENCE_THRESHOLDS = {
  yearWarning: 30,
  yearDanger: 45,
  semesterWarning: 18
};

export function findAbsenceTypeById(typeId) {
  return ABSENCE_TYPES.find((type) => type.id === typeId) || null;
}

export function unitOf(typeId) {
  const type = findAbsenceTypeById(typeId);
  return type ? type.unit : 1;
}
