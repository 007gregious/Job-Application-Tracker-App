-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(100),
    job_type VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    applied_date DATE NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    job_url TEXT,
    notes TEXT,
    source VARCHAR(100),
    fit_score INTEGER DEFAULT 0,
    fit_score_breakdown_json TEXT,
    confidence_score INTEGER DEFAULT 0,
    packet_readiness_score INTEGER DEFAULT 0,
    apply_queue_status VARCHAR(30) DEFAULT 'draft',
    packet_resume_version VARCHAR(120),
    packet_cover_letter TEXT,
    packet_answers_json TEXT,
    autofill_url TEXT,
    submitted_url TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration-safe column additions for existing databases
ALTER TABLE applications ADD COLUMN IF NOT EXISTS fit_score INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS fit_score_breakdown_json TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS packet_readiness_score INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS apply_queue_status VARCHAR(30) DEFAULT 'draft';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS packet_resume_version VARCHAR(120);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS packet_cover_letter TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS packet_answers_json TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS autofill_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitted_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;

-- Track imported opportunities without requiring a full application row yet
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(100),
    job_url TEXT,
    source VARCHAR(100),
    raw_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit submission/governance events
CREATE TABLE IF NOT EXISTS submission_audit_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    event_type VARCHAR(80) NOT NULL,
    details_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applied_date ON applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_apply_queue_status ON applications(apply_queue_status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_audit_application_id ON submission_audit_logs(application_id);

-- Create reminders table for future feature
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
