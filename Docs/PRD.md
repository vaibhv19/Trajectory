# Product Requirements Document (PRD): Trajectory

**Project Name:** Trajectory – Your Career Operating System  
**Status:** Production Ready / Deployed  
**Document Version:** 2.0 (Synchronized with Source Implementation)  

---

## 1. Executive Summary
**Trajectory** is a comprehensive, full-stack career management platform designed to centralize and automate the fragmented job search process. By moving beyond static spreadsheets, Trajectory integrates resume versioning, AI-powered data extraction, cold outreach tracking, placement criteria sheets, and deep analytics into a unified "Command Center" (Dashboard).

The system operates as a decoupled architecture: a **React 19 SPA** hosted on **Vercel** communicating via HTTPS with a **Java 21 / Spring Boot 3.3.1 REST API** running in Docker on an **AWS EC2** instance, backed by **AWS RDS PostgreSQL 16** and **AWS S3**.

---

## 2. Target Persona & User Demographics
- **Active Job Seekers:** New graduates and experienced software engineers managing high volumes of applications (50–200+ roles).
- **Multi-Track Applicants:** Engineers maintaining multiple career personas (e.g. applying for both "Frontend Engineer" and "Full Stack Developer" roles).
- **Power Networkers:** Applicants leveraging recruiter outreach, tracking cold messages, and converting successful outreach into formal applications.

---

## 3. Product Features & Functional Requirements

### 3.1 Dashboard (The Command Center)
- **Pipeline Metrics Cards:** High-level counters for `Total`, `Active`, `Rejected`, and `Ghosted` applications.
- **Funnel Analytics:** Numerical tracking of Online Assessments (OAs), Interviews, and Offers.
- **Performance Rates:** Real-time percentage conversion metrics:
  - **Response Rate:** `(OAs + Interviews + Offers) / Total Applications`
  - **Interview Conversion Rate:** `Interviews / (OAs + Applied)`
  - **Offer Conversion Rate:** `Offers / Interviews`
- **Temporal Metrics:** Rollup counts for applications submitted "This Week" (rolling 7 days) and "This Month".
- **Analytics Charts (Recharts):** Visual charts rendering application distribution by source and career profile.
- **Today's Agenda Widget:** Consolidated daily action list showing upcoming OA/Interview start times and CRM follow-up dates.

### 3.2 Job Application Management (CRUD & Timeline)
- **Core Attributes:** Company Name, Role Title, Location, Career Profile, Resume Version, Applied Date, Source (LinkedIn, Indeed, Referral), Salary Range, Job Description URL, and Notes.
- **Status Lifecycle State Machine:** Enforces `application_status` ENUM transitions (`APPLIED`, `OA`, `INTERVIEW`, `OFFER`, `REJECTED`, `GHOSTED`, `WITHDRAWN`).
- **Timeline Audit History (`application_status_history`):** Every status change logs the new status, timestamp (`changed_at`), notes, and calculates duration spent in the previous stage.
- **Smart Date & Meeting Fields:** When status changes to `OA` or `INTERVIEW`, system prompts for `oa_date_time` or `interview_date_time` and `meeting_link`.
- **Archival Control (`is_archived`):** One-click toggle to archive rejected or inactive applications without deleting history.
- **Automated Ghost Detection:** Spring Scheduler daemon automatically flips status to `GHOSTED` for applications inactive beyond the user's `ghost_threshold_days` (default: 30 days).

### 3.3 Career Profiles & Versioned Resumes
- **Career Profiles (`career_profiles`):** Create personas (e.g., "Full Stack Dev", "Product Manager") with custom Hex color codes (`color_code`) and Lucide icon identifiers (`icon_identifier`).
- **Auto-Version Increment:** Uploading a new resume for a profile auto-increments the `version_number` (v1 ➔ v2 ➔ v3).
- **S3 File Storage:** Resumes are stored privately in AWS S3 (`s3_key`). Users can download or delete binaries.
- **Inline Resume Upload:** Allows uploading a new resume version directly within the "Add Application" modal.
- **Changelog:** Notes field for each resume version to record what skills/sections changed.

### 3.4 Cold Outreach & Networking CRM
- **Contact Tracking (`outreach`):** Recruiter name, company, email, LinkedIn URL, position discussed, date sent, and follow-up date.
- **Outreach Status State Machine:** ENUM values (`PENDING`, `CONTACTED`, `REPLIED`, `INTERVIEW_SECURED`, `NO_RESPONSE`).
- **AI Sentiment Analysis:** Paste recruiter replies into the AI analysis modal to evaluate sentiment and suggest status updates.
- **One-Click Application Conversion:** Convert an outreach contact into a formal job application entry, transferring contact details and notes.

