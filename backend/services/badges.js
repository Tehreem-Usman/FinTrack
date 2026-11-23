const BADGES = [
  {
    id: "first-saver",
    name: "First Saver",
    icon: "🌱",
    description: "Put money into savings for the first time.",
    howTo: "Add one savings transaction.",
    getProgress: (stats) => ({ current: stats.savingsCount, target: 1 }),
  },
  {
    id: "seven-day-saver",
    name: "7-Day Saver",
    icon: "🔥",
    description: "Keep a 7-day streak.",
    howTo: "Log a transaction 7 days in a row.",
    getProgress: (stats) => ({ current: stats.longestStreak, target: 7 }),
  },
  {
    id: "budget-master",
    name: "Budget Master",
    icon: "🎯",
    description: "Stay within every budget this month.",
    howTo: "Keep all your budgets under their limit.",
    getProgress: (stats) =>
      stats.budgetsTotal > 0
        ? { current: stats.budgetsWithin, target: stats.budgetsTotal }
        : { current: 0, target: 1 },
  },
  {
    id: "first-100",
    name: "First $100",
    icon: "💰",
    description: "Reach $100 in total savings.",
    howTo: "Keep saving until your savings reach $100.",
    getProgress: (stats) => ({ current: stats.totalSavings, target: 100 }),
  },
  {
    id: "goal-crusher",
    name: "Goal Crusher",
    icon: "🏆",
    description: "Complete a savings goal.",
    howTo: "Reach the target of one savings goal.",
    getProgress: (stats) => ({ current: stats.completedGoals, target: 1 }),
  },
  {
    id: "consistency-champion",
    name: "Consistency Champion",
    icon: "👑",
    description: "Keep a 30-day streak.",
    howTo: "Log a transaction 30 days in a row.",
    getProgress: (stats) => ({ current: stats.longestStreak, target: 30 }),
  },
];

// stats: numbers about the user (see sampleData.js).
// alreadyEarned: ids of badges the user already has (the database will give us this later).
function evaluateBadges(stats, alreadyEarned = []) {
  const badges = BADGES.map((badge) => {
    const { current, target } = badge.getProgress(stats);
    const earned = current >= target;
    return {
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      howTo: badge.howTo,
      earned,
      isNew: earned && !alreadyEarned.includes(badge.id),
      progress: {
        current: Math.min(Math.round(current * 100) / 100, target),
        target,
        percent: Math.min(100, Math.round((current / target) * 100)),
      },
    };
  });
  const newlyEarned = badges.filter((b) => b.isNew).map((b) => b.id);
  const unearned = badges.filter((b) => !b.earned);
  const nextBadge = unearned.length
    ? unearned.reduce((best, b) => (b.progress.percent > best.progress.percent ? b : best))
    : null;

  return {
    earnedCount: badges.filter((b) => b.earned).length,
    totalCount: badges.length,
    newlyEarned,
    nextBadge: nextBadge
      ? { id: nextBadge.id, name: nextBadge.name, percent: nextBadge.progress.percent, howTo: nextBadge.howTo }
      : null,
    badges,
  };
}

module.exports = { evaluateBadges };