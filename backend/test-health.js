const { calculateHealthScore } = require("./services/healthScore");
const { healthInput } = require("./data/sampleData");

console.log("--- Sample user ---");
console.log(JSON.stringify(calculateHealthScore(healthInput), null, 2));

console.log("--- Brand new user ---");
console.log(
  JSON.stringify(
    calculateHealthScore({ income: 0, expenses: 0, saved: 0, totalSavings: 0, budgets: [], goals: [] }),
    null,
    2
  )
);