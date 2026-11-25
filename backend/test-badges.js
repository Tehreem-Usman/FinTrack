const { evaluateBadges } = require("./services/badges");
const { badgeInput } = require("./data/sampleData");

const result = evaluateBadges(badgeInput.stats, badgeInput.alreadyEarned);

console.log("--- Sample user ---");
console.log("Earned:", result.earnedCount, "of", result.totalCount);
console.log("Newly earned:", result.newlyEarned);
console.log("Next badge:", result.nextBadge);
result.badges.forEach((b) =>
  console.log(`${b.icon} ${b.name}: ${b.earned ? "EARNED" : "not yet"} (${b.progress.current}/${b.progress.target})`)
);

console.log("--- Brand new user (expect 0 earned) ---");
const empty = evaluateBadges({
  savingsCount: 0, longestStreak: 0, totalSavings: 0, completedGoals: 0, budgetsWithin: 0, budgetsTotal: 0,
});
console.log("Earned:", empty.earnedCount, "| Newly earned:", empty.newlyEarned);

console.log("--- Super user (expect all 6 earned, no next badge) ---");
const full = evaluateBadges({
  savingsCount: 10, longestStreak: 40, totalSavings: 5000, completedGoals: 2, budgetsWithin: 3, budgetsTotal: 3,
});
console.log("Earned:", full.earnedCount, "| Next badge:", full.nextBadge);