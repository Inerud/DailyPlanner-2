const db = require("../config/db");

// Create a new habit
exports.createHabit = (req, res) => {
  const { title, category, frequency, weekly_target } = req.body;

  const sql = `
    INSERT INTO habits (user_id, title, category, frequency, weekly_target) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [req.userId, title, category || null, frequency, weekly_target || 7], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Habit created successfully', habit_id: result.insertId });
  });
};

// Get all habits for a specific user
exports.getHabits = (req, res) => {
  const sql = `
    SELECT habit_id, title, category, frequency, weekly_target, streak, created_at, updated_at 
    FROM habits WHERE user_id = ?
  `;

  db.query(sql, req.userId, (err, habits) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching habits");
    }

    res.status(200).json(habits);
  });
};

// Update an existing habit
exports.updateHabit = (req, res) => {
  const { habit_id } = req.params;
  const { title, category, frequency, weekly_target } = req.body;

  const sql = `
    UPDATE habits 
    SET title = ?, category = ?, frequency = ?, weekly_target = ? 
    WHERE habit_id = ?
  `;

  db.query(sql, [title, category || null, frequency, weekly_target || 7, habit_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating habit");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Habit not found');
    }

    res.status(200).json({ message: 'Habit updated successfully' });
  });
};

// Delete a habit
exports.deleteHabit = (req, res) => {
  const { habit_id } = req.params;

  const sql = `
    DELETE FROM habits WHERE habit_id = ?
  `;

  db.query(sql, [habit_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting habit");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Habit not found');
    }

    res.status(200).json({ message: 'Habit deleted successfully' });
  });
};

// Mark habit as completed
exports.completeHabit = (req, res) => {
  const { habit_id, user_id } = req.params;
  const completion_date = new Date().toISOString().slice(0, 19).replace('T', ' '); // current timestamp

  // Check if the habit is already completed today
  const checkSql = `
    SELECT * FROM habit_completions WHERE habit_id = ? AND user_id = ? AND completion_date = ?
  `;

  db.query(checkSql, [habit_id, user_id, completion_date], (err, existing) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error checking habit completion");
    }

    if (existing.length > 0) {
      return res.status(400).send('Habit already completed today');
    }

    // Insert completion record
    const insertSql = `
      INSERT INTO habit_completions (habit_id, user_id, completion_date) 
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [habit_id, user_id, completion_date], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error inserting habit completion");
      }

      // Update the streak (increment if completed)
      const selectStreakSql = `
        SELECT streak FROM habits WHERE habit_id = ?
      `;

      db.query(selectStreakSql, [habit_id], (err, habit) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error fetching habit streak");
        }

        const newStreak = habit[0].streak + 1; // increment streak
        const updateStreakSql = `
          UPDATE habits SET streak = ? WHERE habit_id = ?
        `;

        db.query(updateStreakSql, [newStreak, habit_id], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error updating streak");
          }

          res.status(200).json({ message: 'Habit marked as completed' });
        });
      });
    });
  });
};
