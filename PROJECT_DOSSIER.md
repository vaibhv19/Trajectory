# Trajectory

## 1. Project Overview
**Trajectory** is a self-hosted, full-stack career operating system and job application management platform built to centralize job search lifecycles, recruiter outreach interactions, version-controlled resume mappings, and schedule tracking. The system pairs a Java 21 / Spring Boot 3.3.1 backend (leveraging Project Loom Virtual Threads, Spring AI, PostgreSQL via Flyway, and AWS S3/MinIO) with a React 19 / TypeScript single-page application bundled with Vite and styled using Tailwind CSS.

---

## 2. Why I Built It
Job hunting across multiple job boards, recruiter threads, and outreach channels quickly devolves into fragmented spreadsheets and lost communication timelines. Standard spreadsheet trackers lack:
1. Automated timeline auditing when application states transition.
2. Inactivity/ghost detection when employers fail to respond within user-defined thresholds.
3. Direct association between specific resume revisions and the applications they were tailored for.
4. Structured extraction of unstructured job descriptions and interview invitations into actionable calendar events and CRM contacts.

Trajectory was built to solve these tracking gaps as an integrated, private operating system.

---

## 3. Problem / Question
- **Application State Drift:** How can a job search pipeline automatically surface stale or ghosted applications without requiring continuous manual status audits?
- **Unstructured Text Ingestion:** How can unstructured job descriptions and interview emails be parsed into strict, type-safe application records and calendar events with graceful offline/free fallback?
- **Document-Application Version Parity:** How can an engineer track exactly which resume revision and company placement notes were submitted to each position across time?

---

