# Tech Stack Specification: Trajectory (v1.0.1)

This document provides the canonical technical specifications, library versions, and architectural rationales for **Trajectory**. Every technology listed below is verified directly against repository configuration files (`pom.xml`, `package.json`, `docker-compose.prod.yml`, and `application.yml`).

---

## 1. Frontend Client Tier (Single Page Application)

The client tier is built as a lightweight, type-safe Single Page Application (SPA) designed for fast load times and rapid client-side caching.

| Category | Technology / Library | Version | Architectural Purpose & Rationale |
| :--- | :--- | :---: | :--- |
| **Core Framework** | React | `^19.0.0` | UI rendering engine providing component lifecycle management, high-performance rendering, and React 19 Concurrent capabilities. |
| **Build System** | Vite | `^5.3.4` | Ultra-fast local development compilation (HMR) and optimized rollup-based production asset bundling. |
| **Language** | TypeScript | `^5.5.3` | Enforces strict compile-time type safety across API DTO records, Zustand stores, and component props. |
| **Styling Engine** | Tailwind CSS | `^3.4.6` | Utility-first CSS engine implementing the visual tokens and design rules defined in [Docs/DESIGN.md](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md). |
| **UI Components** | Shadcn UI / Radix UI | `@radix-ui/*` | Unstyled, fully accessible UI primitives (e.g., `Dialog`, `Select`, `Tabs`, `Tooltip`) styled custom-fit via Tailwind. |
| **Server State** | TanStack Query | `^5.51.1` | React Query v5 managing client-side cache expiration, background refetching, and query mutation invalidations. |
| **Client State** | Zustand | `^4.5.4` | High-performance, lightweight global client state management for authentication (`useAuthStore`), themes, and UI toasts. |
| **Forms & Validation**| React Hook Form + Zod | `^7.52.1` / `^3.23.8` | Performant form state tracking and client-side schema validation aligning with backend DTO validations. |
| **Data Visualization**| Recharts | `^2.12.7` | SVG-based charting engine rendering response rate rollups and pipeline funnel conversions. |
| **Iconography** | Lucide React | `^0.407.0` | SVG vector icon library providing UI navigation indicators and career profile colors. |
| **Client Routing** | React Router Dom | `^6.25.1` | Standard React Router handling client routing for `/dashboard`, `/applications`, `/outreach`, `/resumes`, etc. |
| **Hosting & CDN** | Vercel Edge Network | N/A | Production client hosting utilizing Vercel's Edge CDN for fast asset delivery, configured with `vercel.json` SPA routing. |

---

## 2. Backend Platform Tier (REST API Gateway)

The backend microservice is designed as a secure, stateless REST API gateway.

| Category | Technology / Library | Version | Architectural Purpose & Rationale |
| :--- | :--- | :---: | :--- |
| **Language & Runtime**| Java (JDK) | `21` | Modern LTS Java runtime utilizing modern language features and JDK 21 Virtual Threads. |
| **Core Framework** | Spring Boot | `3.3.1` | Provides core dependency injection, Spring Web MVC API gateways, and production-ready auto-configurations. |
| **Virtual Threads** | JDK 21 Virtual Threads | Enabled | Configured via `spring.threads.virtual.enabled=true` to maximize API throughput during long-polling LLM and S3 operations. |
| **AI Integration** | Spring AI | Starter | Integrates Groq Cloud (using OpenAI protocol compatibility) for parsing job postings, schedules, and sentiments. |
| **Security & Auth** | Spring Security | `6.3.1` | Manages stateless JWT authentication filters, bcrypt password encoders, and Google/GitHub OAuth2 clients. |
| **JWT Tokens** | JJWT | `0.12.5` | Generates and validates signed HMAC SHA-256 tokens for session rotation and verification. |
| **Data Access** | Spring Data JPA | `3.3.1` | Object-Relational Mapping (ORM) powered by Hibernate for PostgreSQL persistence. |
| **Database Migrations**| Flyway | `10.15.0` | Programmatic schema migrations (`V1__init_schema.sql` and `V2__add_missing_fields_and_tables.sql`). |
| **API Documentation** | SpringDoc OpenAPI | `2.6.0` | Generates Swagger UI interactive testing pages at `/swagger-ui/index.html` and outputs OpenAPI 3.0 specs. |
| **Background Daemons**| Spring Scheduler | Built-in | Scheduled crons run daily for ghost detection and hourly for notification digestion. |
| **Code Generation** | Project Lombok | `1.18.32` | Java compiler annotations reducing boilerplate code (e.g. `@Data`, `@Slf4j`, `@Builder`). |

