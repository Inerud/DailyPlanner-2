const express = require("express");
const router = express.Router();
const { auth } = require("express-openid-connect");
require("dotenv").config();
const path = require("path");
const db = require("./server/config/db.js");

const app = express();
const PORT = process.env.PORT;

// Auth0 Configuration
const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  routes: {
    callback: "/callback"
  }
};

// Middleware
app.use(auth(authConfig));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Test database connection
db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MySQL database.");
});

// ** Helper function to get or create a user **
const getOrCreateUser = async (user) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT id FROM users WHERE auth0_id = ?";
    db.query(query, [user.sub], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) return resolve(results[0].id);

      // Insert new user if not found
      const insertQuery = "INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)";
      db.query(insertQuery, [user.sub, user.email, user.name], (err, result) => {
        if (err) return reject(err);
        console.log("User saved:", user.name);
        resolve(result.insertId);
      });
    });
  });
};

// ** Middleware to check authentication and get user ID **
const authenticateUser = async (req, res, next) => {
  if (!req.oidc.isAuthenticated()) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    req.userId = await getOrCreateUser(req.oidc.user);
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

// ** API Routes **

// Get authenticated user data
app.get("/api/user", authenticateUser, (req, res) => {
  res.json({ user: req.oidc.user });
});

// ** Journal **
// Add a new journal entry
app.post("/api/journal", authenticateUser, (req, res) => {
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
});

// Fetch all journal entries for the user
app.get("/api/journal", authenticateUser, (req, res) => {
  const query = "SELECT id, entry_title, entry, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC";
  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error("Error fetching journal entries:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch entries" });
    }
    res.json({ entries: results });
  });
});

// Update a journal entry
app.put("/api/journal/:id", authenticateUser, (req, res) => {
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
});

// Delete a journal entry
app.delete("/api/journal/:id", authenticateUser, (req, res) => {
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
});

// ** Todo **
// fetch all to-do items from authenticated user
app.get("/api/todos", authenticateUser, (req, res) => {
  const query = "SELECT * FROM todos WHERE user_id = ? ORDER BY date, time";

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch todos" });
    }

    // Convert completed field to boolean
    const todos = results.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed) // Ensures it's true/false
    }));

    res.json({ success: true, todos });
  });
});

//fetch all todos for certain date
app.get("/api/data", authenticateUser, (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" });
  }

  const query = "SELECT * FROM todos WHERE user_id = ? AND DATE(date) = ? ORDER BY priority DESC, time";

  db.query(query, [req.userId, date], (err, results) => {
    if (err) {
      console.error("Error fetching todos for date:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch todos" });
    }

    const todos = results.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed) // Ensures it's true/false
    }));

    res.json({ success: true, todos });
  });
});



