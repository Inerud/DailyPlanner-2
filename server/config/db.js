const mysql = require("mysql2");
require("dotenv").config();

let db;

db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Failed: ", err.message);
    setTimeout(handleDisconnect, 5000); // Retry after 5 seconds
  } else {
    console.log("MySQL Connected!");
  }
});

db.on("error", (err) => {
  console.error("MySQL Error: ", err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Reconnecting...");
    handleDisconnect(); // Reconnect on lost connection
  }
});

module.exports = db;