## 4. What It Actually Does
- **Job Application Lifecycle Management:** Full CRUD tracking of applications with status states (`APPLIED`, `OA`, `INTERVIEW`, `OFFER`, `REJECTED`, `GHOSTED`, `WITHDRAWN`), salary ranges, locations, and source tracking.
- **Automated Audit Timeline:** Every status change automatically writes an immutable entry into `application_status_history` with timestamps and notes.
- **Automated Ghost Detection:** A daily scheduled cron job inspects active applications against user-configurable inactivity day thresholds (`ghostThresholdDays`), automatically transitioning stale applications to `GHOSTED` and logging a history event.
- **AI Extraction Pipeline:** Ingests raw job descriptions, interview invitation emails, and recruiter communications via Spring AI (configured with Groq `llama3-8b-8192`) to produce structured Java records (`JobExtraction`, `EventExtraction`, `OutreachAnalysis`), with regex-based mock fallbacks when API keys are absent or services fail.
- **Networking CRM & One-Click Conversion:** Tracks recruiter outreach contacts with follow-up dates and provides a workflow to convert outreach threads directly into formal job applications.
- **Multi-Persona Resume & Document Vault:** Manages career profiles (e.g., "Backend Engineer", "Product Manager") linked to versioned PDF resumes stored in AWS S3 or MinIO, complete with upload filename sanitization against path traversal.
- **Pipeline Analytics:** Computes conversion funnels, response rates, source distributions, and upcoming agendas for dashboard visualization using Recharts.

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend SPA                           │
│  React 19 • TypeScript • Vite • Zustand • TanStack Query    │
│  Tailwind CSS • Recharts • Sonner • Lucide Icons            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot 3.3.1 (Java 21)                │
│  Virtual Threads (Loom) • Spring Security (Stateless JWT)   │
│  Spring AI (Groq / Llama 3) • Spring Data JPA • Flyway      │
├───────────────────────┬──────────────────────┬──────────────┤
│ PostgreSQL 16 (RDS)   │ AWS S3 / MinIO       │ Groq API     │
│ Schema Migrations     │ Versioned Resumes    │ LLM Parsing  │
│ UUIDs & Typed Enums   │ Company Documents    │ & Extraction │
└───────────────────────┴──────────────────────┴──────────────┘
```

- **Backend Architecture:** Layered Spring Boot microservice structured into `controller`, `service`, `repository`, `model`, `dto`, `security`, `config`, and `scheduler`.
- **Database Layer:** PostgreSQL 16 managed via Flyway migrations (`V1__init_schema.sql`, `V2__add_missing_fields_and_tables.sql`) using UUID primary keys, native ENUM types (`application_status`, `outreach_status`), foreign key constraints with cascade deletes, and composite indexes.
- **Frontend Architecture:** Feature-based modular React SPA. Server state is managed via TanStack Query (React Query) with custom API fetch wrappers supporting JWT Bearer authentication and automated 401 token refresh queueing; client-side state is handled via Zustand stores (`authStore`, `themeStore`, `sidebarStore`).

---

## 6. Important Technical Decisions

1. **Project Loom Virtual Threads over Reactive/WebFlux:**
   - *Decision:* Enabled `spring.threads.virtual.enabled: true` in `application.yml` on Java 21 instead of using reactive programming (Project Reactor/WebFlux).
   - *Rationale:* Preserves standard imperative Spring MVC programming paradigms and transparent JPA transaction management while allowing high-concurrency blocking I/O (e.g., S3 file streaming, LLM HTTP calls, database queries) on lightweight virtual threads.

2. **Spring AI with Typed Record Mapping and Resilient Mock Fallbacks:**
   - *Decision:* Implemented `AIService` using Spring AI's `ChatClient` mapped to typed Java `record` classes (`JobExtraction`, `EventExtraction`, `OutreachAnalysis`) paired with deterministic Regex/heuristic fallback methods.
   - *Rationale:* Ensures the application remains fully functional in local development, offline environments, or during LLM API rate limits without throwing unhandled exceptions to the user.

3. **Flyway Migration Strategy with PostgreSQL Native Enums:**
   - *Decision:* Replaced Hibernate auto-DDL in production with Flyway migrations (`spring.jpa.hibernate.ddl-auto: validate`), defining PostgreSQL `CREATE TYPE ... AS ENUM`.
   - *Rationale:* Guarantees schema integrity, prevents unreviewed structural mutations in production, and enforces strict database-level status validation.

4. **Dual Authentication Pipeline with Local Simulation Mode:**
   - *Decision:* Implemented JWT stateless authentication with 7-day refresh token rotation alongside Spring Security OAuth2 (Google & GitHub) and a custom `MockOAuth2RedirectFilter`.
   - *Rationale:* Allows developers and evaluators to test authenticated workflows and OAuth redirections locally without provisioning Google/GitHub cloud console credentials.

5. **Sanitized Multi-Bucket Object Storage Pipeline:**
   - *Decision:* Built `S3StorageService` utilizing AWS SDK for Java v2 with dedicated buckets for resumes and company documents, coupled with a filename sanitization algorithm (`sanitizeFilename`).
   - *Rationale:* Prevents directory traversal vulnerabilities and character encoding corruption while decoupling storage targets (AWS S3 in production, MinIO container in local Docker Compose).

---

## 7. Interesting Engineering Problems

- **Token Refresh Race Conditions in Frontend Interceptors:**
  - *Problem:* When multiple API queries fire concurrently upon token expiration, multiple simultaneous `/auth/refresh` requests were triggered, invalidating rotation tokens.
  - *Solution:* Implemented an in-flight refresh mutex (`isRefreshing`) and callback subscriber queue (`refreshSubscribers`) in `api.ts`. All secondary requests pause and subscribe to the active refresh promise, executing only after the new token is acquired.
- **Dynamic Inactivity Detection Across Per-User Thresholds:**
  - *Problem:* Different users configure different ghost criteria (e.g., 14 days vs. 45 days), making a single global database query threshold insufficient.
  - *Solution:* Constructed `GhostDetectionScheduler` to query non-terminal active applications with `lastActivityAt` exceeding the minimum viable window (7 days), evaluate each against `app.getUser().getGhostThresholdDays()`, and transactionally transition state while appending an audit record.
- **Strict Testing Mocking in Headless Browser Environments:**
  - *Problem:* Zustand's `themeStore` dynamically evaluates `window.matchMedia` for OS-level dark mode detection at module instantiation, causing Vitest/jsdom to fail during headless execution.
  - *Solution:* Created `frontend/src/test/setup.ts` to mock `window.matchMedia` query matching and event listener dispatchers before store initialization.

---

## 8. Failure Modes / Things That Went Wrong
- **Redis Dependency in Production Containerization:**
  - *Symptom:* Production container startup crashed when `spring-boot-starter-data-redis` attempted to connect to a non-existent production Redis instance.
  - *Resolution:* Configured `SPRING_AUTOCONFIGURE_EXCLUDE` in `docker-compose.prod.yml` and local profile exclusions to ensure optional cache components do not block core service initialization.
- **Client Route and Directory Desynchronization:**
  - *Symptom:* Documentation previously referenced legacy planned paths (`/resources`, `uiStore`, `components/ui`) from earlier scaffolding.
  - *Resolution:* Audited and unified the frontend tree, removing unused component exports (`SkeletonText`, `SkeletonCard`), removing obsolete `@types/react-router-dom`, and aligning route specs with live components (`/companies`, `sidebarStore`, `Layout.tsx`).

---

## 9. Verification / Testing
- **Backend Testing:** JUnit 5 test suite executing via Maven Wrapper (`./mvnw.cmd clean test -q`). Verified context loading and service layer user registration flows.
- **Frontend Testing:** Vitest test suite executing in jsdom environment (`npm test` / `npx vitest run`) covering Zustand global stores (`authStore`, `themeStore` 3-mode dark/system/light cycles).
- **Static Analysis & Type Checking:** TypeScript compilation (`tsc -b`), Vite production bundling (`vite build`), and Oxlint (`npm run lint`) passing with 0 errors and 0 warnings across all TypeScript files.

---

## 10. Deployment
- **Container Infrastructure:** Multi-stage `Dockerfile` leveraging Eclipse Temurin 21 JRE Alpine image for lightweight backend containerization.
- **Docker Compose Profiles:**
  - `docker-compose.yml`: Local multi-container environment with PostgreSQL 16, Redis 7, MinIO S3 storage, and automated bucket initialization (`minio/mc`).
  - `docker-compose.prod.yml`: Production composition mapping environment variables from `.env.prod`.
- **CI/CD Pipeline:** GitHub Actions workflow (`.github/workflows/deploy.yml`) executing on a self-hosted EC2 runner triggered on push to `main`, performing zero-downtime container rebuilding and dangling image pruning.
- **Frontend Deployment:** Hosted on Vercel (`https://trajectory-mu-six.vercel.app`).

