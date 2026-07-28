# REST API Specification: Trajectory (v1.0.1)

This document provides the canonical, production-grade specification for all REST API endpoints implemented in the **Trajectory Backend** (`com.trajectory.backend.controller`).

---

## 1. Global API Architecture & Configurations

### 1.1 Server Gateways
*   **Local Development Base URL:** `http://localhost:8080/api`
*   **Production Gateway URL:** `https://trajectory-api.duckdns.org/api`
*   **Interactive Swagger UI:** `https://trajectory-api.duckdns.org/swagger-ui/index.html` (Local: `http://localhost:8080/swagger-ui.html`)
*   **JSON OpenAPI 3.0 Specs:** `/v3/api-docs`

### 1.2 Access Headers
Unless explicitly labeled as `Public`, all endpoints require the `Authorization` header populated with a valid JWT access token:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.3 Standard Response & Error Envelope
Error responses return standard HTTP status codes wrapped in a structured JSON payload handled by `GlobalExceptionHandler.java`:

```json
{
  "timestamp": "2026-07-28T20:25:00.123+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email': Must be a well-formed email address",
  "path": "/api/auth/register"
}
```

---

## 2. API Endpoint Dictionary

### 2.1 Authentication Subsystem (`AuthController`)
Base API Path: `/api/auth`

#### 2.1.1 Local Account Login
*   **Method / Path:** `POST /api/auth/login`
*   **Authentication:** `Public`
*   **Request Body (JSON):**
    ```json
    {
      "email": "candidate@domain.com",
      "password": "SecurePassword123"
    }
    ```
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ZGVj...",
      "refreshToken": "7c82a201-92ab-4eb2-a1f9-90bc1f3a210d",
      "userId": "5dec9b01-a1b2-4c3d-8e5f-1a2b3c4d5e6f",
      "email": "candidate@domain.com",
      "fullName": "Jane Doe"
    }
    ```

#### 2.1.2 Register Local Account
*   **Method / Path:** `POST /api/auth/register`
*   **Authentication:** `Public`
*   **Request Body (JSON):**
    ```json
    {
      "email": "candidate@domain.com",
      "password": "SecurePassword123",
      "fullName": "Jane Doe"
    }
    ```
*   **Response Body (JSON - 201 Created):** Same schema as `/login` response DTO.

#### 2.1.3 Token Refresh Execution
*   **Method / Path:** `POST /api/auth/refresh`
*   **Authentication:** `Public`
*   **Request Body (JSON):**
    ```json
    {
      "refreshToken": "7c82a201-92ab-4eb2-a1f9-90bc1f3a210d"
    }
    ```
*   **Response Body (JSON - 200 OK):** Same schema as `/login` response DTO.

#### 2.1.4 Revoke/Logout Session
*   **Method / Path:** `POST /api/auth/logout`
*   **Authentication:** `Bearer Token`
*   **Response (200 OK):** Empty body.

---

### 2.2 AI Extraction & Sentiment Services (`AIController`)
Base API Path: `/api/ai`

#### 2.2.1 Job Description Extraction
*   **Method / Path:** `POST /api/ai/extract-jd`
*   **Authentication:** `Bearer Token`
*   **Request Body (JSON):**
    ```json
    {
      "text": "Google is looking for a Systems Engineer in Sunnyvale, CA. Core skills: Java, Kubernetes. Salary: $150,000 - $180,000."
    }
    ```
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "company_name": "Google",
      "role_title": "Systems Engineer",
      "location": "Sunnyvale, CA",
      "skills": ["Java", "Kubernetes"],
      "salary_range": "$150,000 - $180,000",
      "suggested_profile_title": "Systems Engineer"
    }
    ```

