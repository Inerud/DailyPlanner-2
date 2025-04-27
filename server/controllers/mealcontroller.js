const db = require("../config/db");

exports.getMealsByWeek = (req, res) => {
  const userId = req.userId;
  const weekStart = req.query.week;

  const sql = `
    SELECT * FROM meals 
    WHERE user_id = ? AND week_start = ?
  `;

  db.query(sql, [userId, weekStart], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.saveMeal = (req, res) => {
  const { week_start, date, day_of_week, meal_type, content } = req.body;
  const userId = req.userId;

  const sql = `
    INSERT INTO meals (user_id, week_start, date, day_of_week, meal_type, content)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE content = VALUES(content)
  `;

  db.query(sql, [userId, week_start, date, day_of_week, meal_type, content], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};