---

## 11. What I Learned
- **Virtual Threads in Spring Boot:** Enabling virtual threads provides immediate I/O scalability for microservices interacting with LLMs and object storage without introducing the cognitive and debugging complexity of reactive streams.
- **Structured LLM Outputs:** Using Spring AI prompt templates with schema binding directly to Java records produces predictable JSON payloads far more reliably than manual string parsing.
- **Database-First Integrity:** Enforcing state transitions through database ENUMs and immutable history tables guarantees auditability that application code alone cannot ensure over time.

---

## 12. What Changed in My Thinking
- **From AI as a Gimmick to AI as Structured ETL:** Shifted from viewing LLMs as conversational chatbots to treating them as structured data extraction engines that translate unstructured user input (emails, job postings) directly into typed domain objects.
- **From Implicit State to Immutable Event History:** Realized that tracking just the `current_status` of a job application is insufficient; maintaining a dedicated `application_status_history` table transforms the application into an analytical tool.

---

## 13. Distinctive / Interesting Details
- **Mock OAuth Filter (`MockOAuth2RedirectFilter`):** Custom Spring Security filter that intercepts `/oauth2/authorization/{provider}` when OAuth credentials are set to mock values, generating a valid authenticated mock user session for offline testing.
- **Keyboard-Driven Navigation (`CommandPalette.tsx`):** Global `Ctrl+K` command palette allowing instant keyboard navigation across all application modules, actions, and settings.
- **Theme Cycling with OS Detection:** Zustand store implementing a 3-way cycle (`light` -> `dark` -> `system`) that listens to OS-level media query changes via `matchMedia`.

---

## 14. Skills Demonstrated

### Engineering Skills
- Full-Stack Web Application Architecture
- REST API Design & Implementation
- Relational Database Schema Design & Migration
- Cloud Object Storage Integration & File Sanitization
- Stateless Authentication & JWT Token Rotation
- Asynchronous Job Scheduling & Background Daemons
- Frontend State Management & Concurrency Handling

### Technologies & Tools
- **Backend:** Java 21, Spring Boot 3.3.1, Spring Data JPA, Spring Security, Spring AI, Hibernate, Flyway, Maven, JUnit 5, Mockito
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, React Router v7, Recharts, Lucide React, Oxlint, Vitest
- **Cloud & DevOps:** Docker, Docker Compose, AWS S3, AWS EC2, PostgreSQL, MinIO, Redis, GitHub Actions (CI/CD), Vercel