#### 2.2.2 Recruiter Reply Sentiment Analysis
*   **Method / Path:** `POST /api/ai/analyze-outreach`
*   **Authentication:** `Bearer Token`
*   **Request Body (JSON):**
    ```json
    {
      "text": "Hi Jane, thanks for reaching out. We would love to hop on a quick intro call tomorrow at 10 AM. Let me know if that works."
    }
    ```
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "suggested_status": "REPLIED",
      "suggested_action": "Schedule intro call",
      "key_points": [
        "Recruiter responded within 24 hours",
        "Wants to schedule an intro call"
      ]
    }
    ```

#### 2.2.3 Event Invitation Parsing
*   **Method / Path:** `POST /api/ai/extract-event`
*   **Authentication:** `Bearer Token`
*   **Request Body (JSON):**
    ```json
    {
      "text": "Your Online Assessment is scheduled for July 30, 2026 at 2:00 PM. Here is the link: https://zoom.us/j/123456"
    }
    ```
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "event_type": "OA",
      "event_date": "2026-07-30",
      "event_time": "14:00:00",
      "meeting_link": "https://zoom.us/j/123456",
      "interviewer_names": [],
      "duration_minutes": 60
    }
    ```

---

### 2.3 Job Applications (`ApplicationController`)
Base API Path: `/api/applications`

#### 2.3.1 Query Applications List
*   **Method / Path:** `GET /api/applications`
*   **Authentication:** `Bearer Token`
*   **Query Parameters:**
    *   `profileId` (UUID, Optional) — Filter by career profile
    *   `status` (String, Optional) — Filter by lifecycle status
    *   `search` (String, Optional) — Text search across company name or role title
*   **Response Body (JSON - 200 OK):**
    ```json
    [
      {
        "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "companyName": "Google",
        "roleTitle": "Software Engineer",
        "location": "Remote",
        "status": "APPLIED",
        "source": "LinkedIn",
        "salaryRange": "$140k - $160k",
        "dateApplied": "2026-07-28",
        "isArchived": false,
        "lastActivityAt": "2026-07-28T20:25:00Z"
      }
    ]
    ```

#### 2.3.2 Get Application Details
*   **Method / Path:** `GET /api/applications/{id}`
*   **Authentication:** `Bearer Token`
*   **Response Body (JSON - 200 OK):** Detailed application payload including associated resume metadata and timeline history records.

#### 2.3.3 Create Job Application
*   **Method / Path:** `POST /api/applications`
*   **Authentication:** `Bearer Token`
*   **Request Body (JSON):**
    ```json
    {
      "profileId": "8f8b8a8c-8d8e-8f8f-9a9b-9c9d9e9f9a9b",
      "resumeId": "5c5d5e5f-6a6b-6c6d-6e6f-7a7b7c7d7e7f",
      "companyName": "Google",
      "roleTitle": "Software Engineer",
      "location": "Remote",
      "jobDescriptionUrl": "https://careers.google.com/jobs/123",
      "jobDescriptionRaw": "Google is looking for...",
      "status": "APPLIED",
      "source": "LinkedIn",
      "salaryRange": "$140k - $160k",
      "dateApplied": "2026-07-28"
    }
    ```
*   **Response Body (JSON - 201 Created):** Same schema as Application Response DTO.

#### 2.3.4 Patch Transition Status
*   **Method / Path:** `PATCH /api/applications/{id}/status`
*   **Authentication:** `Bearer Token`
*   **Request Body (JSON):**
    ```json
    {
      "status": "OA",
      "notes": "Received HackerRank test link.",
      "oaDateTime": "2026-07-30T14:00:00Z",
      "meetingLink": "https://hackerrank.com/test/123"
    }
    ```
*   **Response Body (JSON - 200 OK):** Updated application payload with new status history entry added.

#### 2.3.5 Toggle Archival Status
*   **Method / Path:** `PATCH /api/applications/{id}/archive`
*   **Authentication:** `Bearer Token`
*   **Response Body (JSON - 200 OK):** Updated Application Response showing modified `isArchived` flag.

#### 2.3.6 Delete Application
*   **Method / Path:** `DELETE /api/applications/{id}`
*   **Authentication:** `Bearer Token`
*   **Response (204 No Content):** Empty body.

---

### 2.4 Cold Outreach CRM (`OutreachController`)
Base API Path: `/api/outreach`