// insert new todo into database
app.post("/api/todos", authenticateUser, (req, res) => {
  const { description, date, time, priority, completed, recurring, tags } = req.body;

  if (!description || !date) {
    return res.status(400).json({ success: false, message: "Description and date are required" });
  }

  const query = `
    INSERT INTO todos (user_id, date, time, priority, description, completed, recurring)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [req.userId, date, time || null, priority || "Low", description, completed || false, recurring || "None"];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding todo:", err);
      return res.status(500).json({ success: false, message: "Failed to add todo" });
    }

    // If tags are provided, insert them into the todo_tags table
    if (tags && tags.length > 0) {
      const todoId = result.insertId;
      const tagValues = tags.map(tag => [todoId, tag]);
      db.query("INSERT INTO todo_tags (todo_id, tag) VALUES ?", [tagValues], (tagErr) => {
        if (tagErr) {
          console.error("Error adding tags:", tagErr);
        }
      });
    }

    res.json({ success: true, message: "To-do added!", id: result.insertId });
  });
});


// update existing todo
app.put("/api/todos/:id", authenticateUser, (req, res) => {
  const { id } = req.params;
  const { description, date, time, priority, completed, recurring, tags } = req.body;

  // Prepare fields to update dynamically
  let updates = [];
  let values = [];

  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (date !== undefined) {
    updates.push("date = ?");
    values.push(date);
  }
  if (time !== undefined) {
    updates.push("time = ?");
    values.push(time);
  }
  if (priority !== undefined) {
    updates.push("priority = ?");
    values.push(priority);
  }
  if (completed !== undefined) {
    updates.push("completed = ?");
    values.push(completed);
  }
  if (recurring !== undefined) {
    updates.push("recurring = ?");
    values.push(recurring);
  }

  // If no fields are provided, return an error
  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: "No fields to update" });
  }

  // Construct final query
  const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;
  values.push(id, req.userId);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating todo:", err);
      return res.status(500).json({ success: false, message: "Failed to update todo" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    // Update tags if provided
    if (tags) {
      db.query("DELETE FROM todo_tags WHERE todo_id = ?", [id], (delErr) => {
        if (delErr) {
          console.error("Error removing old tags:", delErr);
          return res.status(500).json({ success: false, message: "Failed to update tags" });
        }

        if (tags.length > 0) {
          const tagValues = tags.map(tag => [id, tag]);
          db.query("INSERT INTO todo_tags (todo_id, tag) VALUES ?", [tagValues], (tagErr) => {
            if (tagErr) {
              console.error("Error adding new tags:", tagErr);
              return res.status(500).json({ success: false, message: "Failed to insert new tags" });
            }
            res.json({ success: true, message: "To-do updated!" });
          });
        } else {
          res.json({ success: true, message: "To-do updated, no tags provided!" });
        }
      });
    } else {
      res.json({ success: true, message: "To-do updated!" });
    }
  });
});



// delete todo item
app.delete("/api/todos/:id", authenticateUser, (req, res) => {
  const { id } = req.params;

  // First, delete associated tags
  db.query("DELETE FROM todo_tags WHERE todo_id = ?", [id], (tagErr) => {
    if (tagErr) {
      console.error("Error deleting tags:", tagErr);
      // We log the error and continue to delete the todo item.
    }

    // Now delete the todo item
    const query = "DELETE FROM todos WHERE id = ? AND user_id = ?";
    db.query(query, [id, req.userId], (err, result) => {
      if (err) {
        console.error("Error deleting todo:", err);
        return res.status(500).json({ success: false, message: "Failed to delete todo" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Todo not found" });
      }

      res.json({ success: true, message: "To-do deleted!" });
    });
  });
});




//Account
app.get("/api/account", authenticateUser, (req, res) => {
  const query = "SELECT name, email FROM users WHERE id = ?";

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch user data." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, user: results[0] });
  });
});

app.put("/api/account", authenticateUser, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Name and email are required." });
  }

  const query = "UPDATE users SET name = ?, email = ? WHERE id = ?";

  db.query(query, [name, email, req.userId], (err, result) => {
    if (err) {
      console.error("Error updating user data:", err);
      return res.status(500).json({ success: false, message: "Failed to update account details." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "Account details updated successfully!" });
  });
});

// **GET Challenges (Returns 3 challenges per day)**
app.get("/api/challenge", (req, res) => {
  const date = req.query.date;
  const categories = ["PHYSICAL", "MENTAL", "SOCIAL", "CREATIVE", "PRODUCTIVE", "JOURNAL"];
  const challenges = [];

  db.promise()
    .query(`
      SELECT * FROM exercises 
      ORDER BY RAND() 
      LIMIT 3
    `)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.get("/api/challenge/today", authenticateUser, (req, res) => {
  const userId = req.userId;
  const today = new Date().toISOString().split('T')[0];

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
        title: result[0].title,  // Add this
        exercise: result[0].exercise,  // And this
        completed: result[0].completed_at !== null
      });
    } else {
      return res.json({
        success: false
      });
    }

  });
});


app.post("/api/challenge/select", authenticateUser, (req, res) => {
  const userId = req.userId;
  const { exercise_id } = req.body;
  const today = new Date().toISOString().split('T')[0];

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
});

app.post("/api/challenge/complete", authenticateUser, (req, res) => {
  const userId = req.userId;
  const { exercise_id } = req.body;
  const today = new Date().toISOString().split('T')[0];

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
});

//HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS
//HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS
//HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS
//HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS HABITS

// CREATE Habit
app.post('/api/habits', authenticateUser, (req, res) => {
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
});

// READ Habits (for a specific user)
app.get('/api/habits', authenticateUser, (req, res) => {
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
});

// UPDATE Habit (editing existing habit)
app.put('/api/habits/:habit_id', (req, res) => {
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
});

// DELETE Habit
app.delete('/api/habits/:habit_id', (req, res) => {
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
});

// Mark Habit as Completed (for daily or weekly tracking)
app.post('/api/habits/:habit_id/complete/:user_id', (req, res) => {
  const { habit_id, user_id } = req.params;
  const completion_date = new Date().toISOString().slice(0, 19).replace('T', ' '); // current timestamp

  // Check if the habit already exists for the user on this date
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
});



// ** Static Pages **
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "home.html")));
app.get("/journal", (req, res) => res.sendFile(path.join(__dirname, "views", "journal.html")));
app.get("/todo", (req, res) => res.sendFile(path.join(__dirname, "views", "todo.html")));
app.get("/account", (req, res) => res.sendFile(path.join(__dirname, "views", "account.html")));
app.get("/habits", (req, res) => res.sendFile(path.join(__dirname, "views", "habits.html")));
app.get("/mealplanner", (req, res) => res.sendFile(path.join(__dirname, "views", "mealplanner.html")));


// ** Logout Route **
app.get("/logout", (req, res) => res.oidc.logout({ returnTo: process.env.AUTH0_BASE_URL }));

// ** Start Server **
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));