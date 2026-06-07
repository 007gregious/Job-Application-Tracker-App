const express = require('express');
const router = express.Router();
const db = require('../db');

const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const NUMBER_PATTERN = /^\d+$/;
const SAFE_URL_PROTOCOLS = ['http:', 'https:'];
const MAX_TEXT_LENGTH = 5000;

const UPDATE_FIELDS = {
  company: 'company',
  position: 'position',
  location: 'location',
  salary: 'salary',
  jobType: 'job_type',
  job_type: 'job_type',
  status: 'status',
  appliedDate: 'applied_date',
  applied_date: 'applied_date',
  contactPerson: 'contact_person',
  contact_person: 'contact_person',
  contactEmail: 'contact_email',
  contact_email: 'contact_email',
  jobUrl: 'job_url',
  job_url: 'job_url',
  notes: 'notes',
  source: 'source'
};

const REQUIRED_CREATE_FIELDS = ['userId', 'company', 'position', 'status', 'appliedDate'];

const isValidUserId = (userId) => typeof userId === 'string' && USER_ID_PATTERN.test(userId);
const isValidApplicationId = (id) => NUMBER_PATTERN.test(String(id));

const sendServerError = (res, message, error) => {
  console.error(message, error);
  res.status(500).json({ error: 'Internal server error' });
};

const normalizeString = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  return value.trim().slice(0, MAX_TEXT_LENGTH);
};

const isSafeHttpUrl = (value) => {
  if (!value) return true;

  try {
    return SAFE_URL_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const validateApplicationPayload = (payload, { partial = false } = {}) => {
  const errors = {};

  if (!partial) {
    REQUIRED_CREATE_FIELDS.forEach((field) => {
      if (!payload[field] || (typeof payload[field] === 'string' && !payload[field].trim())) {
        errors[field] = `${field} is required`;
      }
    });
  }

  if (payload.userId !== undefined && !isValidUserId(payload.userId)) {
    errors.userId = 'Invalid userId';
  }

  if (payload.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) {
    errors.contactEmail = 'Invalid contact email';
  }

  if (payload.jobUrl && !isSafeHttpUrl(payload.jobUrl)) {
    errors.jobUrl = 'Job URL must use HTTP or HTTPS';
  }

  return errors;
};

const getScopedUserId = (req) => req.body.userId || req.query.userId;

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

    if (!isValidUserId(userId)) {
      return res.status(400).json({ error: 'A valid userId is required' });
    }

    const result = await db.query(
      'SELECT * FROM applications WHERE user_id = $1 ORDER BY applied_date DESC',
      [userId]
    );

    res.json({ applications: result.rows });
  } catch (error) {
    sendServerError(res, 'Error fetching applications:', error);
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

    const validationErrors = validateApplicationPayload(req.body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const result = await db.query(
      `INSERT INTO applications
       (user_id, company, position, location, salary, job_type, status,
        applied_date, contact_person, contact_email, job_url, notes, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [userId, company, position, normalizeString(location), normalizeString(salary), normalizeString(jobType), status,
        appliedDate, normalizeString(contactPerson), normalizeString(contactEmail), normalizeString(jobUrl), normalizeString(notes), normalizeString(source)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    sendServerError(res, 'Error creating application:', error);
  }
});

// Update application
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scopedUserId = getScopedUserId(req);
    const updates = { ...req.body };
    delete updates.userId;

    if (!isValidApplicationId(id)) {
      return res.status(400).json({ error: 'Invalid application id' });
    }

    if (!isValidUserId(scopedUserId)) {
      return res.status(400).json({ error: 'A valid userId is required' });
    }

    const validationErrors = validateApplicationPayload(req.body, { partial: true });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const entries = Object.entries(updates).filter(([key]) => UPDATE_FIELDS[key]);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const setClause = entries
      .map(([key], index) => `${UPDATE_FIELDS[key]} = $${index + 3}`)
      .join(', ');

    const values = [id, scopedUserId, ...entries.map(([, value]) => normalizeString(value))];

    const result = await db.query(
      `UPDATE applications SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    sendServerError(res, 'Error updating application:', error);
  }
});

// Delete application
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scopedUserId = getScopedUserId(req);

    if (!isValidApplicationId(id)) {
      return res.status(400).json({ error: 'Invalid application id' });
    }

    if (!isValidUserId(scopedUserId)) {
      return res.status(400).json({ error: 'A valid userId is required' });
    }

    const result = await db.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, scopedUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted', id });
  } catch (error) {
    sendServerError(res, 'Error deleting application:', error);
  }
});

// Get application statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidUserId(userId)) {
      return res.status(400).json({ error: 'A valid userId is required' });
    }

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
    sendServerError(res, 'Error fetching stats:', error);
  }
});

module.exports = router;