---

## 3. Data & Storage Tier

| Storage Layer | Technology | Environment | Configuration Details |
| :--- | :--- | :---: | :--- |
| **Primary Relational DB**| AWS RDS PostgreSQL 16 | Production | Managed relational instance hosting user records, job application entries, audit histories, and CRM data. |
| **Local Relational DB**| PostgreSQL 16 (Docker) | Local Dev | Docker container (`trajectory_db`) running on port `5432` with database schema `trajectory_os`. |
| **Cloud Object Storage**| AWS S3 (`ap-south-1`) | Production | Managed AWS S3 bucket storing versioned PDF resumes and private company documents. |
| **Local Object Storage**| MinIO (Docker) | Local Dev | S3-compatible local bucket running on port `9000` (REST API) and `9001` (Admin Console). |
| **Caching Cache** | Redis (Docker) | Local Dev | Configured in development Docker Compose to run on port `6379`. |
| **Cache Exclusion** | Spring Data Redis | Production (Excluded) | Redis auto-configuration is explicitly excluded in production via `SPRING_AUTOCONFIGURE_EXCLUDE` to prevent dependency lookups. |

---

## 4. Production Infrastructure & CI/CD Pipeline

| Infrastructure Component | Provider / Technology | Description & Configuration Details |
| :--- | :--- | :--- |
| **Virtual Host Server** | AWS EC2 (Ubuntu 24.04 LTS) | Hosted virtual machine running Docker Engine, host-native Nginx proxy, and local deployment runners. |
| **Containerization** | Docker Compose | Builds backend Spring Boot code into `trajectory_backend_prod` running on port `8080` internally. |
| **Reverse Proxy / SSL** | Nginx + Certbot | Reverse proxies external HTTP/HTTPS traffic to internal port `8080`, terminates SSL, and renews Let's Encrypt certificates. |
| **Dynamic Name Server**| DuckDNS | Dynamic DNS subdomain mapping (`trajectory-api.duckdns.org`) resolving to the EC2 elastic IP. |
| **Deployment Engine** | GitHub Actions | Automated build & deploy workflows (`.github/workflows/deploy.yml`) executing on pushes to `main`. |
| **Deployment Agent** | Self-Hosted Runner | Local systemd service on EC2 polling GitHub via HTTPS to pull updates and rebuild containers. |

---

## 5. Architectural Rationales

### 5.1 JDK 21 Virtual Threads (`java.lang.Thread.ofVirtual()`)
Job description extractions (Groq LLM) and resume uploads/downloads (S3) are I/O bound. Traditional Spring Boot platforms assign one OS thread per connection. Under load, I/O latency of 1000ms–2000ms exhausts thread pools. 

By enabling `spring.threads.virtual.enabled=true`, Spring Boot runs on top of Virtual Threads (Project Loom). When a blocking I/O call occurs, the virtual thread is unmounted from the carrier OS thread, allowing other virtual threads to run. This drastically increases throughput and scales resource utilization.

### 5.2 Groq Cloud Inference Gateway
Groq's LPU (Language Processing Unit) offers high inference speeds (exceeding 800 tokens/second) on Llama 3 models, making AI extraction feel instantaneous. Spring AI abstracts these prompts using OpenAI-compatible endpoints (`api.groq.com/openai/v1`), enabling seamless model swapping in backend properties without changing any code.

### 5.3 Self-Hosted GitHub Actions Runner
Exposing SSH port `22` to the public cloud or utilizing third-party CI/CD tools creates security risks. The self-hosted runner executes natively on the EC2 host as a background systemd daemon. It polls GitHub over outbound HTTPS (port `443`), eliminating the need to expose inbound network ports. When a workflow triggers, the runner executes `docker compose up --build -d` locally, ensuring a secure, isolated deployment loop.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Product Requirements Document (Docs/PRD.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md)
*   [**Feature List (Docs/FEATURE_LIST.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/FEATURE_LIST.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
*   [**Application Flow (Docs/App Flow.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
*   [**Visual Design System (Docs/DESIGN.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md)