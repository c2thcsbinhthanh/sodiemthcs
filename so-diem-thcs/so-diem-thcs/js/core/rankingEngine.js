import { compareToGoal } from './scoringEngine.js';

export function rankSubjects(subjectResults, goal, field = 'year') {
  const withValues = subjectResults.filter((result) => result[field].value !== null);
  if (withValues.length === 0) {
    return { strongest: null, weakest: null, closestToGoal: null, mostNeedsImprovement: null };
  }

  const sortedByValue = [...withValues].sort((a, b) => b[field].value - a[field].value);
  const strongest = sortedByValue[0];
  const weakest = sortedByValue[sortedByValue.length - 1];

  let closestToGoal = null;
  let mostNeedsImprovement = null;

  if (goal && goal.subjectGoals) {
    const withGoalGap = withValues
      .map((result) => {
        const goalValue = goal.subjectGoals[result.subjectId];
        const comparison = compareToGoal(result[field].value, goalValue);
        return { ...result, comparison, goalValue };
      })
      .filter((result) => result.comparison !== null);

    const notYetAchieved = withGoalGap.filter((result) => !result.comparison.achieved);
    if (notYetAchieved.length > 0) {
      const sortedByGap = [...notYetAchieved].sort((a, b) => b.comparison.diff - a.comparison.diff);
      closestToGoal = sortedByGap[0];
      mostNeedsImprovement = sortedByGap[sortedByGap.length - 1];
    }
  }

  return { strongest, weakest, closestToGoal, mostNeedsImprovement };
}
