const db = require("../config/db");

// Fetch habits and meals for a specific date
exports.getDashboardData = (req, res) => {
  const userId = req.userId;
  const selectedDate = req.query.date;

  //Fetch todos for the user
  const todosQuery = `
    SELECT * 
    FROM todos 
    WHERE user_id = ? AND DATE(date) = ? 
    ORDER BY priority DESC, time
  `;

  // Fetch habits for the user
  const habitsQuery = `
    SELECT h.habit_id, h.title, h.goal, 
           GROUP_CONCAT(hc.habit_date ORDER BY hc.habit_date) AS days
    FROM habits h
    LEFT JOIN habit_completions hc ON h.habit_id = hc.habit_id
    WHERE h.user_id = ?
    GROUP BY h.habit_id
  `;

  // Fetch planned meals for the selected date
  const mealsQuery = `
    SELECT m.id, m.meal_type, m.content 
    FROM meals m 
    WHERE m.user_id = ? AND m.date = ?
  `;

  // Run all queries
  db.query(habitsQuery, [userId], (err, habitsResults) => {
    if (err) {
      console.error("Error fetching habits:", err);
      return res.status(500).json({ error: "Failed to fetch habits" });
    }

    db.query(mealsQuery, [userId, selectedDate], (err, mealsResults) => {
      if (err) {
        console.error("Error fetching meals:", err);
        return res.status(500).json({ error: "Failed to fetch meals" });
      }

      db.query(todosQuery, [userId, selectedDate], (err, todosResults) => {
        if (err) {
          console.error("Error fetching todos:", err);
          return res.status(500).json({ error: "Failed to fetch todos" });
        }


        const habits = habitsResults.map(habit => ({
          ...habit,
          days: habit.days ? habit.days.split(",") : [],
        }));

        const meals = mealsResults;
        const todos = todosResults;

        res.json({
          habits: habits,
          meals: meals,
          todos: todos
        });
      });
    });
  });
};
