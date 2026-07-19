-- Add missing columns to applications
ALTER TABLE applications ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE applications ADD COLUMN oa_date_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN interview_date_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE applications ADD COLUMN meeting_link VARCHAR(255);

-- Add missing columns to users
ALTER TABLE users ADD COLUMN browser_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE users ADD COLUMN ai_extractions_count INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN last_ai_extraction_date DATE;

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO' NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);
