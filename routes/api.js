// routes/api.js - Your backend API endpoints
const express = require('express');
const router = express.Router();

// Example: Get all applications
router.get('/applications', async (req, res) => {
  try {
    // Here you would fetch from your database
    // For now, return sample data
    res.json({ 
      applications: [
        { id: 1, company: 'Google', position: 'Software Engineer' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Create new application
router.post('/applications', async (req, res) => {
  try {
    const { company, position, status } = req.body;
    // Save to database
    res.status(201).json({ 
      message: 'Application created',
      application: { id: Date.now(), company, position, status }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Update application
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Update in database
    res.json({ message: 'Application updated', id, updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Delete application
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Delete from database
    res.json({ message: 'Application deleted', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;