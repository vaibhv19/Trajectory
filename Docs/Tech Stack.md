# Tech Stack Specification: Trajectory

This document provides the canonical technical specifications, library versions, and architectural rationales for **Trajectory**. Every technology listed below is verified directly against repository configuration files (`pom.xml`, `package.json`, `docker-compose.prod.yml`, and `application.yml`).

---

## 1. Frontend Client (Single Page Application)

| Category | Technology / Library | Exact Version | Architectural Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | `^19.0.0` | UI rendering engine providing component lifecycle management and Concurrent React capabilities. |
| **Build Tool** | Vite | `^5.3.4` | Ultra-fast local development server (HMR) and production asset bundling. |
| **Language** | TypeScript | `^5.5.3` | Enforces strict compile-time type safety across API DTOs, stores, and components. |
| **Styling Engine** | Tailwind CSS | `^3.4.6` | Utility-first CSS framework implementing design tokens defined in [Docs/DESIGN.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md). |
| **UI Components** | Shadcn UI / Radix | `@radix-ui/*` | Unstyled, accessible UI primitives (`Dialog`, `Select`, `Tabs`, `Tooltip`) wrapped with custom Tailwind styling. |
| **Server State** | TanStack Query | `^5.51.1` | React Query v5 for client-side API caching, background refetching, and query invalidation. |
| **Client State** | Zustand | `^4.5.4` | Lightweight global state management for auth (`useAuthStore`), themes, and UI alerts. |
| **Forms & Validation**| React Hook Form + Zod | `^7.52.1` / `^3.23.8` | Performant form state handling with schema validation matching backend DTO rules. |
| **Data Visualization**| Recharts | `^2.12.7` | SVG-based charting library rendering response rates and conversion funnels. |
| **Iconography** | Lucide React | `^0.407.0` | Vector icon library for UI navigation and career profile indicators. |
| **Client Routing** | React Router Dom | `^6.25.1` | Client-side routing (`/dashboard`, `/applications`, `/outreach`, `/resumes`, `/resources`). |
| **Hosting & CDN** | Vercel Edge Network | N/A | Edge-hosted static SPA deployment with fallback rewrites defined in `vercel.json`. |

---

## 2. Backend Platform (RESTful Microservice)

| Category | Technology / Library | Exact Version | Architectural Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Language & Runtime**| Java (JDK) | `21` | Modern LTS Java runtime featuring Virtual Threads (`java.lang.Thread.ofVirtual()`). |
| **Core Framework** | Spring Boot | `3.3.1` | Production-grade framework providing dependency injection, Web MVC, and auto-configuration. |
| **Virtual Threads** | JDK 21 Virtual Threads | Enabled | Configured via `spring.threads.virtual.enabled=true` to maximize I/O throughput during blocking LLM and S3 calls. |
| **AI Integration** | Spring AI | OpenAI Starter | Provides standardized `ChatClient` abstractions orchestrating prompts against Groq Cloud. |
| **Security & Auth** | Spring Security | 6.x | Stateless JWT authentication, bcrypt password hashing, and OAuth2 Client integration. |
| **JWT Tokens** | JJWT | `0.12.5` | Generates and validates signed 256-bit HMAC SHA-256 access and refresh tokens. |
| **Data Access** | Spring Data JPA | 3.x | Object-Relational Mapping (ORM) powered by Hibernate for PostgreSQL persistence. |
| **Database Migrations**| Flyway | `flyway-core` | Version-controlled schema migrations (`V1__init_schema.sql` and `V2__add_missing_fields_and_tables.sql`). |
| **API Documentation** | SpringDoc OpenAPI | `2.6.0` | Automatically generates interactive Swagger UI at `/swagger-ui.html` and OpenAPI 3.0 spec. |
| **Background Daemons**| Spring Scheduler | Built-in | Manages `@Scheduled` cron tasks for daily application ghosting detection and notification alerts. |
| **Code Generation** | Project Lombok | Runtime | Annotations (`@Data`, `@Slf4j`, `@Builder`) eliminating boilerplate Java code. |

---

## 3. Data & Storage Tier

| Storage Layer | Technology | Environment Context | Description & Configuration |
| :--- | :--- | :--- | :--- |
| **Relational DB** | AWS RDS PostgreSQL 16 | Production | Managed PostgreSQL database hosting user accounts, job applications, timeline history, and CRM data. |
| **Relational DB** | PostgreSQL 16 (Docker) | Local Dev | Local Docker container (`trajectory_db`) running on port `5432` with database `trajectory_os`. |
| **Object Storage** | AWS S3 (`ap-south-1`) | Production | Managed cloud object storage storing versioned PDF resumes and company attachments. |
| **Object Storage** | MinIO (Docker) | Local Dev | S3-compatible local object storage container running on port `9000` (API) & `9001` (Console). |
| **Cache Exclusion** | Spring Data Redis | Production (Excluded) | Redis auto-configuration is explicitly excluded in production via `SPRING_AUTOCONFIGURE_EXCLUDE`. |

---

## 4. Production Infrastructure & CI/CD

| Infrastructure Component | Provider / Technology | Description & Configuration |
| :--- | :--- | :--- |
| **Server Host** | AWS EC2 (Ubuntu 24.04 LTS) | EC2 host running Docker Engine, backend container, Nginx, and GitHub Actions runner. |
| **Container Orchestration**| Docker Compose | Single-service production spec (`docker-compose.prod.yml`) running `trajectory_backend_prod` on port `8080`. |
| **Reverse Proxy** | Nginx | Host-native proxy handling SSL termination, security headers, and proxying traffic to port `8080`. |
| **SSL/TLS Authority** | Let's Encrypt (Certbot) | Automated X.509 SSL certificate provisioning and renewal via systemd timers (`trajectory-api.duckdns.org`). |
| **Dynamic DNS** | DuckDNS | Dynamic DNS resolver pointing custom subdomains to the EC2 public IP. |
| **CI/CD Pipeline** | GitHub Actions | Automated workflow (`.github/workflows/deploy.yml`) triggered on pushes to `main`. |
| **Deployment Agent** | Self-Hosted Runner | Systemd runner service on EC2 long-polling GitHub over HTTPS to execute local container rebuilds. |

---

## 5. Architectural Rationales

### 5.1 Why Java 21 Virtual Threads?
LLM API calls to Groq and object storage file operations are I/O bound and can take 500ms–2000ms. Traditional platform threads tie up OS threads during I/O wait. Virtual Threads (`spring.threads.virtual.enabled=true`) allow Spring Boot to handle thousands of concurrent requests with near-zero memory footprint.

### 5.2 Why Groq Cloud (Llama 3)?
Groq offers an exceptionally low-latency inference engine (800+ tokens/sec) with a free tier. Spring AI abstracts Groq via OpenAI protocol compatibility (`api.groq.com/openai/v1`), enabling seamless model swapping.

### 5.3 Why Self-Hosted GitHub Actions Runner?
Running a self-hosted runner directly on EC2 eliminates the need to expose port `22` (SSH) to public GitHub cloud runners. The runner long-polls GitHub over outbound HTTPS (port `443`), enhancing server security while executing native `docker compose up --build -d` deployments.

---

## Related Documentation

- [**Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**Product Requirements Document (Docs/PRD.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md)
- [**Production Deployment Guide (Docs/Deployment.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md)