const express = require("express");
const cors = require("cors");
const db = require("./db");
const transactionRoutes = require("./transactionRoutes");
const budgetRoutes = require("./budgetRoutes");
const savingsGoalRoutes = require("./savingsGoalRoutes");

const { calculateHealthScore } = require("./services/healthScore");
const { calculateProjection } = require("./services/projection");
const { calculateStreak } = require("./services/streak");
const { evaluateBadges } = require("./services/badges");
const { generateChallenges, getChallengeProgress } = require("./services/challenges");
const { buildMotivation } = require("./services/motivation");
const { buildDashboardSummary } = require("./services/dashboardSummary");
const sample = require("./data/sampleData");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/savings_goals", savingsGoalRoutes);
app.get("/check", (req, res) => {
    res.send("Savings Route Check");
});
console.log("Transaction Routes Loaded Successfully!");

db.getConnection()
    .then((connection) => {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    })
    .catch((error) => {
        console.log("Database Connection Failed:", error.message);
    });

app.get("/", (req, res) => {
    res.send("Robitary Backend is Running!");
});
app.get("/test", (req, res) => {
    res.send("Test API is Working!");
});

app.get("/api/health-score", (req, res) => {
    res.json(calculateHealthScore(sample.healthInput));
});
app.get("/api/projection", (req, res) => {
    res.json(
        calculateProjection({
            ...sample.projectionInput,
            years: req.query.years ?? sample.projectionInput.years,
            improvementPercent: req.query.improvement ?? sample.projectionInput.improvementPercent,
        })
    );
});

app.get("/api/streaks", (req, res) => {
    res.json(calculateStreak(sample.streakInput));
});

app.get("/api/badges", (req, res) => {
    res.json(evaluateBadges(sample.badgeInput.stats, sample.badgeInput.alreadyEarned));
});

app.get("/api/challenges", (req, res) => {
    res.json({
        ...generateChallenges(sample.challengeInput),
        active: sample.activeChallenge ? getChallengeProgress(sample.activeChallenge) : null,
    });
});

app.get("/api/nudges", (req, res) => {
    res.json(
        buildMotivation({
        health: calculateHealthScore(sample.healthInput),
        streak: calculateStreak(sample.streakInput),
        badges: evaluateBadges(sample.badgeInput.stats, sample.badgeInput.alreadyEarned),
        challenges: generateChallenges(sample.challengeInput),
        budgets: sample.challengeInput.budgets,
        goals: sample.challengeInput.goals,
})
    );
});

app.get("/api/dashboard/summary", (req, res) => {
    res.json(buildDashboardSummary(sample));
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});