const express = require("express");
const cors = require("cors");
const db = require("./db");
const transactionRoutes = require("./transactionRoutes");
const budgetRoutes = require("./budgetRoutes");
const savingsGoalRoutes = require("./savingsGoalRoutes");

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

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
