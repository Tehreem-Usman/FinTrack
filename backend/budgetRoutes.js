const express = require("express");
const router = express.Router();
const db = require("./db");

function validBudget({ amount, month, year }) {
    return Number(amount) > 0 &&
        Number.isInteger(Number(month)) && Number(month) >= 1 && Number(month) <= 12 &&
        Number.isInteger(Number(year)) && Number(year) >= 2000;
}

// 1. Get budgets with spent / remaining  (optional: &month=11&year=2026)
router.get("/", async (req, res) => {
    try {
        const { user_id, month, year } = req.query;

        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" });
        }

        const params = [user_id];
        let filter = "";
        if (month && year) {
            filter = "AND b.month = ? AND b.year = ?";
            params.push(month, year);
        }

        const [rows] = await db.query(
            `SELECT b.id, b.user_id, b.category_id, b.amount AS budget_amount, b.month, b.year,
                COALESCE((
                    SELECT SUM(t.amount) FROM transactions t
                    WHERE t.user_id = b.user_id
                      AND t.type = 'expense'
                      AND MONTH(t.transaction_date) = b.month
                      AND YEAR(t.transaction_date) = b.year
                      AND (b.category_id IS NULL OR t.category_id = b.category_id)
                ), 0) AS spent
             FROM budgets b
             WHERE b.user_id = ? ${filter}
             ORDER BY b.year DESC, b.month DESC, b.id DESC`,
            params
        );

        res.json(rows.map(r => {
            const budget = Number(r.budget_amount);
            const spent = Number(r.spent);
            return {
                id: r.id,
                user_id: r.user_id,
                category_id: r.category_id,
                month: r.month,
                year: r.year,
                budget_amount: budget,
                spent,
                remaining: budget - spent,
                percent_used: Number(((spent / budget) * 100).toFixed(2)),
                is_exceeded: spent > budget
            };
        }));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Add new budget
router.post("/", async (req, res) => {
    try {
        const { user_id, category_id, amount, month, year } = req.body;

        if (!user_id || !validBudget({ amount, month, year })) {
            return res.status(400).json({
                message: "user_id, amount (> 0), month (1-12) and year are required"
            });
        }

        const [existing] = await db.query(
            `SELECT id FROM budgets
             WHERE user_id = ? AND category_id <=> ? AND month = ? AND year = ?`,
            [user_id, category_id || null, month, year]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                message: "Budget already exists for this category and month"
            });
        }

        const [result] = await db.query(
            `INSERT INTO budgets (user_id, category_id, amount, month, year)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, category_id || null, amount, month, year]
        );

        res.status(201).json({
            message: "Budget added successfully!",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Update budget
router.put("/:id", async (req, res) => {
    try {
        const { amount, category_id, month, year } = req.body;

        if (!validBudget({ amount, month, year })) {
            return res.status(400).json({
                message: "amount (> 0), month (1-12) and year are required"
            });
        }

        const [result] = await db.query(
            `UPDATE budgets
             SET amount = ?, category_id = ?, month = ?, year = ?
             WHERE id = ?`,
            [amount, category_id || null, month, year, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.json({ message: "Budget updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Delete budget
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM budgets WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.json({ message: "Budget deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;