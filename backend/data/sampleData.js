const healthInput = {
  income: 2800,       
  expenses: 1720,     
  saved: 420,          
  totalSavings: 1500, 
  budgets: [
    { category: "Food & drink", limit: 200, spent: 160 },
    { category: "Groceries", limit: 300, spent: 250 },
    { category: "Transport", limit: 60, spent: 70 },
  ],
  goals: [{ name: "Emergency fund", saved: 1500, target: 3000 }],
};

const projectionInput = {
  currentSavings: 1500,    
  monthlySaving: 420,     
  improvementPercent: 10,  
  annualReturnPercent: 5,  
  years: 2,                
};
function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
const streakInput = {
  loggedDates: [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16].map(daysAgo),
  allowedGapDays: 0,
};
const badgeInput = {
  stats: {
    savingsCount: 5,     
    longestStreak: 8,     
    totalSavings: 1500,   
    completedGoals: 0,   
    budgetsWithin: 2,   
    budgetsTotal: 3,      
  },
  alreadyEarned: ["first-saver"], 
};
const challengeInput = {
  income: 2800,
  saved: 420,               
  targetSavingsRate: 20,     
  spendingByCategory: {      
    Housing: 1487.2,
    "Food & drink": 160,
    Groceries: 42.8,
    Transport: 30,
  },
  budgets: [
    { category: "Food & drink", limit: 200, spent: 160 },
    { category: "Groceries", limit: 300, spent: 250 },
    { category: "Transport", limit: 60, spent: 70 },
  ],
  goals: [
    {
      name: "Emergency fund",
      saved: 1500,
      target: 3000,
      startDate: daysAgo(90),   
      deadline: daysAgo(-30),   
    },
  ],
};
const activeChallenge = { durationDays: 7, dailyAmount: 5, checkIns: 5 };
module.exports = {
  healthInput,
  projectionInput,
  streakInput,
  badgeInput,
  challengeInput,
  activeChallenge,
};