#### 2.4.1 Get CRM Outreach List
*   **Method / Path:** `GET /api/outreach`
*   **Query Parameters:** `search`, `status`
*   **Response Body (JSON - 200 OK):** List of outreach contact records.

#### 2.4.2 Log New Outreach Contact
*   **Method / Path:** `POST /api/outreach`
*   **Request Body (JSON):**
    ```json
    {
      "contactName": "John Recruiter",
      "companyName": "Netflix",
      "positionDiscussed": "Senior Java Developer",
      "email": "john@netflix.com",
      "linkedinUrl": "https://linkedin.com/in/johnrecruiter",
      "status": "PENDING",
      "dateSent": "2026-07-28",
      "followUpDate": "2026-08-04",
      "notes": "Sent cold message on LinkedIn."
    }
    ```
*   **Response Body (JSON - 201 Created):** Created outreach DTO record.

#### 2.4.3 Convert Outreach to Application
*   **Method / Path:** `POST /api/outreach/{id}/convert`
*   **Request Body (JSON):**
    ```json
    {
      "profileId": "8f8b8a8c-8d8e-8f8f-9a9b-9c9d9e9f9a9b",
      "resumeId": "5c5d5e5f-6a6b-6c6d-6e6f-7a7b7c7d7e7f",
      "roleTitle": "Senior Java Developer",
      "source": "Outreach",
      "salaryRange": ""
    }
    ```
*   **Response Body (JSON - 200 OK):** Created Job Application DTO record.

---

### 2.5 Career Profiles (`CareerProfileController`)
Base API Path: `/api/profiles`

#### 2.5.1 Fetch Career Profiles
*   **Method / Path:** `GET /api/profiles`
*   **Response Body (JSON - 200 OK):** Array of user career profiles (e.g. Frontend Engineer, DevOps).

#### 2.5.2 Create Profile Persona
*   **Method / Path:** `POST /api/profiles`
*   **Request Body (JSON):**
    ```json
    {
      "title": "DevOps Engineer",
      "colorCode": "#10b981",
      "iconIdentifier": "Terminal",
      "isDefault": false
    }
    ```
*   **Response Body (JSON - 201 Created):** Created Profile DTO.

---

### 2.6 Versioned Resumes (`ResumeController`)
Base API Path: `/api/resumes`

#### 2.6.1 Fetch Resumes for Profile
*   **Method / Path:** `GET /api/resumes/profile/{profileId}`
*   **Response Body (JSON - 200 OK):** Array of versioned resume records associated with the profile.

#### 2.6.2 Multipart PDF Upload
*   **Method / Path:** `POST /api/resumes/upload`
*   **Request Content-Type:** `multipart/form-data`
*   **Request Parameters:**
    *   `file` (Binary PDF File)
    *   `profileId` (UUID)
    *   `changelog` (String)
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "id": "5c5d5e5f-6a6b-6c6d-6e6f-7a7b7c7d7e7f",
      "profileId": "8f8b8a8c-8d8e-8f8f-9a9b-9c9d9e9f9a9b",
      "versionNumber": 2,
      "s3Key": "resumes/8f8b8a8c-8d8e-8f8f-9a9b-9c9d9e9f9a9b/v2_Resume.pdf",
      "fileName": "Resume.pdf",
      "changelog": "Added Virtual Thread keywords",
      "createdAt": "2026-07-28T20:25:00Z"
    }
    ```

#### 2.6.3 Download Resume PDF
*   **Method / Path:** `GET /api/resumes/{id}/download`
*   **Response (200 OK):** Returns binary PDF data stream (`application/pdf`).

---

### 2.7 Placement Sheets & Company Documents (`CompanyDocumentController`)
Base API Path: `/api/documents`

#### 2.7.1 Fetch Private Documents
*   **Method / Path:** `GET /api/documents`
*   **Response (200 OK):** Array of private company documents (e.g. offers, benefits PDFs).

#### 2.7.2 Upload Company Attachment
*   **Method / Path:** `POST /api/documents/upload`
*   **Request Content-Type:** `multipart/form-data`
*   **Parameters:** `file` (Binary), `companyName` (String), `documentType` (String)
*   **Response Body (JSON - 200 OK):** Created Company Document metadata record.

---

### 2.8 Dashboard Analytics (`DashboardController`)
Base API Path: `/api/dashboard`

#### 2.8.1 Get Metrics & Today's Agenda
*   **Method / Path:** `GET /api/dashboard/metrics`
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "totalApplications": 42,
      "activeApplications": 12,
      "rejectedApplications": 25,
      "ghostedApplications": 5,
      "oaApplications": 3,
      "interviewApplications": 4,
      "offerApplications": 1,
      "applicationsThisWeek": 2,
      "applicationsThisMonth": 8,
      "responseRate": 19.05,
      "interviewConversionRate": 33.33,
      "offerConversionRate": 25.0,
      "todayAgenda": [
        {
          "type": "OA",
          "time": "2026-07-28T22:00:00Z",
          "title": "Online Assessment with Google",
          "details": "HackerRank test link: https://hackerrank.com/test/123"
        }
      ]
    }
    ```

