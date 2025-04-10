const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalcontroller");
const { authenticateUser } = require("../middleware/authMiddleware"); // Ensure you have this authentication middleware

// Define journal routes
router.put("/:id", authenticateUser, journalController.updateJournalEntry);
router.delete("/:id", authenticateUser, journalController.deleteJournalEntry);
router.post("/", authenticateUser, journalController.addJournalEntry);
router.get("/", authenticateUser, journalController.getJournalEntries);

module.exports = router;