### Concepts
- Project Loom Virtual Threads
- Role-Based Access Control (RBAC) & OAuth2 Flow
- Database Indexing & Cascade Deletions
- Immutable Audit Logging
- Graceful Degradation & Fallback Design

### Best Skills for LinkedIn
1. Java / Spring Boot
2. React.js / TypeScript
3. PostgreSQL & Flyway
4. Spring Security (JWT & OAuth2)
5. AWS (S3 & EC2 Deployment)
6. Docker & CI/CD Pipelines
7. Spring AI / LLM Orchestration
8. Zustand & TanStack Query State Architecture

---

## 15. Public Content

### LinkedIn Project Description
Most job search trackers are passive spreadsheets that quickly get out of date. I built **Trajectory**, a self-hosted career operating system designed to automate tracking, recruiter interactions, and resume versioning.

Built with Java 21 (Spring Boot 3.3.1) and React 19 / TypeScript, the system uses Project Loom virtual threads for high-concurrency I/O across AWS S3 file streaming and database queries. It features automated ghost detection via daily scheduled cron jobs, immutable status history timelines, and Spring AI integration to extract structured job details and interview dates from raw email and job post text.

Working with Spring Boot 3.3 and Java 21 virtual threads reinforced how much simpler concurrent I/O becomes without reactive framework overhead, while Flyway migrations and strict database ENUMs kept the domain model clean throughout iteration.

### LinkedIn Featured Description
**Trajectory — Career Operating System & Job Pipeline Tracker**  
Full-stack career management platform with automated inactivity detection, versioned S3 resume management, and Spring AI parsing.  
🔗 Live Demo: https://trajectory-mu-six.vercel.app

### Resume Bullets
- **Architected a full-stack career operating system** using Java 21, Spring Boot 3.3.1, and React 19/TypeScript, leveraging Project Loom Virtual Threads for concurrent I/O across database operations and AWS S3 storage.
- **Implemented an automated audit pipeline and ghost detection engine** using Spring `@Scheduled` cron services and Flyway-managed PostgreSQL schemas, tracking state transitions across immutable history tables.
- **Built resilient structured data extraction workflows** using Spring AI and Groq LLM endpoints with deterministic fallback heuristics to parse raw job postings and calendar invitations into type-safe Java records.

### GitHub Repo One-Liner
Self-hosted career operating system with automated ghost tracking, S3 resume management, and Spring AI.

---

## 16. Claims That Should NOT Be Made
- ❌ Do NOT claim "enterprise-scale throughput", "millions of processed applications", or fabricated user adoption metrics.
- ❌ Do NOT claim "production cost savings of X%" or "reduced job search time by Y%".
- ❌ Do NOT claim it uses microservices orchestration (it is a decoupled monolithic backend API + React SPA).
- ❌ Do NOT claim Redis is actively used in production caching (Redis auto-configuration is excluded in production).

---

## 17. Evidence / Source References
- **Java 21 & Virtual Threads:** `backend/pom.xml` (`<java.version>21</java.version>`), `backend/src/main/resources/application.yml` (`spring.threads.virtual.enabled: true`).
- **Spring AI & Groq Model:** `backend/pom.xml` (`spring-ai-openai-spring-boot-starter`), `backend/src/main/resources/application.yml` (`llama3-8b-8192`, base URL `https://api.groq.com/openai/v1`), `backend/src/main/java/com/trajectory/backend/service/AIService.java`.
- **Database Schema & Migrations:** `backend/src/main/resources/db/migration/V1__init_schema.sql`, `V2__add_missing_fields_and_tables.sql`.
- **Ghost Detection Cron:** `backend/src/main/java/com/trajectory/backend/scheduler/GhostDetectionScheduler.java` (`@Scheduled(cron = "0 0 1 * * ?")`).
- **S3 Storage & Filename Sanitization:** `backend/src/main/java/com/trajectory/backend/service/S3StorageService.java`.
- **Security & OAuth Mocking:** `backend/src/main/java/com/trajectory/backend/security/SecurityConfig.java`, `MockOAuth2RedirectFilter.java`.
- **Frontend State & Concurrency Interceptors:** `frontend/src/services/api.ts` (token refresh subscriber queue), `frontend/src/store/authStore.ts`, `themeStore.ts`.
- **Deployment & Docker:** `Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`, `.github/workflows/deploy.yml`.
