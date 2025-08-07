const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Rate limiting store
const rateLimitStore = new Map();

// Simple rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
  } else {
    const clientData = rateLimitStore.get(clientIP);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }
  }

  const clientData = rateLimitStore.get(clientIP);
  if (clientData.count > maxRequests) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }

  next();
};

// API endpoint to fetch HTML from URL
app.get('/api/fetch-url', rateLimit, async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch the HTML content
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    
    // Use cheerio to parse and clean the HTML
    const $ = cheerio.load(html);
    
    // Remove script and style tags to clean up the HTML
    $('script').remove();
    $('style').remove();
    
    const cleanedHtml = $.html();

    res.json({ 
      html: cleanedHtml,
      url: url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching URL:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Unable to connect to the server' });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: `HTTP ${error.response.status}: ${error.response.statusText}` 
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch URL: ' + error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 