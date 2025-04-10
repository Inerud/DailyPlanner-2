const db = require("../config/db");

// Get 3 random challenges
exports.getChallenges = (req, res) => {
  const date = req.query.date; // Date can be used later if necessary
  const categories = ["PHYSICAL", "MENTAL", "SOCIAL", "CREATIVE", "PRODUCTIVE", "JOURNAL"];
  
  db.promise()
    .query(`
      SELECT * FROM exercises 
      ORDER BY RAND() 
      LIMIT 3
    `)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Get today's challenge for the authenticated user
exports.getTodaysChallenge = (req, res) => {
  const userId = req.userId;
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  const sql = `
    SELECT ec.exercise_id, ec.completed_at, e.title, e.exercise, e.category
    FROM exercise_completion ec
    JOIN exercises e ON ec.exercise_id = e.id
    WHERE ec.user_id = ? AND ec.selected_at = ?
  `;

  db.query(sql, [userId, today], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.length > 0) {
      // User has already picked a challenge for today
      return res.json({
        success: true,
        challenge_id: result[0].exercise_id,
        title: result[0].title,
        exercise: result[0].exercise,
        completed: result[0].completed_at !== null
      });
    } else {
      return res.json({
        success: false
      });
    }
  });
};

// Select a challenge for today
exports.selectChallenge = (req, res) => {
  const userId = req.userId;
  const { exercise_id } = req.body;
  const today = new Date().toISOString().split('T')[0]; // Today's date

  const sql = `
    INSERT INTO exercise_completion (user_id, exercise_id, selected_at) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE exercise_id = VALUES(exercise_id);
  `;

  db.query(sql, [userId, exercise_id, today], (err) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, challenge_id: exercise_id });
  });
};

// Mark a challenge as completed
exports.completeChallenge = (req, res) => {
  const userId = req.userId;
  const { exercise_id } = req.body;
  const today = new Date().toISOString().split('T')[0]; // Today's date

  const sql = `
    UPDATE exercise_completion 
    SET completed_at = NOW() 
    WHERE user_id = ? AND exercise_id = ? AND selected_at = ?
  `;

  db.query(sql, [userId, exercise_id, today], (err) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
};
