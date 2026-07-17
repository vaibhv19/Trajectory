# Trajectory— Backend REST API ☕

The backend of **Trajectory** is a high-performance RESTful API built on **Java 21** and **Spring Boot 3.x**, featuring AI parsing capabilities via **Spring AI** and local containerized infrastructure.

---

## 🏗️ Technology Stack & Architectures

*   **Runtime:** Java 21 + Spring Boot 3.x (compiled with virtual thread support).
*   **Virtual Threads:** Enabled via `spring.threads.virtual.enabled=true` to maximize throughput and prevent OS thread starvation during long-running LLM and S3 storage invocations.
*   **Security:** Stateless JWT authentication (with access/refresh token rotation) and Spring Security OAuth2 integration for Google and GitHub.
*   **AI Integration:** **Spring AI** structured JSON converters orchestrating prompts against **Groq Cloud (Llama 3)**.
*   **Database & Migration:** PostgreSQL 16 (local/AWS RDS) with schema migrations managed programmatically via **Flyway**.
*   **Storage:** Local **MinIO** container (S3-compatible API) or **AWS S3** for resume PDFs and eligibility documents.
*   **Cache:** **Redis** for caching server metrics and rate limiting API access.
*   **Background Tasks:** Spring Scheduler for daily ghost application detection and notification checks.
*   **Async Processing:** Auditing via Spring `@EventListener` combined with `@Async` for status change logs.

---

## 📂 Project Structure

The Java source code is organized into a modular layered architecture under `/src/main/java/com/trajectory/backend/`:

*   [`config/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/config) — Security configurations, JWT beans, Web MVC cors mappings, S3 Client configurations, and Redis configuration.
*   [`controller/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/controller) — REST Endpoints:
    *   `AuthController`: Local Login, Registration, Google/GitHub OAuth callbacks.
    *   `AIController`: Job description parsing, schedule parsing, outreach response sentiment checks.
    *   `ApplicationController`: Core application tracker (CRUD, status change updates).
    *   `OutreachController`: Networking CRM, recruiter contacts tracking, and one-click applicant conversion.
    *   `ResumeController`: Versioned resume file uploads.
    *   `CompanyDocumentController`: Placement guidelines and S3-based document management.
    *   `DashboardController`: Aggregated analytics data feed.
    *   `NotificationController`: Web push subscription and daily agenda endpoints.
    *   `UserController`: Profile edits, auto-archive settings, and ghost thresholds.
*   [`dto/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/dto) — Type-safe Java `record` instances for request/response payloads.
*   [`model/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/model) — JPA entities (e.g. `User`, `Application`, `Outreach`, `Resume`) mapping to PostgreSQL tables and enums.
*   [`repository/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/repository) — Spring Data JPA repository layers.
*   [`scheduler/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/scheduler) — Background workers like `GhostApplicationScheduler`.
*   [`service/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/java/com/trajectory/backend/service) — Layer where transaction management, S3 storage operations, and LLM orchestration prompts live.

---

## ⚙️ Environment Variables & Configs

The backend reads configurations from [`src/main/resources/application.yml`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/src/main/resources/application.yml). You can override these using environment variables:

```properties
# Server
PORT=8080

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/trajectory_os
SPRING_DATASOURCE_USERNAME=trajectory_user
SPRING_DATASOURCE_PASSWORD=trajectory_password

# Caching
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# MinIO / AWS S3
AWS_ACCESS_KEY_ID=trajectory_admin
AWS_SECRET_ACCESS_KEY=trajectory_storage_secret
AWS_S3_ENDPOINT=http://localhost:9000

# Spring AI & Groq
SPRING_AI_OPENAI_API_KEY=your_groq_api_key
SPRING_AI_OPENAI_BASE_URL=https://api.groq.com/openai/v1
SPRING_AI_OPENAI_MODEL=llama3-8b-8192

# JWT Secret
JWT_SECRET_KEY=dHJhamVjdG9yeS1jYXJlZXItb3BlcmF0aW5nLXN5c3RlbS1zZWNyZXQta2V5LTIwMjY=
```

---

## 🛠️ Developer Commands

Ensure local infrastructure (Postgres, Redis, MinIO) is running first by executing `docker-compose up -d` at the root of the workspace.

### Run Tests
```bash
mvn clean test
```

### Run Backend Server (Locally)
```bash
mvn spring-boot:run
```
The server will start on port `8080`.

### Build Executable Deployment JAR
```bash
mvn clean package -DskipTests
```
This produces a deployable JAR at `target/backend-0.0.1-SNAPSHOT.jar`.

---

## 📝 API Documentation
The API contains auto-generated OpenAPI (Swagger) documents. When the backend application is running, you can access the interactive Swagger UI here:
*   [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
*   Raw OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
