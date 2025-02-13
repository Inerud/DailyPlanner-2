const express = require("express");
const { auth } = require("express-openid-connect");
require("dotenv").config();
const path = require("path");
const mysql = require("mysql2");
const db = require("./server/config/db.js");

const app = express();
const PORT = process.env.PORT;

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};

// Use Auth0 middleware
app.use(auth(config));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Function to check if user exists and insert if not
function saveUserIfNotExists(user, callback) {
  const query = 'SELECT id FROM users WHERE auth0_id = ?';
  db.query(query, [user.sub], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return callback(err);
    }
    if (results.length === 0) {
      const insertQuery = 'INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)';
      db.query(insertQuery, [user.sub, user.email, user.name], (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
          return callback(err);
        }
        console.log('User saved to database:', user.name);
        callback(null, results.insertId); // Return the new user's ID
      });
    } else {
      callback(null, results[0].id); // Return the existing user's ID
    }
  });
}

// API route for user data
app.get("/api/user", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    saveUserIfNotExists(req.oidc.user, (err, userId) => {
      if (err) {
        console.error('Error saving user:', err);
        return res.status(500).json({ error: 'Failed to save user' });
      }
      console.log('User ID:', userId);
      res.json({ user: req.oidc.user });
    });
  } else {
    res.json({ user: null });
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// API route to add a new journal entry
app.post("/api/journal", (req, res) => {
  const { entry } = req.body;
  const auth0Id = req.oidc.user.sub; // Get the Auth0 ID

  // Get the user's ID from your database
  saveUserIfNotExists(req.oidc.user, (err, userId) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Failed to retrieve user ID." });
    }

    const query = 'INSERT INTO journal_entries (user_id, entry) VALUES (?, ?)';
    db.query(query, [userId, entry], (err, results) => {
      if (err) {
        console.error("Error saving journal entry:", err);
        return res.status(500).json({ success: false, message: "Failed to save journal entry." });
      }
      res.json({ success: true, message: "Journal entry saved!" });
    });
  });
});

// API route to fetch all journal entries for the user
app.get("/api/journal", (req, res) => {
  const auth0Id = req.oidc.user.sub; // Get the Auth0 ID

  // Get the user's ID from the database
  saveUserIfNotExists(req.oidc.user, (err, userId) => {
      if (err) {
          return res.status(500).json({ success: false, message: "Failed to retrieve user ID." });
      }

      // Fetch all journal entries for the user
      const query = 'SELECT id, entry, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC';
      db.query(query, [userId], (err, results) => {
          if (err) {
              console.error("Error fetching journal entries:", err);
              return res.status(500).json({ success: false, message: "Failed to fetch journal entries." });
          }

          if (results.length > 0) {
              res.json({ entries: results });
          } else {
              res.json({ entries: [] });
          }
      });
  });
});


// API route to update a journal entry
app.put("/api/journal/:id", (req, res) => {
  const entryId = req.params.id;
  const { entry } = req.body;
  const userId = req.oidc.user.sub; // Get the authenticated user's ID from Auth0

  if (!entry) {
    return res.status(400).json({ success: false, message: "Journal entry is required." });
  }

  const query = 'UPDATE journal_entries SET entry = ? WHERE id = ? AND user_id = ?';
  db.query(query, [entry, entryId, userId], (err, results) => {
    if (err) {
      console.error("Error updating journal entry:", err);
      return res.status(500).json({ success: false, message: "Failed to update journal entry." });
    }
    res.json({ success: true, message: "Journal entry updated!" });
  });
});

// API route to delete a journal entry
app.delete("/api/journal/:id", (req, res) => {
  const entryId = req.params.id;
  const userId = req.oidc.user.sub; // Get the authenticated user's ID from Auth0

  const query = 'DELETE FROM journal_entries WHERE id = ? AND user_id = ?';
  db.query(query, [entryId, userId], (err, results) => {
    if (err) {
      console.error("Error deleting journal entry:", err);
      return res.status(500).json({ success: false, message: "Failed to delete journal entry." });
    }
    res.json({ success: true, message: "Journal entry deleted!" });
  });
});


// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Serve journal.html
app.get("/journal", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "journal.html"));
})

// Logout route (Redirects to Auth0)
app.get("/logout", (req, res) => {
  res.oidc.logout({ returnTo: process.env.AUTH0_BASE_URL });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
