const express = require("express");
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
    res.json({ success: true, todos: results });
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

  const query = `
    UPDATE todos
    SET description = ?, date = ?, time = ?, priority = ?, completed = ?, recurring = ?
    WHERE id = ? AND user_id = ?
  `;
  const values = [description, date, time || null, priority || "Low", completed || false, recurring || "None", id, req.userId];
  
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
      // First, remove any existing tags for this todo
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


// ** Static Pages **
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "index.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "views", "home.html")));
app.get("/journal", (req, res) => res.sendFile(path.join(__dirname, "views", "journal.html")));
app.get("/todo", (req, res) => res.sendFile(path.join(__dirname, "views", "todo.html")));
app.get("/account", (req, res) => res.sendFile(path.join(__dirname, "views", "account.html")));
app.get("/habits", (req, res) => res.sendFile(path.join(__dirname, "views", "habits.html")));
app.get("/mealplanner", (req, res) => res.sendFile(path.join(__dirname, "views", "mealplanner.html")));


// ** Logout Route **
app.get("/logout", (req, res) => res.oidc.logout({ returnTo: process.env.AUTH0_BASE_URL }));

// ** Start Server **
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));