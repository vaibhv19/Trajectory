# Trajectory — Backend REST API ☕

The backend of **Trajectory** is a high-performance RESTful API built on **Java 21** and **Spring Boot 3.3.1**, featuring AI parsing capabilities via **Spring AI** (Groq / Llama 3) and Virtual Thread concurrency execution.

---

## 🏗️ Technology Stack & Architecture

*   **Runtime Framework:** Java 21 + Spring Boot 3.3.1
*   **Virtual Threads:** Enabled via `spring.threads.virtual.enabled=true` to maximize throughput and prevent OS thread starvation during long-running LLM calls and AWS S3 file I/O operations.
*   **Security Architecture:** Stateless JWT authentication with access/refresh token rotation, bcrypt password hashing, and Spring Security OAuth2 integration for Google and GitHub.
*   **AI Integration:** **Spring AI** (`spring-ai-openai-spring-boot-starter`) orchestrating prompts against **Groq Cloud (Llama 3)** with automatic fallback to mock extraction algorithms when Groq API keys are omitted.
*   **Database & Migration:** PostgreSQL 16 (AWS RDS in Production / Docker in Local) with schema migrations managed programmatically via **Flyway** (`db/migration/V1__init_schema.sql` & `V2__add_missing_fields_and_tables.sql`).
*   **Object Storage:** **AWS S3** (`ap-south-1` region in Production) or local **MinIO** container for versioned PDF resumes and company attachments.
*   **Background Daemons:** Spring Scheduler (`GhostDetectionScheduler` running daily for inactive application flagging and `NotificationScheduler`).
*   **API Documentation:** SpringDoc OpenAPI 2.6.0 providing interactive Swagger UI at `/swagger-ui.html`.

---

## 📂 Backend Code Base Structure

Source files are organized in a clean layered architecture under `/src/main/java/com/trajectory/backend/`:

*   [`config/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/config) — Security configurations (`SecurityConfig.java`), S3 Client beans (`S3Config.java`), Web MVC CORS mappings, and JWT beans.
*   [`controller/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller) — REST Endpoints:
    *   `AuthController`: Local Login, Registration, Refresh Token, and OAuth callbacks.
    *   `AIController`: Job description parsing (`/extract-jd`), schedule parsing (`/extract-event`), outreach sentiment checks (`/analyze-outreach`).
    *   `ApplicationController`: Core job application tracking (CRUD, status history timeline, archiving).
    *   `OutreachController`: Networking CRM, recruiter contacts tracking, and one-click applicant conversion.
    *   `ResumeController`: Profile-linked versioned PDF resume uploads.
    *   `CompanyDocumentController`: Placement sheets and S3-based document management.
    *   `CareerProfileController`: Custom career persona configurations.
    *   `DashboardController`: Aggregated analytics data feed (funnels, response rates, agenda).
    *   `NotificationController`: Push subscription endpoints, unread notifications, and daily agenda.
    *   `UserController`: User profile updates, auto-archive settings, and ghost thresholds.
    *   `PublicUserController`: Unauthenticated public company placement info endpoints.
*   [`dto/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/dto) — Type-safe Java `record` instances for request/response payloads (`JobExtraction`, `EventExtraction`, `OutreachAnalysis`, `AuthResponse`, etc.).
*   [`exception/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/exception) — Global exception handler (`GlobalExceptionHandler.java`) returning standard structured JSON error responses.
*   [`model/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/model) — JPA entities (`User`, `Application`, `Outreach`, `Resume`, `CareerProfile`, `CompanyDocument`, `Notification`, `RefreshToken`, `ApplicationStatusHistory`).
*   [`repository/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/repository) — Spring Data JPA repository interfaces.
*   [`scheduler/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/scheduler) — Background jobs (`GhostDetectionScheduler`, `NotificationScheduler`).
*   [`security/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/security) — `JwtTokenProvider`, `JwtAuthenticationFilter`, `OAuth2AuthenticationSuccessHandler`, `MockOAuth2RedirectFilter`, `UserPrincipal`.
*   [`service/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/service) — Layer where transaction management, S3 storage operations (`S3StorageService`), and LLM orchestration prompts (`AIService`) live.

---

## ⚙️ Configuration & Environment Reference

The backend reads properties from [`src/main/resources/application.yml`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/resources/application.yml). Override these via environment variables or `.env.prod`:

```properties
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/trajectory_os
SPRING_DATASOURCE_USERNAME=trajectory_user
SPRING_DATASOURCE_PASSWORD=trajectory_password

# AWS S3 Storage
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_RESUMES=resumes
AWS_S3_BUCKET_COMPANY_DOCS=company-docs

# Spring AI & Groq LLM
SPRING_AI_OPENAI_API_KEY=gsk_your_groq_api_key
SPRING_AI_OPENAI_BASE_URL=https://api.groq.com/openai/v1
SPRING_AI_OPENAI_MODEL=llama3-8b-8192

# Security
JWT_SECRET_KEY=your-256-bit-base64-encoded-jwt-secret
SERVER_FORWARD_HEADERS_STRATEGY=framework
```

---

## 🛠️ Developer Commands

### Run Unit & Integration Tests
```bash
mvn clean test
```

### Run Backend Locally
```bash
mvn spring-boot:run
```
Server starts on port `8080`.

### Build Executable Deployment JAR
```bash
mvn clean package -DskipTests
```
Produces deployable JAR at `target/backend-0.0.1-SNAPSHOT.jar`.

---

## 📝 REST API Specification
For detailed documentation of all 11 REST controllers, endpoints, DTO records, and security constraints, refer to [Docs/API_SPECIFICATION.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md).

When running locally, access Swagger UI at:
*   Interactive UI: `http://localhost:8080/swagger-ui.html`
*   OpenAPI JSON: `http://localhost:8080/v3/api-docs`
