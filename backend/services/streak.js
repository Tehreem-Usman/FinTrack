const DAY = 24 * 60 * 60 * 1000;
const MILESTONES = [3, 7, 14, 30, 60, 100];

function toDayNumber(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.round(Date.UTC(year, month - 1, day) / DAY);
}

function fromDayNumber(dayNumber) {
  return new Date(dayNumber * DAY).toISOString().slice(0, 10);
}

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function calculateStreak(input) {
  const allowedGap = Math.max(0, Number(input.allowedGapDays) || 0);
  const today = toDayNumber(input.today || todayKey());

  const days = [...new Set((input.loggedDates || []).map(toDayNumber))]
    .filter((day) => day !== null && day <= today)
    .sort((a, b) => a - b);

  const runs = [];
  for (const day of days) {
    const lastRun = runs[runs.length - 1];
    const missedDays = lastRun ? day - lastRun.end - 1 : null;
    if (lastRun && missedDays <= allowedGap) {
      lastRun.end = day;
      lastRun.length += 1;
    } else {
      runs.push({ start: day, end: day, length: 1 });
    }
  }

  const longestStreak = runs.reduce((best, run) => Math.max(best, run.length), 0);
  const lastRun = runs[runs.length - 1];
  const isAlive = lastRun && today - lastRun.end - 1 <= allowedGap;
  const currentStreak = isAlive ? lastRun.length : 0;

  const loggedSet = new Set(days);
  const loggedToday = loggedSet.has(today);

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    last7Days.push({ date: fromDayNumber(today - i), logged: loggedSet.has(today - i) });
  }
  const reached = MILESTONES.filter((m) => m <= longestStreak);
  const next = MILESTONES.find((m) => m > currentStreak) || null;
  const daysToNext = next ? next - currentStreak : 0;

  let message;
  if (currentStreak === 0) {
    message = "Log a transaction today to start your streak.";
  } else if (!loggedToday) {
    message = `You have a ${currentStreak}-day streak. Log something today to keep it going!`;
  } else if (next) {
    message = `${currentStreak}-day streak! Only ${daysToNext} more day${daysToNext === 1 ? "" : "s"} to reach ${next} days.`;
  } else {
    message = `${currentStreak}-day streak! Amazing consistency.`;
  }

  return {
    currentStreak,
    longestStreak,
    loggedToday,
    lastLoggedDate: days.length ? fromDayNumber(days[days.length - 1]) : null,
    last7Days,
    milestones: { reached, next, daysToNext },
    message,
  };
}

module.exports = { calculateStreak };