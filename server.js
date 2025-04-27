const express = require("express");
const path = require("path");
const cors = require("cors");
const { auth } = require("express-openid-connect");
require("dotenv").config();

// Import configuration and middleware
const db = require("./server/config/db");
const authMiddleware = require("./server/middleware/authMiddleware");

// Import routes
const accountRoutes = require("./server/routes/accountRoutes");
const dashboardRoutes = require("./server/routes/dashboardRoutes");
const journalRoutes = require("./server/routes/journalRoutes");
const todoRoutes = require("./server/routes/todoRoutes");
const challengeRoutes = require("./server/routes/challengeRoutes");
const habitRoutes = require("./server/routes/habitRoutes");
const mealRoutes = require('./server/routes/mealRoutes');
const grocerylistRoutes = require("./server/routes/grocerylistRoutes")

// Initialize app
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
app.use(auth(authConfig)); // Auth0 Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json()); // Parse JSON payloads
app.use(cors()); // Enable CORS for all routes

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Use routes
app.use("/api", accountRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/habits", habitRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/grocery', grocerylistRoutes);

// ** Static Pages Routes **
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
