const express = require("express");
const { auth } = require("express-openid-connect");
require("dotenv").config();
const path = require("path");

const app = express();

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

// Serve static files (important!)
app.use(express.static(path.join(__dirname, "public")));

// API Route to provide user data to the frontend
app.get("/api/user", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json({ user: req.oidc.user });
  } else {
    res.json({ user: null });
  }
});

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Logout route (Redirects to Auth0 logout)
app.get("/logout", (req, res) => {
  res.oidc.logout({ returnTo: process.env.AUTH0_BASE_URL });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
