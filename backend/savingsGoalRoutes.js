const express = require("express");
const router = express.Router();
const db = require("./db");

// 1. Get all savings goals
router.get("/goals", async (req, res) => {
    try {
        const userId = req.query.user_id;

        const [rows] = await db.query(
            "SELECT * FROM savings_goals WHERE user_id = ?",
            [userId]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Add new savings goal
router.post("/addSavings", async (req, res) => {
    try {
          console.log("POST savings goal route reached");
        const { user_id, name, target_amount, current_amount, deadline } = req.body;

        console.log(req.body)
        const [result] = await db.query(
            `INSERT INTO savings_goals
            (user_id, name, target_amount, current_amount, deadline)
            VALUES (?, ?, ?, ?, ?)`,
            [user_id, name, target_amount, current_amount || 0, deadline || null]
        );

        res.status(201).json({
            message: "Savings goal added successfully!",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Update savings goal
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            target_amount,
            current_amount,
            deadline,
            status
        } = req.body;

        await db.query(
            `UPDATE savings_goals
            SET name = ?, target_amount = ?, current_amount = ?,
                deadline = ?, status = ?
            WHERE id = ?`,
            [
                name,
                target_amount,
                current_amount,
                deadline,
                status,
                req.params.id
            ]
        );

        res.json({ message: "Savings goal updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Delete savings goal
router.delete("/:id", async (req, res) => {
    try {
        await db.query(
            "DELETE FROM savings_goals WHERE id = ?",
            [req.params.id]
        );

        res.json({ message: "Savings goal deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;