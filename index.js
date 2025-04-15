const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const shortid = require('shortid');
const app = express();

// Set up Express to handle JSON bodies
app.use(express.json());

// Create or open a database file
const db = new sqlite3.Database('./urls.db', (err) => {
  if (err) {
    console.error("Database opening error: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create the URLs table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, original_url TEXT NOT NULL, short_url TEXT NOT NULL UNIQUE)", (err) => {
  if (err) {
    console.error("Table creation error: " + err.message);
  }
});

// Route to create a short URL
app.post('/shorten', (req, res) => {
  const { original_url } = req.body;
  if (!original_url) {
    return res.status(400).json({ error: 'Missing original_url' });
  }

  const short_url = shortid.generate();
  const stmt = db.prepare("INSERT INTO urls (original_url, short_url) VALUES (?, ?)");
  stmt.run(original_url, short_url, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json({
      original_url,
      short_url: `https://your-project-name.vercel.app/${short_url}`,
    });
  });
  stmt.finalize();
});

// Route to handle the redirection
app.get('/:short_url', (req, res) => {
  const { short_url } = req.params;
  db.get("SELECT * FROM urls WHERE short_url = ?", [short_url], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    if (row) {
      return res.redirect(row.original_url);
    }
    res.status(404).json({ error: 'URL not found' });
  });
});

// Route to get all stored URLs (optional, for testing)
app.get('/urls', (req, res) => {
  db.all("SELECT * FROM urls", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.json(rows);
  });
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
