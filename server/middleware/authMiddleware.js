const db = require("../config/db.js");

const authenticateUser = async (req, res, next) => {
    if (!req.oidc || !req.oidc.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        req.userId = await getOrCreateUser(req.oidc.user);
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
};

// ** Fix `getOrCreateUser` to ensure proper user creation **
const getOrCreateUser = (user) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT id FROM users WHERE auth0_id = ?";
        db.query(query, [user.sub], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) {
                return resolve(results[0].id);
            }

            // If user is not found, insert a new one
            const insertQuery = "INSERT INTO users (auth0_id, email, name) VALUES (?, ?, ?)";
            db.query(insertQuery, [user.sub, user.email, user.name], (err, result) => {
                if (err) return reject(err);
                console.log("New user created with ID:", result.insertId);
                resolve(result.insertId);
            });
        });
    });
};

module.exports = { authenticateUser };
