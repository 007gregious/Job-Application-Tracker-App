const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

const jsonLimit = process.env.JSON_BODY_LIMIT || '100kb';

// Middleware
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});
app.use(express.json({ limit: jsonLimit }));

// API routes
app.use('/api', require('./routes/api'));

// Health check - VERY IMPORTANT for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  console.log('Running in PRODUCTION mode - serving from ./build');

  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('Running in DEVELOPMENT mode - API only');

  // Helpful message for development
  app.get('/', (req, res) => {
    res.json({
      message: 'API server is running',
      note: 'React app runs on port 3000 with "npm run client"',
      endpoints: ['/api/test', '/api/applications', '/health']
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
