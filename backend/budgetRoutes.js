const express = require("express");
const router = express.Router();
const db = require("./db");

// 1. Get all budgets
router.get("/", async (req, res) => {
    try {
        const userId = req.query.user_id;

        const [rows] = await db.query(
            "SELECT * FROM budgets WHERE user_id = ?",
            [userId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Add new budget
router.post("/", async (req, res) => {
    try {
        const { user_id, category_id, amount, month, year } = req.body;

        const [result] = await db.query(
            `INSERT INTO budgets
            (user_id, category_id, amount, month, year)
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

        await db.query(
            `UPDATE budgets
            SET amount = ?, category_id = ?, month = ?, year = ?
            WHERE id = ?`,
            [amount, category_id || null, month, year, req.params.id]
        );

        res.json({ message: "Budget updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Delete budget
router.delete("/:id", async (req, res) => {
    try {
        await db.query(
            "DELETE FROM budgets WHERE id = ?",
            [req.params.id]
        );

        res.json({ message: "Budget deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;