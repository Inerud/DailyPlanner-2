const express = require("express");
const router = express.Router();
const controller = require("../controllers/challengecontroller");
const { authenticateUser } = require("../middleware/authMiddleware");

// Get 3 random challenges (can be adjusted to get different challenges per category or date)
router.get("/", controller.getChallenges);

// Get today's challenge for the authenticated user
router.get("/today", authenticateUser, controller.getTodaysChallenge);

// Select a challenge for today
router.post("/select", authenticateUser, controller.selectChallenge);

// Mark a challenge as completed
router.post("/complete", authenticateUser, controller.completeChallenge);

module.exports = router;
