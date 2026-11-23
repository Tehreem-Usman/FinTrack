const { calculateStreak } = require("./services/streak");
const { streakInput } = require("./data/sampleData");

console.log(" Sample user ---");
console.log(JSON.stringify(calculateStreak(streakInput), null, 2));
const fixed = (dates, extra = {}) =>
  calculateStreak({ today: "2026-11-22", loggedDates: dates, ...extra });

console.log(" Test 1: logged 20, 21, 22 Nov (expect current 3, longest 3) ---");
let t = fixed(["2026-11-20", "2026-11-21", "2026-11-22"]);
console.log(t.currentStreak, t.longestStreak);

console.log(" Test 2: logged 19, 20, 21 but not today (still alive: expect current 3) ---");
t = fixed(["2026-11-19", "2026-11-20", "2026-11-21"]);
console.log(t.currentStreak, t.longestStreak, "|", t.message);

console.log(" Test 3: last log was 3 days ago (broken: expect current 0, longest 2) ---");
t = fixed(["2026-11-18", "2026-11-19"]);
console.log(t.currentStreak, t.longestStreak, "|", t.message);

console.log(" Test 4: one missed day, no forgiveness (expect current 1, longest 2) ---");
t = fixed(["2026-11-19", "2026-11-20", "2026-11-22"]);
console.log(t.currentStreak, t.longestStreak);

console.log(" Test 5: same days, forgiving 1 missed day (expect current 3, longest 3) ---");
t = fixed(["2026-11-19", "2026-11-20", "2026-11-22"], { allowedGapDays: 1 });
console.log(t.currentStreak, t.longestStreak);

console.log(" Test 6: no logs at all (expect 0 0) ---");
t = fixed([]);
console.log(t.currentStreak, t.longestStreak, "|", t.message);