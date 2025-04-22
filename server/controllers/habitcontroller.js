const db = require("../config/db");

// Create a new habit
exports.createHabit = (req, res) => {
  const { title } = req.body;

  const sql = `
    INSERT INTO habits (user_id, title) 
    VALUES (?, ?)
  `;

  db.query(sql, [req.userId, title], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Habit created successfully', habit_id: result.insertId });
  });
};

// Get all habits for a specific user
exports.getHabits = (req, res) => {
  const userId = req.userId;

  const query = `
      SELECT h.habit_id, h.title, h.goal, 
             GROUP_CONCAT(hc.habit_date ORDER BY hc.habit_date) AS days
      FROM habits h
      LEFT JOIN habit_completions hc ON h.habit_id = hc.habit_id
      WHERE h.user_id = ?
      GROUP BY h.habit_id
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching habits:", err);
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }

    const habits = results.map(habit => ({
      ...habit,
      days: habit.days ? habit.days.split(',') : [],
    }));

    res.json(habits);
  });
};


// Update an existing habit
exports.updateHabit = (req, res) => {
  const { habit_id } = req.params;
  const { title, goal } = req.body;

  const sql = `
    UPDATE habits 
    SET title = ?, goal = ?
    WHERE habit_id = ?
  `;

  db.query(sql, [title, goal, habit_id], (err, result) => {
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

  // First delete completions
  const deleteCompletions = `DELETE FROM habit_completions WHERE habit_id = ?`;
  db.query(deleteCompletions, [habit_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting habit completions");
    }


    // then delete the habit
    const deleteHabitSql = `DELETE FROM habits WHERE habit_id = ?`;
    db.query(deleteHabitSql, [habit_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error deleting habit");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Habit not found");
      }

      res.status(200).json({ message: "Habit and completions deleted successfully" });
    });
  });
};


//toggle habit completion

exports.toggleHabit = async (req, res) => {
  const user_id = req.userId;
  const habit_id = req.params.habit_id;
  const habit_date = req.params.date;

  const checkSql = `
    SELECT * FROM habit_completions 
    WHERE habit_id = ? AND user_id = ? AND habit_date = ?
  `;

  db.query(checkSql, [habit_id, user_id, habit_date], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // Already completed: delete it
      const deleteSql = `
        DELETE FROM habit_completions 
        WHERE habit_id = ? AND user_id = ? AND habit_date = ?
      `;
      db.query(deleteSql, [habit_id, user_id, habit_date], (delErr) => {
        if (delErr) {
          console.error('Delete error:', delErr);
          return res.status(500).json({ error: 'Could not remove completion' });
        }
        return res.json({ status: 'uncompleted' });
      });
    } else {
      // Not completed: insert it
      const insertSql = `
        INSERT INTO habit_completions (habit_id, user_id, habit_date) 
        VALUES (?, ?, ?)
      `;
      db.query(insertSql, [habit_id, user_id, habit_date], (insErr) => {
        if (insErr) {
          console.error('Insert error:', insErr);
          return res.status(500).json({ error: 'Could not mark as completed' });
        }
        return res.json({ status: 'completed' });
      });
    }
  });
};
