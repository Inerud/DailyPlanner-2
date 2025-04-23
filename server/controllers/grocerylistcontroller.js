const db = require("../config/db");

exports.getGroceryList = (req, res) => {
  const userId = req.userId;
  const weekStart = req.query.week;

  const sql = `SELECT content FROM grocery_lists WHERE user_id = ? AND week_start = ?`;
  db.query(sql, [userId, weekStart], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]?.content || '');
  });
};

exports.saveGroceryList = (req, res) => {
  const userId = req.userId;
  const { week_start, content } = req.body;

  const sql = `
    INSERT INTO grocery_lists (user_id, week_start, content)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE content = VALUES(content)
  `;

  db.query(sql, [userId, week_start, content], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
};
