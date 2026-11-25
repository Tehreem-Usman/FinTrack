const express = require("express");
const router = express.Router();
const db = require("./db");

// 1. Summary: total income, total expense, balance
router.get("/summary/:userId", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
             FROM transactions
             WHERE user_id = ?`,
            [req.params.userId]
        );

        const total_income = Number(rows[0].total_income);
        const total_expense = Number(rows[0].total_expense);

        res.json({
            total_income,
            total_expense,
            balance: total_income - total_expense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Category-wise total (sirf expense)
router.get("/category-summary/:userId", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT category_id, SUM(amount) AS total_spent, COUNT(*) AS transaction_count
             FROM transactions
             WHERE user_id = ? AND type = 'expense'
             GROUP BY category_id
             ORDER BY total_spent DESC`,
            [req.params.userId]
        );

        res.json(rows.map(r => ({ ...r, total_spent: Number(r.total_spent) })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Monthly summary
router.get("/monthly/:userId", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                DATE_FORMAT(transaction_date, '%Y-%m') AS month,
                COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
             FROM transactions
             WHERE user_id = ?
             GROUP BY month
             ORDER BY month DESC`,
            [req.params.userId]
        );

        res.json(rows.map(r => ({
            month: r.month,
            income: Number(r.income),
            expense: Number(r.expense),
            balance: Number(r.income) - Number(r.expense)
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Get all transactions of a user
router.get("/:userId", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM transactions
             WHERE user_id = ?
             ORDER BY transaction_date DESC, id DESC`,
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Add new transaction
router.post("/", async (req, res) => {
    try {
        const { user_id, category_id, amount, type, description, transaction_date } = req.body;

        if (!user_id || !amount || Number(amount) <= 0 || !["income", "expense"].includes(type)) {
            return res.status(400).json({
                message: "user_id, amount (> 0) and type ('income' or 'expense') are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO transactions
             (user_id, category_id, amount, type, description, transaction_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                category_id || null,
                amount,
                type,
                description || null,
                transaction_date || new Date()
            ]
        );

        res.status(201).json({
            message: "Transaction added successfully!",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Update transaction
router.put("/:id", async (req, res) => {
    try {
        const { category_id, amount, type, description, transaction_date } = req.body;

        if (!amount || Number(amount) <= 0 || !["income", "expense"].includes(type)) {
            return res.status(400).json({
                message: "amount (> 0) and type ('income' or 'expense') are required"
            });
        }

        const [result] = await db.query(
            `UPDATE transactions
             SET category_id = ?, amount = ?, type = ?, description = ?, transaction_date = ?
             WHERE id = ?`,
            [category_id || null, amount, type, description || null, transaction_date, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. Delete transaction
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM transactions WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;