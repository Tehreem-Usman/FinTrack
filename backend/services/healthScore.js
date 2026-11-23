const WEIGHTS = {
  savingsRate: 30,
  expenseRatio: 25,
  budgetAdherence: 20,
  goalProgress: 15,
  emergencyFund: 10,
};

const NAMES = {
  savingsRate: "Savings rate",
  expenseRatio: "Expense ratio",
  budgetAdherence: "Budget adherence",
  goalProgress: "Goal progress",
  emergencyFund: "Emergency fund",
};

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function scoreSavingsRate({ income, saved }) {
  if (income <= 0) {
    return { score: 0, detail: "No income recorded this month." };
  }
  const percent = (saved / income) * 100;
  return {
    score: clamp((percent / 20) * 100, 0, 100),
    detail: `You saved ${percent.toFixed(1)}% of your income. Saving 20% or more gives full points.`,
  };
}


function scoreExpenseRatio({ income, expenses }) {
  if (income <= 0) {
    return { score: 0, detail: "No income recorded this month." };
  }
  const ratio = expenses / income;
  const score = ratio <= 0.5 ? 100 : clamp(((1 - ratio) / 0.5) * 100, 0, 100);
  return {
    score,
    detail: `You spent ${(ratio * 100).toFixed(1)}% of your income. Spending 50% or less gives full points.`,
  };
}


function scoreBudgetAdherence({ budgets }) {
  if (!budgets || budgets.length === 0) {
    return { score: 50, detail: "No budgets set yet. Set one to earn more points here." };
  }
  const within = budgets.filter((b) => b.spent <= b.limit).length;
  return {
    score: (within / budgets.length) * 100,
    detail: `${within} of ${budgets.length} budgets are within the limit.`,
  };
}


function scoreGoalProgress({ goals }) {
  if (!goals || goals.length === 0) {
    return { score: 50, detail: "No savings goals yet. Create one to earn more points here." };
  }
  const total = goals.reduce((sum, goal) => {
    const progress = goal.target > 0 ? goal.saved / goal.target : 0;
    return sum + clamp(progress, 0, 1);
  }, 0);
  const average = total / goals.length;
  return {
    score: average * 100,
    detail: `Your goals are ${Math.round(average * 100)}% complete on average.`,
  };
}


function scoreEmergencyFund({ totalSavings, expenses }) {
  let months = 0;
  if (expenses > 0) {
    months = totalSavings / expenses;
  } else if (totalSavings > 0) {
    months = 3;
  }
  return {
    score: clamp((months / 3) * 100, 0, 100),
    detail: `Your savings cover about ${months.toFixed(1)} months of spending. 3 months or more gives full points.`,
  };
}


function getLabel(score) {
  if (score >= 80) {
    return { label: "Excellent", message: "Great work! Keep your momentum going." };
  }
  if (score >= 60) {
    return { label: "Good", message: "You are doing well. One small improvement can lift your score." };
  }
  if (score >= 40) {
    return { label: "Getting there", message: "You are making progress. A small challenge can help you move up." };
  }
  return { label: "Just starting", message: "Every small step counts. Start with one easy action this week." };
}


function calculateHealthScore(input) {
  if (input.income <= 0 && input.expenses <= 0) {
    return {
      score: 0,
      label: "Just starting",
      message: "Add your first transactions to see your score.",
      focusArea: null,
      breakdown: [],
    };
  }

  const parts = {
    savingsRate: scoreSavingsRate(input),
    expenseRatio: scoreExpenseRatio(input),
    budgetAdherence: scoreBudgetAdherence(input),
    goalProgress: scoreGoalProgress(input),
    emergencyFund: scoreEmergencyFund(input),
  };

  let total = 0;
  const breakdown = Object.keys(parts).map((key) => {
    const points = (parts[key].score * WEIGHTS[key]) / 100;
    total += points;
    return {
      key,
      name: NAMES[key],
      weight: WEIGHTS[key],
      score: Math.round(parts[key].score),
      points: Number(points.toFixed(1)),
      detail: parts[key].detail,
    };
  });

  const score = Math.round(total);
  const { label, message } = getLabel(score);


  const weakest = breakdown.reduce((low, item) => (item.score < low.score ? item : low));

  return { score, label, message, focusArea: weakest.name, breakdown };
}

module.exports = { calculateHealthScore };