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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applied_date ON applications(applied_date);

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
