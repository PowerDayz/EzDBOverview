const express = require('express');
const mysql = require('mysql');
const createConnection = mysql.createConnection;
const cors = require('cors');

const app = express();
const PORT = 3001;

// This will add the CORS headers to the response
app.use(cors());

// MySQL connection
const db = createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'qbcoreframework_b16ad6',
});

db.connect((err) => {
   if (err) throw err;
   console.log('Connected to the database');
});

// Example endpoint to get all data from a table
app.get('/getData', (req, res) => {
   const sql = 'SELECT * FROM players';
   db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
   });
});

app.listen(PORT, () => {
   console.log(`Server started on http://localhost:${PORT}`);
});
