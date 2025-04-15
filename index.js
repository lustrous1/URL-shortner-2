const express = require('express');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Simple route to check if the server is working
app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortener API');
});

// Route to create short URL
app.post('/shorten', async (req, res) => {
  const { original_url } = req.body;
  if (!original_url) {
    return res.status(400).json({ error: 'Missing original_url' });
  }

  // Generating short URL
  const short_url = shortid.generate();

  // In this example, we're using an in-memory object to store URLs
  // In a real app, you would use a database like MongoDB or SQLite
  const url = {
    original_url,
    short_url
  };

  // Return the shortened URL
  res.json({
    original_url,
    short_url: `https://${req.headers.host}/${short_url}`
  });
});

// Redirect from short URL to the original URL
app.get('/:short_url', (req, res) => {
  const { short_url } = req.params;

  // You would replace this with a real lookup from a database
  const url = { original_url: 'https://www.example.com' }; // Example URL

  if (url) {
    res.redirect(url.original_url);
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
