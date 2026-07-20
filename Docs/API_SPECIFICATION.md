# Trajectory REST API Specification

This document provides the complete, authoritative specification for all REST API endpoints implemented in the **Trajectory Backend** (`com.trajectory.backend.controller`). 

---

## 1. Global API Architecture & Conventions

### 1.1 Base URL & Path Structure
- **Local Development Base URL:** `http://localhost:8080/api`
- **Production Base URL:** `https://trajectory-api.duckdns.org/api`
- **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema JSON:** `http://localhost:8080/v3/api-docs`

### 1.2 Authentication Scheme
All endpoints (except those marked as `Public`) require HTTP Bearer Token authentication in the `Authorization` header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.3 Standard Response & Error Format
All validation failures, entity missing errors, and internal exceptions return standard HTTP status codes accompanied by structured JSON error bodies handled by `GlobalExceptionHandler.java`:

```json
{
  "timestamp": "2026-07-20T14:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email': Must be a well-formed email address",
  "path": "/api/auth/register"
}
```

---

## 2. Endpoints by Domain Controller

### 2.1 Authentication (`AuthController`) — Base Path: `/api/auth`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Body DTO | Response Body DTO / Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | `POST` | Public | Authenticates user with email & password | `LoginRequest` | `AuthResponse` |
| `/register` | `POST` | Public | Registers a new user account | `RegisterRequest` | `AuthResponse` |
| `/refresh` | `POST` | Public | Rotates JWT access token using a valid refresh token | `Map<String, String>` (`refreshToken`) | `AuthResponse` |
| `/logout` | `POST` | Bearer Token | Revokes active refresh token and invalidates session | None | `ResponseEntity<Void>` (200 OK) |

#### DTO Definitions:
- **`LoginRequest`:** `String email`, `String password`
- **`RegisterRequest`:** `String email`, `String password`, `String fullName`
- **`AuthResponse`:** `String token`, `String refreshToken`, `UUID userId`, `String email`, `String name`

---

### 2.2 AI Automation (`AIController`) — Base Path: `/api/ai`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Payload | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/extract-jd` | `POST` | Bearer Token | Parses raw job description text via Spring AI / Groq | `Map<String, String>` (`text`) | `JobExtraction` |
| `/analyze-outreach` | `POST` | Bearer Token | Analyzes recruiter reply sentiment and suggests status update | `Map<String, String>` (`text`) | `OutreachAnalysis` |
| `/extract-event` | `POST` | Bearer Token | Parses interview/OA invite body to extract date, time, and meeting link | `Map<String, String>` (`text`) | `EventExtraction` |

#### DTO Definitions:
- **`JobExtraction`:** `String company_name`, `String role_title`, `String location`, `List<String> skills`, `String salary_range`, `String suggested_profile_title`
- **`OutreachAnalysis`:** `String suggested_status`, `String suggested_action`, `List<String> key_points`
- **`EventExtraction`:** `String event_type`, `String event_date`, `String event_time`, `String meeting_link`, `List<String> interviewer_names`, `Integer duration_minutes`

---

### 2.3 Job Application Management (`ApplicationController`) — Base Path: `/api/applications`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Bearer Token | Fetches all job applications for authenticated user | Query params: `profileId`, `status`, `search` | `List<ApplicationResponse>` |
| `/{id}` | `GET` | Bearer Token | Fetches single application details by ID | Path variable `id` | `ApplicationResponse` |
| `/` | `POST` | Bearer Token | Creates a new job application | `CreateApplicationRequest` | `ApplicationResponse` |
| `/{id}` | `PUT` | Bearer Token | Updates existing application details | `UpdateApplicationRequest` | `ApplicationResponse` |
| `/{id}/status` | `PATCH` | Bearer Token | Updates application status & logs history timeline | `StatusUpdateRequest` | `ApplicationResponse` |
| `/{id}/archive` | `PATCH` | Bearer Token | Toggles application archival status (`is_archived`) | None | `ApplicationResponse` |
| `/{id}` | `DELETE` | Bearer Token | Deletes an application and associated history | None | `ResponseEntity<Void>` (204 No Content) |

#### DTO Definitions:
- **`CreateApplicationRequest`:** `UUID profileId`, `UUID resumeId`, `String companyName`, `String roleTitle`, `String location`, `String jobDescriptionUrl`, `String jobDescriptionRaw`, `ApplicationStatus status`, `String source`, `String salaryRange`, `LocalDate dateApplied`, `LocalDate followUpDate`
- **`UpdateApplicationRequest`:** `String companyName`, `String roleTitle`, `String location`, `String jobDescriptionUrl`, `String jobDescriptionRaw`, `String source`, `String salaryRange`, `LocalDate followUpDate`, `LocalDate responseDate`
- **`StatusUpdateRequest`:** `ApplicationStatus status`, `String notes`, `LocalDateTime oaDateTime`, `LocalDateTime interviewDateTime`, `String meetingLink`

---

### 2.4 Cold Outreach & Networking CRM (`OutreachController`) — Base Path: `/api/outreach`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Bearer Token | Fetches all CRM outreach entries for user | Query params: `search`, `status` | `List<OutreachResponse>` |
| `/{id}` | `GET` | Bearer Token | Fetches single outreach entry by ID | Path variable `id` | `OutreachResponse` |
| `/` | `POST` | Bearer Token | Creates a new cold outreach entry | `CreateOutreachRequest` | `OutreachResponse` |
| `/{id}` | `PUT` | Bearer Token | Updates outreach details & follow-up dates | `UpdateOutreachRequest` | `OutreachResponse` |
| `/{id}/convert` | `POST` | Bearer Token | Converts outreach contact into formal Application | `ConvertOutreachRequest` | `ApplicationResponse` |
| `/{id}` | `DELETE` | Bearer Token | Deletes an outreach record | None | `ResponseEntity<Void>` (204 No Content) |

