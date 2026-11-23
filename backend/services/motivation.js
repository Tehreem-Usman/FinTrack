function money(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return (
    "$" +
    rounded.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

function buildMotivation(data, maxNudges = 3) {
  const { health, streak, badges, challenges, budgets = [], goals = [] } = data;
  const nudges = [];
  const add = (type, priority, message) => nudges.push({ type, priority, message });


  if (badges && badges.newlyEarned.length > 0) {
    const names = badges.badges.filter((b) => badges.newlyEarned.includes(b.id)).map((b) => b.name);
    const what = names.length === 1 ? "a new badge" : `${names.length} new badges`;
    add("new-badge", 1, `You earned ${what}: ${names.join(", ")}!`);
  }


  if (streak && streak.currentStreak > 0 && !streak.loggedToday) {
    add("streak-at-risk", 1, `Log something today to keep your ${streak.currentStreak}-day streak going.`);
  }

  const overBudgets = budgets
    .filter((b) => b.spent > b.limit)
    .sort((a, b) => b.spent - b.limit - (a.spent - a.limit));
  if (overBudgets.length > 0) {
    const b = overBudgets[0];
    add(
      "over-budget",
      2,
      `${b.category} is ${money(b.spent - b.limit)} over its ${money(b.limit)} budget. A small change this week can fix it.`
    );
  }
  const nearBudgets = budgets
    .filter((b) => b.limit > 0 && b.spent <= b.limit && b.spent / b.limit >= 0.8)
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
  if (nearBudgets.length > 0) {
    const b = nearBudgets[0];
    const percent = Math.round((b.spent / b.limit) * 100);
    add("budget-warning", 3, `${b.category} is at ${percent}% of your ${money(b.limit)} budget. One small swap now keeps you on track.`);
  }
  if (budgets.length > 0 && budgets.every((b) => b.spent <= b.limit)) {
    add("budget-success", 4, "You are within all your budgets. Great job!");
  }

  if (streak && streak.currentStreak > 0 && streak.milestones.next && streak.milestones.daysToNext <= 2) {
    const d = streak.milestones.daysToNext;
    add("streak-milestone", 3, `Only ${d} more day${d === 1 ? "" : "s"} to reach a ${streak.milestones.next}-day streak!`);
  }

  for (const goal of goals) {
    if (!(goal.target > 0)) continue;
    const percent = Math.round((goal.saved / goal.target) * 100);
    if (percent >= 80 && percent < 100) {
      add("goal-close", 3, `${goal.name} is ${percent}% done. Only ${money(goal.target - goal.saved)} to go!`);
      break;
    }
  }
  if (badges && badges.nextBadge && badges.nextBadge.percent >= 60) {
    add("badge-close", 4, `You are ${badges.nextBadge.percent}% of the way to ${badges.nextBadge.name}. ${badges.nextBadge.howTo}`);
  }

  if (challenges && challenges.recommended) {
    add("challenge", 5, `Try the "${challenges.recommended.title}". ${challenges.recommended.reason}`);
  }
  if (health && health.focusArea) {
    add("health-focus", 6, `Your biggest chance to improve is "${health.focusArea}".`);
  }

  nudges.sort((a, b) => a.priority - b.priority);

  return {
    headline: nudges.length ? nudges[0].message : "Add your first transaction to get a personal tip.",
    nudges: nudges.slice(0, maxNudges),
    totalFound: nudges.length,
  };
}

module.exports = { buildMotivation };