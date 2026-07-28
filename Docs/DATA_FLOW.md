# Data Flow: Trajectory (v1.0.1)

This document maps the flow of data across the front-end, backend, database, object storage, and external API integrations of **Trajectory**.

---

## 1. End-to-End Request-Response Flow

This section traces a standard REST request, such as fetching user applications from a client-side table:

```
[ React UI Component ] ────► Triggers TanStack Query hook (e.g. useQuery)
         ▲
         │ (Axios executes HTTP request)
         ▼
[ Axios HTTP Client ] ─────► Appends Bearer token from Zustand authStore
         ▲
         │ (HTTP GET /api/applications over SSL)
         ▼
[ Nginx Reverse Proxy ] ───► Terminates SSL, adds forwarded headers, passes to loopback
         ▲
         │ (HTTP GET to 127.0.0.1:8080)
         ▼
[ Spring Boot Filter ] ────► JwtAuthenticationFilter parses token and verifies signature
         ▲
         │ (Populates security context, passes to MVC)
         ▼
[ MVC REST Controller ] ───► ApplicationController extracts principal, routes to service
         ▲
         │ (Invokes ApplicationService.getApplications(user.id))
         ▼
[ JPA Service Layer ] ─────► Enforces business logic and isolates user data
         ▲
         │ (Queries database repository via Hibernate)
         ▼
[ Postgres Database ] ─────► executes SQL query, returns isolated records
```

---

## 2. AI Job Extraction Flow

This flow parses unstructured job postings using AI models:

```
[ User UI View ] ──────────► Pastes raw job description, clicks Parse
         ▲
         │ (Axios POST /api/ai/extract-jd with text body)
         ▼
[ AIController Gateway ] ──► Extracts text parameter, routes to AIService
         ▲
         │ (Calls AIService.extractJobDescription(text))
         ▼
[ AIService Layer ] ───────► Builds system prompt with requested JSON schemas
         ▲
         │
         ├─ (Active Groq Key Present?)
         │    ▼
         │  [ Connects to Groq Cloud / Llama 3 API ] ──► Extracts parameters
         │
         └─ (Groq Key Missing or 'mock-key'?)
              ▼
            [ Regex Offline Parser ] ──────────────────► Simulates parameters
         ▲
         │ (Returns structured JSON DTO)
         ▼
[ React Form View ] ───────► Pre-populates form fields for user review and confirmation
```

---

## 3. Resume Upload & S3 Pipeline Flow

This flow manages binary resume uploads:

```
[ Resume Upload UI ] ──────► User selects PDF file, selects profile, clicks Upload
         ▲
         │ (Axios Multipart Form POST /api/resumes/upload)
         ▼
[ ResumeController ] ──────► Receives file byte stream and metadata parameters
         ▲
         │ (Delegates to ResumeService.uploadResume)
         ▼
[ ResumeService Layer ] ───► Queries current profile resumes to increment version
         ▲
         │
         ▼ (Invokes S3StorageService.uploadFile)
[ S3StorageService ] ──────► Sanitizes key path names and configures SDK clients
         ▲
         │ (Uploads byte stream to ap-south-1 S3 bucket)
         ▼
[ AWS S3 Object Store ] ───► Persists PDF binary file and confirms upload status
         ▲
         │ (Saves metadata record mapping the S3 key)
         ▼
[ Postgres Relational ] ───► Inserts metadata record into resumes table
```

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
*   [**Application Flow (Docs/App Flow.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