---

### 2.5 Career Personas & Profiles (`CareerProfileController`) — Base Path: `/api/profiles`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Bearer Token | Fetches all career profiles for user | None | `List<CareerProfileResponse>` |
| `/` | `POST` | Bearer Token | Creates a new career profile persona | `CreateProfileRequest` | `CareerProfileResponse` |
| `/{id}` | `PUT` | Bearer Token | Updates profile title, hex color, or icon | `UpdateProfileRequest` | `CareerProfileResponse` |
| `/{id}` | `DELETE` | Bearer Token | Deletes career profile and associated records | None | `ResponseEntity<Void>` (204 No Content) |

---

### 2.6 Versioned Resumes (`ResumeController`) — Base Path: `/api/resumes`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Payload | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/profile/{profileId}` | `GET` | Bearer Token | Fetches versioned resumes for a profile | Path variable `profileId` | `List<ResumeResponse>` |
| `/upload` | `POST` | Bearer Token | Uploads new PDF resume version to AWS S3 | Multipart `file`, `profileId`, `changelog` | `ResumeResponse` |
| `/{id}/download` | `GET` | Bearer Token | Generates pre-signed URL or streams PDF binary | Path variable `id` | Binary PDF / `byte[]` |
| `/{id}` | `DELETE` | Bearer Token | Deletes resume metadata and S3 binary object | None | `ResponseEntity<Void>` (204 No Content) |

---

### 2.7 Placement Sheets & Documents (`CompanyDocumentController`) — Base Path: `/api/documents`

| Endpoint Path | HTTP Method | Auth Required | Description | Request Payload | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Bearer Token | Fetches all private company documents for user | Query param: `companyName` | `List<CompanyDocumentResponse>` |
| `/upload` | `POST` | Bearer Token | Uploads company PDF attachment to S3 bucket | Multipart `file`, `companyName`, `documentType` | `CompanyDocumentResponse` |
| `/{id}/download` | `GET` | Bearer Token | Streams document file from AWS S3 | Path variable `id` | `ResponseEntity<byte[]>` |
| `/{id}` | `DELETE` | Bearer Token | Deletes document record and S3 object | Path variable `id` | `ResponseEntity<Void>` |

---

### 2.8 Dashboard Analytics (`DashboardController`) — Base Path: `/api/dashboard`

| Endpoint Path | HTTP Method | Auth Required | Description | Request | Response Body DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/metrics` | `GET` | Bearer Token | Fetches aggregated funnel metrics & agenda | None | `DashboardMetricsResponse` |

#### DTO Definition:
- **`DashboardMetricsResponse`:** `long totalApplications`, `long activeApplications`, `long rejectedApplications`, `long ghostedApplications`, `long oaApplications`, `long interviewApplications`, `long offerApplications`, `long applicationsThisWeek`, `long applicationsThisMonth`, `double responseRate`, `double interviewConversionRate`, `double offerConversionRate`, `List<AgendaItemResponse> todayAgenda`

---

### 2.9 Notifications & Agenda (`NotificationController`) — Base Path: `/api/notifications`

| Endpoint Path | HTTP Method | Auth Required | Description | Request | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Bearer Token | Fetches active notifications for user | Query param: `unreadOnly` | `List<NotificationResponse>` |
| `/{id}/read` | `PATCH` | Bearer Token | Marks notification as read | Path variable `id` | `NotificationResponse` |
| `/read-all` | `PATCH` | Bearer Token | Marks all user notifications as read | None | `ResponseEntity<Void>` |
| `/push-subscription` | `POST` | Bearer Token | Saves Web Push API VAPID subscription | `PushSubscriptionRequest` | `ResponseEntity<Void>` |

---

### 2.10 User Profile & Preferences (`UserController`) — Base Path: `/api/users`

| Endpoint Path | HTTP Method | Auth Required | Description | Request | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/me` | `GET` | Bearer Token | Fetches current user profile and settings | None | `UserProfileResponse` |
| `/me` | `PUT` | Bearer Token | Updates display name or preferences | `UpdateUserProfileRequest` | `UserProfileResponse` |
| `/me/password` | `PUT` | Bearer Token | Updates account password | `ChangePasswordRequest` | `ResponseEntity<Void>` |
| `/me/data/export` | `GET` | Bearer Token | Exports entire user workspace as JSON | None | `ResponseEntity<byte[]>` (JSON File) |
| `/me/data/import` | `POST` | Bearer Token | Imports workspace JSON to restore data | Multipart `file` | `ResponseEntity<Void>` |

---

### 2.11 Public Placement Reference (`PublicUserController`) — Base Path: `/api/public`

| Endpoint Path | HTTP Method | Auth Required | Description | Request | Response Body |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/placement-sheets` | `GET` | Public | Fetches company recruitment sheet references | Query param: `company` | `List<PlacementSheetResponse>` |

---

## Related Documentation

- [**Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**Application Flow (Docs/App Flow.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
- [**Spring AI Prompt Engineering (Docs/PromptSkills.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PromptSkills.md)
- [**Backend Developer Guide (backend/README.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/README.md)
