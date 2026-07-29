export function createEmptyGoal() {
  return {
    studentTypeId: null,
    yearAverageGoal: null,
    subjectGoals: {},
    updatedAt: null
  };
}

export function setSubjectGoal(goal, subjectId, value) {
  return {
    ...goal,
    subjectGoals: { ...goal.subjectGoals, [subjectId]: value },
    updatedAt: new Date().toISOString()
  };
}

export function hasAnyGoal(goal) {
  if (!goal) return false;
  if (goal.studentTypeId || goal.yearAverageGoal) return true;
  return Object.values(goal.subjectGoals || {}).some((value) => value !== null && value !== undefined);
}
