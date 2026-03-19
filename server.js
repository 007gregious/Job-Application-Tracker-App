const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

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
  console.log('Ì≥¶ Running in PRODUCTION mode - serving from ./build');
  
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('Ì¥ß Running in DEVELOPMENT mode - API only');
  
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
  console.log(`Ì∫Ä Server running on port ${PORT}`);
  console.log(`Ìºç Environment: ${process.env.NODE_ENV || 'development'}`);
});
