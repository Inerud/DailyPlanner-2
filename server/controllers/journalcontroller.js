const db = require("../config/db");

// Update a journal entry
exports.updateJournalEntry = (req, res) => {
    const { id } = req.params;
    const { entry } = req.body;
    if (!entry) return res.status(400).json({ success: false, message: "Entry required" });

    const query = "UPDATE journal_entries SET entry = ? WHERE id = ? AND user_id = ?";
    db.query(query, [entry, id, req.userId], (err, result) => {
        if (err) {
            console.error("Error updating journal entry:", err);
            return res.status(500).json({ success: false, message: "Failed to update entry" });
        }
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Entry not found" });

        res.json({ success: true, message: "Journal entry updated!" });
    });
};

// Delete a journal entry
exports.deleteJournalEntry = (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM journal_entries WHERE id = ? AND user_id = ?";
    db.query(query, [id, req.userId], (err, result) => {
        if (err) {
            console.error("Error deleting journal entry:", err);
            return res.status(500).json({ success: false, message: "Failed to delete entry" });
        }
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Entry not found" });

        res.json({ success: true, message: "Journal entry deleted!" });
    });
};

// Add a new journal entry
exports.addJournalEntry = (req, res) => {
    const { entryTitle, entry } = req.body;
    if (!entryTitle || !entry) return res.status(400).json({ success: false, message: "Title and entry required" });

    const query = "INSERT INTO journal_entries (user_id, entry_title, entry) VALUES (?, ?, ?)";
    db.query(query, [req.userId, entryTitle, entry], (err) => {
        if (err) {
            console.error("Error saving journal entry:", err);
            return res.status(500).json({ success: false, message: "Failed to save entry" });
        }
        res.json({ success: true, message: "Journal entry saved!" });
    });
};

// Fetch all journal entries for the user
exports.getJournalEntries = (req, res) => {
    const query = "SELECT id, entry_title, entry, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC";
    db.query(query, [req.userId], (err, results) => {
        if (err) {
            console.error("Error fetching journal entries:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch entries" });
        }
        res.json({ entries: results });
    });
};
