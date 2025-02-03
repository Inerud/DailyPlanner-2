const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'svl19_user', 
  password: ']!QXf;qaiLtf', 
  database: 'PlannerDB'
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

module.exports = db;