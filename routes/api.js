const express = require('express');
const router = express.Router();
const db = require('../db');

const ALLOWED_QUEUE_STATUSES = ['draft', 'ready', 'submitted', 'paused'];
const DAILY_APPLY_CAP_DEFAULT = Number(process.env.DAILY_APPLY_CAP || 15);
const COOLDOWN_HOURS_DEFAULT = Number(process.env.APPLY_COOLDOWN_HOURS || 8);

const normalizeString = (value = '') => value.toString().trim().toLowerCase();

const tokenize = (value = '') => normalizeString(value)
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const scoreKeywordMatch = (position = '', notes = '') => {
  const keywords = tokenize(`${position} ${notes}`);

  if (keywords.length === 0) {
    return { score: 50, matched: 0, total: 0 };
  }

  const uniqueKeywords = Array.from(new Set(keywords));
  const matchedKeywords = uniqueKeywords.filter((word) => word.length > 3);
  const ratio = matchedKeywords.length / uniqueKeywords.length;

  return {
    score: Math.round(Math.min(100, ratio * 100)),
    matched: matchedKeywords.length,
    total: uniqueKeywords.length
  };
};

const scoreLocationFit = (location = '', preferences = {}) => {
  const locationValue = normalizeString(location);
  const preferredLocation = normalizeString(preferences.preferredLocation || '');

  if (!locationValue) {
    return 60;
  }

  if (locationValue.includes('remote')) {
    return 95;
  }

  if (preferredLocation && locationValue.includes(preferredLocation)) {
    return 90;
  }

  if (preferredLocation) {
    return 45;
  }

  return 70;
};

const scoreSeniorityFit = (position = '', profile = {}) => {
  const title = normalizeString(position);
  const level = normalizeString(profile.seniority || 'mid');

  if (!title) {
    return 60;
  }

  const isSeniorRole = /\b(senior|staff|principal|lead)\b/.test(title);
  const isJuniorRole = /\b(intern|junior|entry)\b/.test(title);

  if (isSeniorRole && ['senior', 'staff', 'lead'].includes(level)) {
    return 90;
  }

  if (isJuniorRole && ['junior', 'entry'].includes(level)) {
    return 90;
  }

  if (!isSeniorRole && !isJuniorRole && ['mid', 'senior'].includes(level)) {
    return 80;
  }

  return 50;
};

const scoreVisaRemoteCompatibility = (jobType = '', notes = '', preferences = {}) => {
  const combined = normalizeString(`${jobType} ${notes}`);
  const needsSponsorship = Boolean(preferences.needsSponsorship);
  const prefersRemote = Boolean(preferences.prefersRemote);

  const mentionsNoVisa = /\b(no visa|no sponsorship|without sponsorship)\b/.test(combined);
  const isRemote = /\bremote\b/.test(combined);

  if (needsSponsorship && mentionsNoVisa) {
    return 15;
  }

  if (prefersRemote && isRemote) {
    return 95;
  }

  if (prefersRemote && !isRemote) {
    return 50;
  }

  return 75;
};

const buildFitScore = (application, preferences = {}) => {
  const keyword = scoreKeywordMatch(application.position, application.notes);
  const location = scoreLocationFit(application.location, preferences);
  const seniority = scoreSeniorityFit(application.position, preferences);
  const visaRemote = scoreVisaRemoteCompatibility(application.job_type, application.notes, preferences);

  const total = Math.round((keyword.score * 0.35) + (location * 0.2) + (seniority * 0.2) + (visaRemote * 0.25));

  return {
    total,
    breakdown: {
      keyword: keyword.score,
      location,
      seniority,
      visaRemote,
      matchedKeywords: keyword.matched,
      keywordPool: keyword.total
    }
  };
};

const getReadinessScore = ({ coverLetter, resumeVersion, answers, fitScore }) => {
  const hasResume = Boolean(resumeVersion);
  const hasCoverLetter = Boolean(coverLetter && coverLetter.trim().length >= 120);
  const answersCount = Object.keys(answers || {}).filter((key) => {
    const answer = answers[key];
    return typeof answer === 'string' && answer.trim().length > 10;
  }).length;

  let score = 0;
  if (hasResume) score += 30;
  if (hasCoverLetter) score += 30;
  score += Math.min(20, answersCount * 7);
  score += Math.round((fitScore || 0) * 0.2);

  return Math.min(100, score);
};

const createAuditLog = async ({ applicationId, eventType, details = {} }) => {
  await db.query(
    `INSERT INTO submission_audit_logs (application_id, event_type, details_json)
     VALUES ($1, $2, $3)`,
    [applicationId, eventType, JSON.stringify(details)]
  );
};

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

