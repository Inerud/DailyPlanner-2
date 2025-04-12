const db = require("../config/db");

// Create a new habit
exports.createHabit = (req, res) => {
  const { title, category, goal} = req.body;

  const sql = `
    INSERT INTO habits (user_id, title, goal) 
    VALUES (?, ?, ?)
  `;

  db.query(sql, [req.userId, title, goal], (err, result) => {
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
    SELECT habit_id, title, goal, created_at, updated_at 
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

//toggle habit completion
const db = require('../db'); // adjust path to your DB connection

exports.toggleHabit = (req, res) => {
  const { habit_id, user_id, date } = req.params;
  const habit_date = date;

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
        VALUES (?, ?, ?, NOW())
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
