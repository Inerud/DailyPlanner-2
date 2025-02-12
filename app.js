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
function saveUserIfNotExists(user) {
  const query = 'SELECT * FROM users WHERE auth0_id = ?';
  db.query(query, [user.sub], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return;
    }
    if (results.length === 0) {
      const insertQuery = 'INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)';
      db.query(insertQuery, [user.sub, user.email, user.name], (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log('User saved to database:', user.name);
        }
      });
    }
  });
}

// API route for user data
app.get("/api/user", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    saveUserIfNotExists(req.oidc.user); // Save user if not exists
    res.json({ user: req.oidc.user });
  } else {
    res.json({ user: null });
  }
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
