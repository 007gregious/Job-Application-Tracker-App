// server.js - This is in my project root folder
const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Your API routes - handles requests to /api/*
app.use('/api', require('./routes/api'));

// Health check endpoint (Render uses this)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// All other requests go to React - This MUST be last!
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});