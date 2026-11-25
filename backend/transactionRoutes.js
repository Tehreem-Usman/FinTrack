const express = require("express");
const router = express.Router();
const db = require("./db");

// 1. Get all transactions
router.get("/:userId", async (req, res) => {
    try {
        const {userId} = req.params

        console.log("api call")

        const [rows] = await db.query(
            "SELECT * FROM transactions WHERE user_id = ?",
            [userId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Add new transaction
router.post("/", async (req, res) => {
    try {
        const {
            user_id,
            category_id,
            amount,
            type,
            description,
            transaction_date
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO transactions
            (user_id, category_id, amount, type, description, transaction_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                category_id || null,
                amount,
                type,
                description,
                transaction_date
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

// 3. Update transaction
router.put("/:id", async (req, res) => {
    try {
        const { amount, type, description, transaction_date } = req.body;

        const [result] = await db.query(
            `UPDATE transactions
            SET amount = ?, type = ?, description = ?, transaction_date = ?
            WHERE id = ?`,
            [amount, type, description, transaction_date, req.params.id]
        );

        res.json({ message: "Transaction updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Delete transaction
router.delete("/:id", async (req, res) => {
    try {
        await db.query(
            "DELETE FROM transactions WHERE id = ?",
            [req.params.id]
        );

        res.json({ message: "Transaction deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;