### 3.5 AI-Powered Workflow Automation (Spring AI + Groq)
- **Job Description Parsing (`POST /api/ai/extract-jd`):** Extracts `company_name`, `role_title`, `location`, `skills`, `salary_range`, and `suggested_profile_title` from raw job descriptions.
- **Schedule Invite Parsing (`POST /api/ai/extract-event`):** Extracts `event_type`, `event_date`, `event_time`, `meeting_link`, and `duration_minutes` from recruiter emails.
- **Outreach Response Sentiment (`POST /api/ai/analyze-outreach`):** Extracts `suggested_status`, `suggested_action`, and `key_points` from recruiter responses.
- **Mock Fallback Mode:** Seamless fallback to regex mock algorithms when Groq API key is set to `mock-key` or omitted.

### 3.6 Company Resources & Placement Sheets
- **Placement Reference Sheets (`PublicUserController`):** Built-in database for 100+ top technology companies listing CTC packages, CGPA/12th eligibility criteria, and interview topics.
- **Private S3 Document Management (`company_documents`):** Upload company-specific offer PDFs, benefit guides, and process guidelines securely to AWS S3.

### 3.7 Notifications & Preferences
- **System Notifications (`notifications`):** In-app and Web Push notifications for upcoming OAs, interviews, and outreach follow-ups.
- **User Settings (`users`):** Modifiable parameters for display name, password, `ghost_threshold_days`, `auto_archive_enabled`, `browser_notifications_enabled`, and `email_notifications_enabled`.

---

## 4. Database Schema Specifications

The PostgreSQL database schema is versioned via Flyway:

### Core Tables Summary:
- **`users`:** `id (UUID)`, `email`, `password_hash`, `full_name`, `avatar_url`, `auth_provider`, `ghost_threshold_days`, `auto_archive_enabled`, `browser_notifications_enabled`, `email_notifications_enabled`, `ai_extractions_count`, `last_ai_extraction_date`.
- **`career_profiles`:** `id (UUID)`, `user_id`, `title`, `color_code`, `icon_identifier`, `is_default`.
- **`resumes`:** `id (UUID)`, `profile_id`, `version_number`, `s3_key`, `file_name`, `changelog`.
- **`applications`:** `id (UUID)`, `user_id`, `profile_id`, `resume_id`, `company_name`, `role_title`, `location`, `job_description_url`, `job_description_raw`, `status`, `source`, `salary_range`, `date_applied`, `follow_up_date`, `response_date`, `is_archived`, `oa_date_time`, `interview_date_time`, `meeting_link`, `last_activity_at`.
- **`application_status_history`:** `id (UUID)`, `application_id`, `status`, `notes`, `changed_at`.
- **`outreach`:** `id (UUID)`, `user_id`, `contact_name`, `company_name`, `position_discussed`, `email`, `linkedin_url`, `status`, `date_sent`, `follow_up_date`, `notes`.
- **`company_documents`:** `id (UUID)`, `user_id`, `company_name`, `document_name`, `s3_key`, `document_type`.
- **`notifications`:** `id (UUID)`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`.
- **`refresh_tokens`:** `id (UUID)`, `user_id`, `token`, `expiry_date`.

---

## 5. Non-Functional & Security Requirements

- **Concurrency:** Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`) ensuring non-blocking I/O execution.
- **Stateless Security:** JWT authentication with access token expiration (24h) and refresh token rotation.
- **CORS & Proxy Enforcements:** Cors origins restricted to production frontend (`https://trajectory-mu-six.vercel.app`); HTTPS scheme forwarded via Nginx (`server.forward-headers-strategy: framework`).
- **Data Isolation:** Enforced via `user_id` foreign key filters on all SQL repository queries.

---

## 6. Future Roadmap (Un-implemented Features)

The following features represent planned enhancements for future releases:

1. **Browser Extension:** One-click application scraping directly from LinkedIn and Indeed.
2. **Bi-Directional Calendar Sync:** Automatic Google Calendar / Microsoft Outlook event synchronization.
3. **AI Cover Letter Generator:** Automated generation of personalized cover letters from Resume + Job Description.
4. **JD vs. Resume Match Scoring:** Compatibility scoring comparing specific resume versions against job posting keywords.
5. **Skill Gap Analytics:** Automated identification of missing resume keywords based on job search history.
6. **Container Registry Integration:** Automating ECR/GHCR image compilation before deployment.

---

## Related Documentation

- [**Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**Application Flow (Docs/App Flow.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
- [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md)
- [**Production Deployment Guide (Docs/Deployment.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md)