const { calculateHealthScore } = require("./healthScore");
const { calculateProjection } = require("./projection");
const { calculateStreak } = require("./streak");
const { evaluateBadges } = require("./badges");
const { generateChallenges, getChallengeProgress } = require("./challenges");
const { buildMotivation } = require("./motivation");

function round1(number) {
  return Math.round(number * 10) / 10;
}

function buildDashboardSummary(data, now = new Date()) {
  const h = data.healthInput;
  const snapshot = {
    income: h.income,
    expenses: h.expenses,
    net: round1(h.income - h.expenses),
    saved: h.saved,
    expensePercent: h.income > 0 ? round1((h.expenses / h.income) * 100) : 0,
    savingsRate: h.income > 0 ? round1((h.saved / h.income) * 100) : 0,
  };

  const health = calculateHealthScore(data.healthInput);
  const streak = calculateStreak(data.streakInput);
  const badges = evaluateBadges(data.badgeInput.stats, data.badgeInput.alreadyEarned);
  const challenges = generateChallenges(data.challengeInput);
  const active = data.activeChallenge ? getChallengeProgress(data.activeChallenge) : null;
  const projection = calculateProjection(data.projectionInput);

  const budgets = data.challengeInput.budgets || [];
  const goals = data.challengeInput.goals || [];

  const motivation = buildMotivation({ health, streak, badges, challenges, budgets, goals });
  const unfinished = goals
    .filter((g) => g.target > 0 && g.saved < g.target)
    .map((g) => ({
      name: g.name,
      saved: g.saved,
      target: g.target,
      percent: Math.round((g.saved / g.target) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  return {
    snapshot,
    healthScore: {
      score: health.score,
      label: health.label,
      message: health.message,
      focusArea: health.focusArea,
    },
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      loggedToday: streak.loggedToday,
      message: streak.message,
      last7Days: streak.last7Days,
    },
    badges: {
      earnedCount: badges.earnedCount,
      totalCount: badges.totalCount,
      newlyEarned: badges.newlyEarned,
      nextBadge: badges.nextBadge,
      earned: badges.badges.filter((b) => b.earned).map((b) => ({ id: b.id, name: b.name, icon: b.icon })),
    },
    challenge: {
      recommended: challenges.recommended,
      alternatives: challenges.alternatives,
      active,
    },
    nextGoal: unfinished[0] || null,
    nudges: { headline: motivation.headline, items: motivation.nudges },
    projection: {
      years: projection.assumptions.years,
      current: projection.current,
      improved: projection.improved,
      difference: projection.difference,
      message: projection.message,
      disclaimer: projection.disclaimer,
    },
    generatedAt: now.toISOString(),
  };
}

module.exports = { buildDashboardSummary };