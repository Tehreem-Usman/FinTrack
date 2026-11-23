const sample = require("./data/sampleData");
const { buildDashboardSummary } = require("./services/dashboardSummary");
const s = buildDashboardSummary(sample);

console.log("--- Dashboard summary (sample user) ---");
console.log("Cards:", s.snapshot);
console.log("Health score:", s.healthScore.score, "-", s.healthScore.label);
console.log("Streak:", s.streak.currentStreak, "now,", s.streak.longestStreak, "best");
console.log("Badges:", s.badges.earnedCount, "of", s.badges.totalCount, "| new:", s.badges.newlyEarned);
console.log("Challenge:", s.challenge.recommended.title, "| running:", s.challenge.active.message);
console.log("Next goal:", s.nextGoal);
console.log("Headline:", s.nudges.headline);
s.nudges.items.forEach((n, i) => console.log(`Nudge ${i + 1} [${n.type}]:`, n.message));
console.log("Projection:", s.projection.message);

console.log("--- Brand new user (nothing should crash) ---");
const empty = buildDashboardSummary({
  healthInput: { income: 0, expenses: 0, saved: 0, totalSavings: 0, budgets: [], goals: [] },
  projectionInput: { currentSavings: 0, monthlySaving: 0 },
  streakInput: { loggedDates: [], allowedGapDays: 0 },
  badgeInput: {
    stats: { savingsCount: 0, longestStreak: 0, totalSavings: 0, completedGoals: 0, budgetsWithin: 0, budgetsTotal: 0 },
    alreadyEarned: [],
  },
  challengeInput: { income: 0, saved: 0, spendingByCategory: {}, budgets: [], goals: [] },
  activeChallenge: null,
});
console.log("Score:", empty.healthScore.score, "|", empty.healthScore.message);
console.log("Headline:", empty.nudges.headline);
console.log("Challenge:", empty.challenge.recommended, "| running:", empty.challenge.active);
console.log("Projection:", empty.projection.message);