---

### 2.9 Notifications Subsystem (`NotificationController`)
Base API Path: `/api/notifications`

#### 2.9.1 Fetch Notifications
*   **Method / Path:** `GET /api/notifications`
*   **Query Parameters:** `unreadOnly` (boolean, Optional)
*   **Response Body (JSON - 200 OK):** List of notification records.

#### 2.9.2 Save Push Subscription
*   **Method / Path:** `POST /api/notifications/push-subscription`
*   **Request Body (JSON):**
    ```json
    {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "BIP...",
        "auth": "12A..."
      }
    }
    ```
*   **Response (200 OK):** Empty body.

---

### 2.10 User Profile Preferences (`UserController`)
Base API Path: `/api/users`

#### 2.10.1 Fetch Profile & Preferences
*   **Method / Path:** `GET /api/users/me`
*   **Response Body (JSON - 200 OK):**
    ```json
    {
      "id": "5dec9b01-a1b2-4c3d-8e5f-1a2b3c4d5e6f",
      "email": "candidate@domain.com",
      "fullName": "Jane Doe",
      "avatarUrl": "https://avatar.com/jane",
      "authProvider": "LOCAL",
      "ghostThresholdDays": 30,
      "autoArchiveEnabled": false,
      "browserNotificationsEnabled": true,
      "emailNotificationsEnabled": true,
      "aiExtractionsCount": 5
    }
    ```

#### 2.10.2 Update Preferences
*   **Method / Path:** `PUT /api/users/me`
*   **Request Body (JSON):**
    ```json
    {
      "fullName": "Jane Smith",
      "ghostThresholdDays": 45,
      "autoArchiveEnabled": true,
      "browserNotificationsEnabled": false,
      "emailNotificationsEnabled": true
    }
    ```
*   **Response Body (JSON - 200 OK):** Updated profile configuration.

#### 2.10.3 Export Workspace Data
*   **Method / Path:** `GET /api/users/me/data/export`
*   **Response (200 OK):** Binary stream of workspace JSON backup configuration (`application/json`).

#### 2.10.4 Import Workspace Data
*   **Method / Path:** `POST /api/users/me/data/import`
*   **Request Content-Type:** `multipart/form-data`
*   **Parameters:** `file` (Binary workspace JSON file)
*   **Response (200 OK):** Empty body.

---

### 2.11 Public Resources (`PublicUserController`)
Base API Path: `/api/public`

#### 2.11.1 Fetch Placement Sheets
*   **Method / Path:** `GET /api/public/placement-sheets`
*   **Query Parameters:** `company` (String, Optional)
*   **Response Body (JSON - 200 OK):** Array of major tech company placement profiles.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Database Schema (Docs/DATABASE_SCHEMA.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATABASE_SCHEMA.md)
*   [**Error Handling Strategy (Docs/ERROR_HANDLING_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ERROR_HANDLING_STRATEGY.md)
