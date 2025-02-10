const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "PlannerDB",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Failed: ", err.message);
    return;
  }
  console.log("MySQL Connected!");
});

module.exports = db;
