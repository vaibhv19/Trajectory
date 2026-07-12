-- 1. Setup Enums for Status Tracking
CREATE TYPE application_status AS ENUM (
    'APPLIED', 
    'OA', 
    'INTERVIEW', 
    'OFFER', 
    'REJECTED', 
    'GHOSTED', 
    'WITHDRAWN'
);

CREATE TYPE outreach_status AS ENUM (
    'PENDING', 
    'CONTACTED', 
    'REPLIED', 
    'INTERVIEW_SECURED', 
    'NO_RESPONSE'
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url TEXT,
    auth_provider VARCHAR(50) DEFAULT 'LOCAL', -- LOCAL, GOOGLE, GITHUB
    ghost_threshold_days INT DEFAULT 30,
    auto_archive_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Career Profiles (e.g., "Frontend Engineer", "Product Manager")
CREATE TABLE career_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#3b82f6', -- Hex color for UI
    icon_identifier VARCHAR(50), -- Lucide icon name
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Resume Versions
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES career_profiles(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    s3_key TEXT NOT NULL, -- Path to file in storage
    file_name VARCHAR(255) NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, version_number)
);

-- 5. Applications (The core entity)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES career_profiles(id),
    resume_id UUID REFERENCES resumes(id),
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    job_description_url TEXT,
    job_description_raw TEXT, -- Saved for AI analysis & preservation
    status application_status DEFAULT 'APPLIED',
    source VARCHAR(100), -- LinkedIn, Indeed, Referral
    salary_range VARCHAR(100),
    date_applied DATE DEFAULT CURRENT_DATE,
    follow_up_date DATE,
    response_date DATE, -- Date company first contacted user
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Application Status History (For the Timeline View)
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status application_status NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cold Outreach & Networking (CRM)
CREATE TABLE outreach (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position_discussed VARCHAR(255),
    email VARCHAR(255),
    linkedin_url TEXT,
    status outreach_status DEFAULT 'PENDING',
    date_sent DATE DEFAULT CURRENT_DATE,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Company Resources & Documents
CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    s3_key TEXT NOT NULL,
    document_type VARCHAR(50), -- e.g., "Benefit Guide", "Process PDF"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Indexes for Performance
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_outreach_user ON outreach(user_id);
CREATE INDEX idx_resumes_profile ON resumes(profile_id);
CREATE INDEX idx_status_history_app ON application_status_history(application_id);