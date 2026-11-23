

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function futureValue(startBalance, monthlySaving, annualReturnPercent, months) {
  const monthlyRate = annualReturnPercent / 100 / 12;


  if (monthlyRate === 0) {
    return startBalance + monthlySaving * months;
  }

  const growth = Math.pow(1 + monthlyRate, months);
  return startBalance * growth + monthlySaving * ((growth - 1) / monthlyRate);
}

function formatNumber(number) {
  return Math.round(number).toLocaleString("en-US");
}

function calculateProjection(input) {

  const currentSavings = Math.max(0, Number(input.currentSavings) || 0);
  const monthlySaving = Math.max(0, Number(input.monthlySaving) || 0);
  const improvementPercent = clamp(Number(input.improvementPercent ?? 10) || 0, 0, 100);
  const annualReturnPercent = clamp(Number(input.annualReturnPercent ?? 5) || 0, 0, 20);
  const years = clamp(Math.round(Number(input.years ?? 2) || 2), 1, 30);
  const currency = input.currency || "$";

  const months = years * 12;
  const improvedMonthlySaving = monthlySaving * (1 + improvementPercent / 100);


  const timeline = [];
  for (let month = 0; month <= months; month++) {
    timeline.push({
      month,
      current: Math.round(futureValue(currentSavings, monthlySaving, annualReturnPercent, month)),
      improved: Math.round(futureValue(currentSavings, improvedMonthlySaving, annualReturnPercent, month)),
    });
  }

  const currentTotal = timeline[months].current;
  const improvedTotal = timeline[months].improved;
  const difference = improvedTotal - currentTotal;

  const message =
    monthlySaving > 0
      ? `At your current pace you may have about ${currency}${formatNumber(currentTotal)} in ${years} year${years === 1 ? "" : "s"}. ` +
        `Saving ${improvementPercent}% more each month could raise this to about ${currency}${formatNumber(improvedTotal)}.`
      : "Start saving a small amount each month to see how your money could grow.";

  return {
    assumptions: { currentSavings, monthlySaving, improvementPercent, annualReturnPercent, years },
    current: { monthlySaving: Math.round(monthlySaving), total: currentTotal },
    improved: { monthlySaving: Math.round(improvedMonthlySaving), total: improvedTotal },
    difference,
    timeline,
    message,
    disclaimer: "This is an estimate, not a promise. Real results can be different.",
  };
}

module.exports = { calculateProjection };