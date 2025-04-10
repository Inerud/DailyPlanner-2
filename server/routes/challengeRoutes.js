const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengecontroller");
const { authenticateUser } = require("../middleware/authMiddleware");

// Get 3 random challenges (can be adjusted to get different challenges per category or date)
router.get("/", challengeController.getChallenges);

// Get today's challenge for the authenticated user
router.get("/today", authenticateUser, challengeController.getTodaysChallenge);

// Select a challenge for today
router.post("/select", authenticateUser, challengeController.selectChallenge);

// Mark a challenge as completed
router.post("/complete", authenticateUser, challengeController.completeChallenge);

module.exports = router;
