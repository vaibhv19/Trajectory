# Product Requirements Document (PRD): Trajectory

**Project Name:** Trajectory – Your Career Operating System[cite: 1]  
**Status:** Finalized / Ready for Core Implementation  
**Document Version:** 1.0  

---

## 1. Executive Summary
**Trajectory** is a comprehensive, full-stack career management platform designed to centralize the fragmented job search process[cite: 1]. It moves beyond simple spreadsheets by integrating resume versioning, AI-powered data extraction, cold outreach tracking, and deep analytics[cite: 1]. The goal is to provide job seekers with a "Command Center" that automates administrative tasks and provides actionable insights into their application performance[cite: 1].

---

## 2. Target Audience
*   **Active Job Seekers:** New graduates and experienced professionals managing high volumes of applications[cite: 1].
*   **Career Switchers:** Users managing multiple personas/profiles (e.g., applying for both Data Science and Software Engineering roles)[cite: 1].
*   **Power Users:** Job seekers who utilize cold outreach, track networking, and maintain multiple resume iterations[cite: 1].

---

## 3. Product Features & Functional Requirements

### 3.1 Dashboard (The Command Center)
The dashboard provides a high-level bird's-eye view of the user’s pipeline[cite: 1].
*   **Core Metrics:** Total, Active, Rejected, and Ghosted counts[cite: 1].
*   **Funnel Analytics:** OA (Online Assessment) count, Interview count, Offer count[cite: 1].
*   **Performance Tracking:** Response Rate, Interview Conversion, and Offer Conversion rates[cite: 1].
*   **Temporal Tracking:** 
    *   **Applications This Week:** Rolling count of applications submitted in the last 7 days[cite: 3].
    *   **Applications This Month:** Count of applications submitted in the current calendar month[cite: 3].
*   **Visualizations:** 
    *   Resume performance (comparing different resume versions against their "Response Rate" to identify which version gets more hits)[cite: 1, 3].
    *   Applications by source (LinkedIn, Indeed, etc.) and career profile distribution[cite: 1].
*   **Daily Action:** A "Today’s Agenda" widget showing upcoming interviews, OAs, and follow-ups[cite: 1].

### 3.2 Application Management
A robust CRUD system for tracking the lifecycle of a job application[cite: 1].
*   **Core Fields:** Company Name, Role, Career Profile, Resume Version, Location, Date Applied, Status, Source, Application Link, and Notes[cite: 1].
*   **Critical Dates:** 
    *   **Follow-up Date:** A user-defined date to trigger a "Check-in" reminder[cite: 3].
    *   **Response Date:** The date the company first contacted the user after application[cite: 3].
*   **Smart Status Updates:** 
    *   If status changes to "OA" or "Interview," automatically prompt for Date/Time and Meeting Links[cite: 1].
    *   Automatic creation of calendar reminders based on these dates[cite: 1].
*   **Status Timeline:** Each application detail page must feature a chronological history where every status change (e.g., Applied $\rightarrow$ OA $\rightarrow$ Interview $\rightarrow$ Offer) is timestamped and logged, allowing users to see the duration spent in each stage[cite: 3].
*   **Automation:** 
    *   **Ghost Detection:** If no update occurs within a user-defined threshold (e.g., 30 days), the status automatically flips to "Ghosted"[cite: 1].
    *   **Archive:** One-click archiving for rejected applications[cite: 1].

### 3.3 Resume & Career Profile Manager
Solves the "Which resume did I use for this job?" problem[cite: 1].
*   **Career Profiles:** Users define profiles (e.g., "Full Stack Dev," "Product Manager") with specific icons and color themes[cite: 1].
*   **Versioning Logic:** Upload and store multiple versions of a resume[cite: 1].
    *   **Auto-Increment:** When a user uploads a new version for a specific profile, the system suggests an incremented version number (e.g., v1 $\rightarrow$ v2)[cite: 3].
    *   **Inline Creation:** Within the "Add Application" modal, users must have a "Quick Upload" button to add a new resume version without leaving the current workflow[cite: 3].
*   **Auto-Link:** System automatically suggests the "Latest Resume" for a specific Career Profile during new application creation[cite: 1].
*   **Changelog:** Notes for each resume version to track specific keywords added or sections changed[cite: 1].

### 3.4 Cold Outreach & Networking (CRM Module)
A dedicated CRM for non-portal applications and direct networking[cite: 1, 4].
*   **Fields:** Recruiter/Contact name, Company, Email, LinkedIn, and Outreach Status[cite: 1].
*   **Position:** A mandatory text field to specify the exact role being discussed (e.g., "Senior Backend Engineer")[cite: 4].
*   **Date Sent:** A date-picker field to log exactly when the initial contact was made[cite: 4]. This date serves as the baseline for calculating the follow-up reminder[cite: 4].
*   **Follow-ups:** Set reminders for follow-up emails[cite: 1].
*   **Conversion:** One-click button to convert a successful outreach thread into a formal "Application" entry, transferring recruiter notes, contact history, and company details.

### 3.5 AI Features (Workflow Automation)
Leveraging LLMs to reduce manual data entry and expedite form completion[cite: 1, 3].
*   **Parsing:** Import and extract data from Job Descriptions, Recruiter Emails, OA Invitations, Offer Letters, Google Form Confirmations, and Interview Invites[cite: 1, 3].
*   **Auto-Populate Logic:** Beyond extraction, the AI module will auto-populate the application form[cite: 3]. The user reviews the pre-filled fields generated from the pasted text/email and clicks "Save"[cite: 3].
*   **Field Extraction & Suggestions:** AI identifies Company, Role, Location, Skills, and Experience requirements, and suggests the most relevant "Career Profile" based on the job description[cite: 1].
*   **Preservation:** Automatically saves the original Job Description, protecting against deleted job postings[cite: 1].

