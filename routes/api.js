const express = require('express');
const router = express.Router();
const db = require('../db');

const ALLOWED_QUEUE_STATUSES = ['draft', 'ready', 'submitted', 'paused'];

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Get all applications for a user
router.get('/applications', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await db.query(
      'SELECT * FROM applications WHERE user_id = $1 ORDER BY applied_date DESC',
      [userId]
    );

    res.json({ applications: result.rows });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new application
router.post('/applications', async (req, res) => {
  try {
    const {
      userId, company, position, location, salary,
      jobType, status, appliedDate, contactPerson,
      contactEmail, jobUrl, notes, source
    } = req.body;

    const result = await db.query(
      `INSERT INTO applications
       (user_id, company, position, location, salary, job_type, status,
        applied_date, contact_person, contact_email, job_url, notes, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [userId, company, position, location, salary, jobType, status,
        appliedDate, contactPerson, contactEmail, jobUrl, notes, source]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update application
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updates)];

    const result = await db.query(
      `UPDATE applications SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save/update apply packet for an application
router.post('/applications/:id/packet', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fitScore = 0,
      resumeVersion = null,
      coverLetter = null,
      answers = {},
      autofillUrl = null
    } = req.body || {};

    const answersJson = JSON.stringify(answers || {});

    const result = await db.query(
      `UPDATE applications
       SET fit_score = $2,
           packet_resume_version = $3,
           packet_cover_letter = $4,
           packet_answers_json = $5,
           autofill_url = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, fitScore, resumeVersion, coverLetter, answersJson, autofillUrl]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving apply packet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Move application to a queue status (draft, ready, paused, submitted)
router.post('/applications/:id/queue', async (req, res) => {
  try {
    const { id } = req.params;
    const { queueStatus = 'ready' } = req.body || {};

    if (!ALLOWED_QUEUE_STATUSES.includes(queueStatus)) {
      return res.status(400).json({
        error: `Invalid queueStatus. Allowed values: ${ALLOWED_QUEUE_STATUSES.join(', ')}`
      });
    }

    const result = await db.query(
      `UPDATE applications
       SET apply_queue_status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, queueStatus]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating queue status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm submission after user finishes the external form
router.post('/applications/:id/submitted', async (req, res) => {
  try {
    const { id } = req.params;
    const { appliedDate, notes } = req.body || {};
    const finalAppliedDate = appliedDate || new Date().toISOString().slice(0, 10);

    const result = await db.query(
      `UPDATE applications
       SET status = 'Applied',
           applied_date = $2,
           apply_queue_status = 'submitted',
           submitted_at = CURRENT_TIMESTAMP,
           notes = COALESCE($3, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, finalAppliedDate, notes || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error confirming submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pull the application queue for assisted auto-fill workflows
router.get('/queue', async (req, res) => {
  try {
    const { userId, status = 'ready' } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!ALLOWED_QUEUE_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${ALLOWED_QUEUE_STATUSES.join(', ')}`
      });
    }

    const result = await db.query(
      `SELECT * FROM applications
       WHERE user_id = $1 AND apply_queue_status = $2
       ORDER BY updated_at DESC`,
      [userId, status]
    );

    res.json({ queue: result.rows, status, total: result.rows.length });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete application
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM applications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted', id });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get application statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Applied' THEN 1 END) as applied,
        COUNT(CASE WHEN status = 'Interview' THEN 1 END) as interview,
        COUNT(CASE WHEN status = 'Offer' THEN 1 END) as offer,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
      FROM applications
      WHERE user_id = $1
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