router.post('/jobs/import', async (req, res) => {
  try {
    const {
      userId,
      opportunities = []
    } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      return res.status(400).json({ error: 'opportunities must be a non-empty array' });
    }

    const inserted = [];

    for (const opportunity of opportunities) {
      const {
        company,
        position,
        location,
        salary,
        jobUrl,
        source,
        rawJson
      } = opportunity;

      if (!company || !position) {
        continue;
      }

      const result = await db.query(
        `INSERT INTO jobs
         (user_id, company, position, location, salary, job_url, source, raw_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, company, position, location || null, salary || null, jobUrl || null, source || null, JSON.stringify(rawJson || {})]
      );

      inserted.push(result.rows[0]);
    }

    res.status(201).json({ imported: inserted.length, jobs: inserted });
  } catch (error) {
    console.error('Error importing jobs:', error);
    res.status(500).json({ error: error.message });
  }
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
      resumeVersion = null,
      coverLetter = null,
      answers = {},
      autofillUrl = null,
      preferences = {}
    } = req.body || {};

    const current = await db.query('SELECT * FROM applications WHERE id = $1', [id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = current.rows[0];
    const fitScoring = buildFitScore(app, preferences);
    const readinessScore = getReadinessScore({
      coverLetter,
      resumeVersion,
      answers,
      fitScore: fitScoring.total
    });

    const result = await db.query(
      `UPDATE applications
       SET fit_score = $2,
           fit_score_breakdown_json = $3,
           packet_resume_version = $4,
           packet_cover_letter = $5,
           packet_answers_json = $6,
           packet_readiness_score = $7,
           confidence_score = $8,
           autofill_url = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [
        id,
        fitScoring.total,
        JSON.stringify(fitScoring.breakdown),
        resumeVersion,
        coverLetter,
        JSON.stringify(answers || {}),
        readinessScore,
        fitScoring.total,
        autofillUrl
      ]
    );

    await createAuditLog({
      applicationId: id,
      eventType: 'PACKET_UPDATED',
      details: {
        fitScore: fitScoring.total,
        readinessScore,
        hasCoverLetter: Boolean(coverLetter),
        answersCount: Object.keys(answers || {}).length
      }
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving apply packet:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/applications/:id/ready', async (req, res) => {
  try {
    const { id } = req.params;
    const { minimumReadiness = 65 } = req.body || {};

    const current = await db.query('SELECT * FROM applications WHERE id = $1', [id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = current.rows[0];

    if ((app.packet_readiness_score || 0) < minimumReadiness) {
      return res.status(400).json({
        error: `Application readiness score must be at least ${minimumReadiness} to move to ready queue`
      });
    }

    const duplicate = await db.query(
      `SELECT id FROM applications
       WHERE user_id = $1
         AND id <> $2
         AND LOWER(company) = LOWER($3)
         AND LOWER(position) = LOWER($4)
         AND apply_queue_status IN ('ready', 'submitted')
       LIMIT 1`,
      [app.user_id, id, app.company, app.position]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        error: 'Potential duplicate detected for same company and role in ready/submitted queue'
      });
    }

    const result = await db.query(
      `UPDATE applications
       SET apply_queue_status = 'ready',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await createAuditLog({
      applicationId: id,
      eventType: 'QUEUED_READY',
      details: { readinessScore: app.packet_readiness_score || 0 }
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moving application to ready queue:', error);
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

    await createAuditLog({
      applicationId: id,
      eventType: 'QUEUE_STATUS_UPDATED',
      details: { queueStatus }
    });

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
    const { appliedDate, notes, submittedUrl, overrideCap = false } = req.body || {};
    const finalAppliedDate = appliedDate || new Date().toISOString().slice(0, 10);

    const current = await db.query('SELECT * FROM applications WHERE id = $1', [id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = current.rows[0];

    const dailySubmissions = await db.query(
      `SELECT COUNT(*) AS total
       FROM applications
       WHERE user_id = $1
         AND status = 'Applied'
         AND applied_date = $2`,
      [app.user_id, finalAppliedDate]
    );

    const totalToday = Number(dailySubmissions.rows[0]?.total || 0);
    if (!overrideCap && totalToday >= DAILY_APPLY_CAP_DEFAULT) {
      return res.status(429).json({
        error: `Daily apply cap reached (${DAILY_APPLY_CAP_DEFAULT})`,
        appliedToday: totalToday
      });
    }

    const lastSubmission = await db.query(
      `SELECT submitted_at FROM applications
       WHERE user_id = $1 AND submitted_at IS NOT NULL
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [app.user_id]
    );

    if (lastSubmission.rows.length > 0 && COOLDOWN_HOURS_DEFAULT > 0) {
      const latest = new Date(lastSubmission.rows[0].submitted_at);
      const elapsedHours = (Date.now() - latest.getTime()) / (1000 * 60 * 60);
      if (elapsedHours < COOLDOWN_HOURS_DEFAULT) {
        return res.status(429).json({
          error: `Cooldown active. Try again after ${COOLDOWN_HOURS_DEFAULT} hours between submissions.`
        });
      }
    }

    const result = await db.query(
      `UPDATE applications
       SET status = 'Applied',
           applied_date = $2,
           apply_queue_status = 'submitted',
           submitted_at = CURRENT_TIMESTAMP,
           submitted_url = COALESCE($3, submitted_url),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, finalAppliedDate, submittedUrl || null, notes || null]
    );

    await createAuditLog({
      applicationId: id,
      eventType: 'SUBMITTED_CONFIRMED',
      details: {
        appliedDate: finalAppliedDate,
        submittedUrl: submittedUrl || null
      }
    });

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