### 3.6 Company Resources & Documents (Private Storage)
*   **Local-to-Cloud Storage:** Centralized repository for Career Page links, Placement PPTs, Hiring Process PDFs, and Eligibility documents[cite: 1, 3]. These are uploaded by the user and stored privately in their cloud storage account, ensuring access even if original external links expire[cite: 3].
*   **Context:** Attach specific documents to specific companies for easy retrieval during interview prep[cite: 1].

---

## 4. Engineering & Technical Requirements

### 4.1 Security & Authentication
*   **Methods:** Email/Password (hashed via bcrypt/argon2), Google OAuth, and GitHub OAuth[cite: 1].
*   **Session Management:** JWT with Refresh Token rotation[cite: 1].
*   **Authorization:** Future-proofing for Role-Based Access Control (RBAC)[cite: 1].

### 4.2 System Architecture & Infrastructure
*   **API:** RESTful API with structured logging and global exception handling[cite: 1].
*   **Performance:** Implement Pagination for application lists and Optimistic UI updates for a snappy feel[cite: 1].
*   **Integrity:** Input validation on all endpoints and duplicate application detection (based on Company + Role)[cite: 1].
*   **Storage:** Secure file upload for resumes and PDFs (S3 or similar)[cite: 1].
*   **Rate Limiting:** Implement API rate limiting (e.g., using Redis) to prevent brute-force attacks and control AI API expenses (e.g., max 50 AI extractions per user per day)[cite: 3, 4].
*   **Input Validation Logic:** Strict validation for "Date Sent" and "Follow-up Date" to ensure no historical conflicts (e.g., Follow-up Date cannot be before Date Sent)[cite: 4].
*   **State Persistence:** Ensure that "Auto-Archive" and "Notification" preferences are persisted in the database, not just local storage, to maintain cross-device consistency[cite: 4].

### 4.3 UI/UX & Navigation
*   **Data Management:** Every list view (Applications, Outreach, Resources) must support real-time keyword search (across Company, Role, and Notes), sorting (by Date Applied, Status, or Company Name), and multi-select filtering (by Career Profile, Status, or Source)[cite: 3].
*   **Themes:** Light, Dark, and System-matching modes[cite: 1].
*   **Accessibility:** Font size adjustments and "Compact Mode" for power users with 100+ applications[cite: 1].

---

## 5. Notification System
A centralized notification engine will handle:
*   **Agenda Alerts:** Daily morning digest of "Today's Agenda" via the dashboard widget[cite: 3, 4].
*   **Event Reminders:** High-priority alerts for OA and Interview start times[cite: 3].
*   **Nudge Notifications:** Reminders for "Follow-up Dates" that have been reached[cite: 3].
*   **System Alerts:** Browser-based push notifications (Web Push API) for real-time updates[cite: 1, 4].

---

## 6. Settings & Data Portability

### 6.1 Automation Toggles & Configurations
*   **Auto-Archive Toggle:** When enabled, any application whose status is updated to "Rejected" or "Ghosted" will automatically be moved to the Archive view[cite: 4]. (Default: Disabled)[cite: 4].
*   **Browser Notification Toggle:** A master ON/OFF switch for the Web Push API[cite: 4]. If disabled, reminders only appear within the internal dashboard widget[cite: 4].
*   **Ghosting Threshold:** A numerical input (days) that determines when an application is flagged as "Ghosted" based on the last recorded activity[cite: 4] or the "Date Applied".
*   **Notification Prefixes:** Customize how long before an event a reminder is triggered.

### 6.2 Account Management
The account section handles the full identity lifecycle of the user:
*   **Update Profile:** Ability to modify display name and profile picture/avatar[cite: 3, 4].
*   **Change Email:** Users must provide their current password and verify the new email address via a verification link before the primary account email updates[cite: 4].
*   **Change Password:** Standard security workflow (Current Password + New Password + Confirm New Password)[cite: 4].
*   **OAuth Management:** Display linked Google or GitHub accounts and provide options to unlink/re-link[cite: 4].

### 6.3 Data Control
*   **Export:** Download full application and history data in JSON/CSV format for local backup[cite: 3].
*   **Import Backup:** Ability to upload a previously exported Trajectory JSON file to completely restore account state[cite: 3].
*   **Deletion:** Permanent deletion of the account and all associated data.

---

## 7. Future Roadmap
1.  **Browser Extension:** One-click application "scraping" directly from LinkedIn/Indeed[cite: 1].
2.  **Calendar Sync:** Bi-directional sync with Google/Outlook Calendars[cite: 1].
3.  **AI Cover Letter Generator:** Using the Resume + Job Description to draft personalized letters[cite: 1].
4.  **JD vs. Resume Matching:** A scoring system that compares a specific Resume Version against a Job Description to provide a "Compatibility Score"[cite: 3].
5.  **Skill Gap Analysis:** Analyzing multiple JDs in a Career Profile to identify recurring keywords missing from the user’s current resume[cite: 1, 3].
6.  **Job Portal Integration:** API-level integration with major boards (where available)[cite: 1].
7.  **Resume Builder:** An integrated tool to create resumes using the platform’s native Career Profile data[cite: 3].
8.  **Interview Tracker:** A dedicated module for post-interview debriefs (questions asked, interviewer names, self-evaluation)[cite: 3].

---

## 8. Success Metrics
*   **Reduction in Data Entry Time:** Measured by the usage of AI Import vs. Manual Entry workflows[cite: 1].
*   **User Retention:** Active tracking of applications over a 3-month job search cycle[cite: 1].
*   **Conversion Accuracy:** Correctness of AI-extracted fields from emails and JDs[cite: 1].