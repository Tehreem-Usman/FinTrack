const DAY = 24 * 60 * 60 * 1000;
const WANTS = {
  "Food & drink": { title: "Cook-at-Home Challenge", tip: "Cook your meals at home instead of buying food outside." },
  "Food delivery": { title: "Cook-at-Home Challenge", tip: "Cook your meals at home instead of ordering delivery." },
  "Eating out": { title: "Cook-at-Home Challenge", tip: "Cook your meals at home instead of eating out." },
  Entertainment: { title: "Entertainment Break", tip: "Choose free or cheaper activities for a while." },
  Shopping: { title: "Mindful Shopping Challenge", tip: "Wait 24 hours before buying anything you do not need." },
};

const WANTS_LIMIT_PERCENT = 15; 
const REDUCE_PERCENT = 30;     

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function toDayNumber(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.round(Date.UTC(year, month - 1, day) / DAY);
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

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

function makeChallenge({ type, title, description, reason, durationDays, targetCategory, potentialSaving }) {
  const saving = Math.round(potentialSaving * 100) / 100;
  return {
    type,
    title,
    description,
    reason,
    durationDays,
    targetCategory: targetCategory || null,
    potentialSaving: saving,
    dailyAmount: Math.round((saving / durationDays) * 100) / 100,
  };
}

function highSpendingChallenge(input) {
  if (!(input.income > 0)) return null;
  const spending = input.spendingByCategory || {};

  let worst = null;
  for (const category of Object.keys(WANTS)) {
    const spent = Number(spending[category]) || 0;
    const percent = (spent / input.income) * 100;
    if (percent > WANTS_LIMIT_PERCENT && (!worst || spent > worst.spent)) {
      worst = { category, spent, percent };
    }
  }
  if (!worst) return null;

  const saving = worst.spent * (REDUCE_PERCENT / 100);
  return makeChallenge({
    type: "high-spending",
    title: WANTS[worst.category].title,
    description: `${WANTS[worst.category].tip} Try to spend ${REDUCE_PERCENT}% less on ${worst.category} for 14 days.`,
    reason: `You spent ${money(worst.spent)} on ${worst.category} this month, which is ${worst.percent.toFixed(0)}% of your income. We suggest staying under ${WANTS_LIMIT_PERCENT}%.`,
    durationDays: 14,
    targetCategory: worst.category,
    potentialSaving: saving,
  });
}

function budgetRecoveryChallenge(input) {
  let worst = null;
  for (const budget of input.budgets || []) {
    const over = budget.spent - budget.limit;
    if (over > 0 && (!worst || over > worst.over)) {
      worst = { budget, over };
    }
  }
  if (!worst) return null;

  const { budget, over } = worst;
  return makeChallenge({
    type: "budget-recovery",
    title: "Get Back on Budget",
    description: `Keep ${budget.category} spending low for 7 days and get back on track.`,
    reason: `You are ${money(over)} over your ${money(budget.limit)} ${budget.category} budget.`,
    durationDays: 7,
    targetCategory: budget.category,
    potentialSaving: Math.max(over, budget.limit * 0.1),
  });
}


function microSavingsChallenge(input) {
  if (!(input.income > 0)) return null;
  const targetRate = input.targetSavingsRate ?? 20;
  const savingsRate = (input.saved / input.income) * 100;
  if (savingsRate >= targetRate) return null;

  const missing = (input.income * targetRate) / 100 - input.saved; 
  const perDay = clamp(Math.ceil(missing / 30), 1, 20);

  return makeChallenge({
    type: "micro-savings",
    title: "Save a little. Keep the rhythm.",
    description: `Put aside ${money(perDay)} a day for 7 days. Manual check-ins keep you in control.`,
    reason: `You saved ${savingsRate.toFixed(0)}% of your income. The target is ${targetRate}%.`,
    durationDays: 7,
    targetCategory: null,
    potentialSaving: perDay * 7,
  });
}
function goalCatchUpChallenge(input, today) {
  let worst = null;
  for (const goal of input.goals || []) {
    if (!goal.startDate || !goal.deadline || !(goal.target > 0)) continue;
    const start = toDayNumber(goal.startDate);
    const end = toDayNumber(goal.deadline);
    if (start === null || end === null || end <= start || today >= end) continue;

    const expected = clamp((today - start) / (end - start), 0, 1);
    const actual = clamp(goal.saved / goal.target, 0, 1);
    const behind = expected - actual;
    if (behind >= 0.1 && (!worst || behind > worst.behind)) {
      worst = { goal, behind, expected, actual, daysLeft: end - today };
    }
  }
  if (!worst) return null;

  const { goal, expected, actual, daysLeft } = worst;
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const weekly = Math.ceil((goal.target - goal.saved) / weeksLeft);

  return makeChallenge({
    type: "goal-catch-up",
    title: `Catch Up on "${goal.name}"`,
    description: `Saving about ${money(weekly)} a week for the next 2 weeks puts you back on track.`,
    reason: `By now your "${goal.name}" goal should be about ${Math.round(expected * 100)}% done, but it is ${Math.round(actual * 100)}% done.`,
    durationDays: 14,
    targetCategory: goal.name,
    potentialSaving: weekly * 2,
  });
}

function generateChallenges(input) {
  const today = toDayNumber(input.today || todayKey());

  const all = [
    highSpendingChallenge(input),
    budgetRecoveryChallenge(input),
    microSavingsChallenge(input),
    goalCatchUpChallenge(input, today),
  ].filter(Boolean);

  return {
    recommended: all[0] || null,
    alternatives: all.slice(1),
    message: all.length
      ? "Here is a small challenge picked for you."
      : "You are on track! No challenge is needed right now. Keep your good habits going.",
  };
}

function getChallengeProgress({ durationDays, dailyAmount, checkIns }) {
  const done = clamp(Number(checkIns) || 0, 0, durationDays);
  const saved = Math.round(done * dailyAmount * 100) / 100;
  const target = Math.round(durationDays * dailyAmount * 100) / 100;
  const daysLeft = durationDays - done;
  const completed = done >= durationDays;

  return {
    checkIns: done,
    durationDays,
    saved,
    target,
    percent: Math.round((done / durationDays) * 100),
    daysLeft,
    completed,
    message: completed
      ? "Challenge complete! Great job."
      : `${done} of ${durationDays} check-ins done. ${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`,
  };
}

module.exports = { generateChallenges, getChallengeProgress };