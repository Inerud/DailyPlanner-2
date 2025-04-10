const db = require("../config/db.js");

// Get authenticated user data
exports.getUserData = (req, res) => {
    if (!req.oidc || !req.oidc.user) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }
    res.json({ success: true, user: req.oidc.user });
};

// Fetch user account details
exports.getAccount = (req, res) => {
    console.log("User ID from middleware:", req.userId); // Debugging
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
};

// Update user account details
exports.updateAccount = (req, res) => {
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
};

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
