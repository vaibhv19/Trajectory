# Feature List: Trajectory (v1.0.1)

This document provides a comprehensive inventory of all features in **Trajectory**. It serves as the single source of truth mapping product capabilities to their implementation files in the frontend and backend, associated database schemas, and current statuses (e.g., `IMPLEMENTED` vs. `PLANNED`).

---

## 1. Core Modules Matrix

### 1.1 Authentication & User Access Control

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Credentials Login / Signup** | `IMPLEMENTED` | [LoginPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/LoginPage.tsx) | [AuthController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AuthController.java) | `users` |
| **Google & GitHub OAuth2** | `IMPLEMENTED` | [LoginPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/LoginPage.tsx) | [AuthController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AuthController.java) | `users` |
| **JWT Token Management & Rotation** | `IMPLEMENTED` | Zustand Store (`useAuthStore`) | [AuthController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AuthController.java) | `refresh_tokens` |

### 1.2 Dashboard (The Command Center)

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Pipeline Metrics Counters** | `IMPLEMENTED` | [AnalyticsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/AnalyticsPage.tsx) | [DashboardController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/DashboardController.java) | `applications` |
| **Conversion Funnel Charts** | `IMPLEMENTED` | [AnalyticsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/AnalyticsPage.tsx) | [DashboardController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/DashboardController.java) | `applications` |
| **Today's Action Agenda** | `IMPLEMENTED` | [HomePage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/HomePage.tsx) | [DashboardController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/DashboardController.java) | `applications`, `outreach` |

### 1.3 Job Application Management

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **CRUD Lifecycle Actions** | `IMPLEMENTED` | [ApplicationsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationsPage.tsx) | [ApplicationController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ApplicationController.java) | `applications` |
| **Chronological Audit History** | `IMPLEMENTED` | [ApplicationDetailsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationDetailsPage.tsx) | [ApplicationController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ApplicationController.java) | `application_status_history` |
| **Soft Archiving Control** | `IMPLEMENTED` | [ApplicationsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationsPage.tsx) | [ApplicationController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ApplicationController.java) | `applications` |
| **Automated Ghost Detection Cron** | `IMPLEMENTED` | N/A (Spring Scheduler Daemon) | `GhostDetectionScheduler` Service | `applications`, `notifications` |

### 1.4 Career Profiles & Versioned Resumes

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Career Persona Profiles** | `IMPLEMENTED` | [ResumesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ResumesPage.tsx) | [CareerProfileController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/CareerProfileController.java) | `career_profiles` |
| **PDF Multipart S3 Upload** | `IMPLEMENTED` | [ResumesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ResumesPage.tsx) | [ResumeController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ResumeController.java) | `resumes` |
| **Auto-Increment Versioning** | `IMPLEMENTED` | [ResumesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ResumesPage.tsx) | [ResumeController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ResumeController.java) | `resumes` |
| **Keyword Changelog History** | `IMPLEMENTED` | [ResumesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ResumesPage.tsx) | [ResumeController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/ResumeController.java) | `resumes` |

### 1.5 Cold Outreach & Networking CRM

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Contact Funnel Management** | `IMPLEMENTED` | [OutreachPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/OutreachPage.tsx) | [OutreachController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/OutreachController.java) | `outreach` |
| **AI Reply Sentiment Analyzer** | `IMPLEMENTED` | [OutreachPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/OutreachPage.tsx) | [AIController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AIController.java) | N/A |
| **1-Click Application Conversion**| `IMPLEMENTED` | [OutreachPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/OutreachPage.tsx) | [OutreachController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/OutreachController.java) | `outreach`, `applications` |

### 1.6 AI-Powered Workflow Automation

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Job Description Parsing** | `IMPLEMENTED` | [ApplicationsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationsPage.tsx) | [AIController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AIController.java) | N/A |
| **Event Schedule Invite Parsing**| `IMPLEMENTED` | [ApplicationDetailsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationDetailsPage.tsx) | [AIController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/AIController.java) | N/A |
| **Groq / Llama 3 LLM Model** | `IMPLEMENTED` | N/A (Spring AI Starter integration) | `AIService` Layer | N/A |
| **Regex-Based Mock Fallback** | `IMPLEMENTED` | N/A (Failsafe local mode) | `AIService` Layer | N/A |

### 1.7 Placement Reference & Secure Storage

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Company Eligibility Reference** | `IMPLEMENTED` | [CompaniesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/CompaniesPage.tsx) | [PublicUserController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/PublicUserController.java) | `companies_data` (read-only) |
| **Company Benefit/Offer S3 Vault**| `IMPLEMENTED` | [CompaniesPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/CompaniesPage.tsx) | [CompanyDocumentController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/CompanyDocumentController.java) | `company_documents` |

### 1.8 Workspace Portability & User Preferences

| Feature Name | Status | Frontend Page / Component | Backend Controller | DB Table |
| :--- | :---: | :--- | :--- | :--- |
| **Workspace JSON Data Export** | `IMPLEMENTED` | [SettingsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/SettingsPage.tsx) | [UserController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/UserController.java) | Multi-table read |
| **Workspace JSON Data Import** | `IMPLEMENTED` | [SettingsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/SettingsPage.tsx) | [UserController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/UserController.java) | Multi-table write |
| **Notification Toggles** | `IMPLEMENTED` | [SettingsPage.tsx](file:///d:/Coding/Projects----For%20Resume/SettingsPage.tsx) | [UserController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/UserController.java) | `users` |
| **Ghost Threshold Adjustments** | `IMPLEMENTED` | [SettingsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/SettingsPage.tsx) | [UserController.java](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller/UserController.java) | `users` |

---

## 2. Planned-But-Not-Implemented Features (Future Roadmap)

> [!WARNING]
> The following list details planned features for future version iterations. These are **not** present in the v1.0.1 codebase.

### 1. Browser extension scraper
*   **Description:** A Chrome/Firefox extension that reads details from active LinkedIn or Indeed postings and uploads them directly into the Trajectory REST API gateway.
*   **Status:** `PLANNED` (No active codebase file)

### 2. Bi-directional calendar sync
*   **Description:** Syncs `oa_date_time` and `interview_date_time` events with Google Calendar or Microsoft Outlook calendars via standard OAuth2 consent.
*   **Status:** `PLANNED` (No active codebase file)

### 3. AI Cover Letter Generator
*   **Description:** Integrates resume context and job posting text through Spring AI prompts to automatically draft personalized cover letters.
*   **Status:** `PLANNED` (No active codebase file)

### 4. JD vs. Resume Keyword Match Scoring
*   **Description:** AI service matching the job description against a chosen resume version to output a semantic relevance rating (0-100%).
*   **Status:** `PLANNED` (No active codebase file)

### 5. Career Skill Gap Analytics
*   **Description:** Identifies missing keywords from resumes based on job postings rejected or marked as ghosted in the dashboard history.
*   **Status:** `PLANNED` (No active codebase file)

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Product Requirements Document (Docs/PRD.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
*   [**Application Flow (Docs/App Flow.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
*   [**Tech Stack Specification (Docs/Tech Stack.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Tech%20Stack.md)
*   [**Visual Design System (Docs/DESIGN.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md)
