const express = require("express");
const router = express.Router();
const habitController = require("../controllers/habitcontroller");
const { authenticateUser } = require("../middleware/authMiddleware");

// Create a new habit
router.post("/", authenticateUser, habitController.createHabit);

// Get all habits for the authenticated user
router.get("/", authenticateUser, habitController.getHabits);

// Update an existing habit
router.put("/:habit_id", authenticateUser, habitController.updateHabit);

// Delete a habit
router.delete("/:habit_id", authenticateUser, habitController.deleteHabit);

// Mark a habit as completed (daily or weekly tracking)
router.post("/:habit_id/complete/:user_id", authenticateUser, habitController.completeHabit);

module.exports = router;
