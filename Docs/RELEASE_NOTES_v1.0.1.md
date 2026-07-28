# Release v1.0.1 - The Engineering Documentation Upgrade 🚀

Trajectory version **v1.0.1** is a documentation-only release that retrofits and upgrades the repository's documentation set to MAANG-level specifications. 

This release introduces **zero code modifications** and **zero architectural changes**, ensuring 100% backward compatibility and parity with the active production deployment.

---

## 📋 Release Highlights

This upgrade split and expanded the project's documentation into distinct, highly specialized manuals categorized under Product Planning, Core Engineering, and Internal Learning Handbooks.

### 1. ⚙️ Core Engineering Documents
We created and upgraded 12 specialized engineering reference manuals:
*   [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md) — Exhaustive REST controller descriptions, schema models, and curl request/response snippets.
*   [**Database Schema (Docs/DATABASE_SCHEMA.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATABASE_SCHEMA.md) — Comprehensive database mapping, performance indexes (`idx_*`), constraints, and Flyway migration scripts.
*   [**Security Architecture (Docs/SECURITY_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SECURITY_ARCHITECTURE.md) — Perimeter security maps, SSL termination, JWT validations, and VPC database isolation rules.
*   [**Authentication & Authorization (Docs/AUTHENTICATION_AUTHORIZATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/AUTHENTICATION_AUTHORIZATION.md) — Spring Security filter chain configurations, Bcrypt hashing, and Google/GitHub OAuth2 callback handlers.
*   [**Provider Strategy (Docs/PROVIDER_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PROVIDER_STRATEGY.md) — Integration specifications for Spring AI Groq LPU models, AWS S3 buckets (with local MinIO support), and social logins.
*   [**Error Handling Strategy (Docs/ERROR_HANDLING_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ERROR_HANDLING_STRATEGY.md) — Custom exception hierarchies, REST error envelopes, validation maps, and frontend Axios intercepts.
*   [**Testing Strategy (Docs/TESTING_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/TESTING_STRATEGY.md) — JUnit 5 Mockito configurations, Vitest state store unit tests, and CLI execution commands.
*   [**Deployment Architecture (Docs/Deployment.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md) — Multi-stage Docker configurations, Nginx proxies, Certbot renewals, self-hosted runners, and resolutions of 5 critical production issues.
*   [**Environment Configuration (Docs/ENVIRONMENT_CONFIGURATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ENVIRONMENT_CONFIGURATION.md) — Environment variables dictionary, local properties, and application.yml mappings.
*   [**Folder Structure (Docs/FOLDER_STRUCTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/FOLDER_STRUCTURE.md) — Monorepo directory structure across backend packages and frontend components.
*   [**Data Flow (Docs/DATA_FLOW.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATA_FLOW.md) — MVC request-response tracing, AI workflows, and S3 resume uploads.
*   [**External Integrations (Docs/EXTERNAL_INTEGRATIONS.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/EXTERNAL_INTEGRATIONS.md) — Connection parameters, payloads, credentials, models, and DNS specifications for external services.

---

### 2. 📚 Internal Learning Handbooks
We upgraded the 9 educational modules to serve as a deep-dive developer onboarding curriculum:
*   [**Handbook Master Index (Docs/Learning/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/README.md) — Curriculum structure and standard 17-section learning blueprints.
*   [**Module 01: Authentication & Spring Security**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/01_Authentication_and_Spring_Security.md) — Deep-dive Spring Security filters and stateless JWT token validations.
*   [**Module 02: Spring AI & LLM Prompt Orchestration**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/02_Spring_AI_LLM_Orchestration.md) — ChatClient prompts, Java record converters, and offline mock fallbacks.
*   [**Module 03: Database Migrations & JPA Persistence**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/03_Database_Flyway_and_JPA.md) — Schema migrations, Hibernate checks, indexes, and custom JPQL database repositories.
*   [**Module 04: AWS S3 Object Storage & Resume File Pipeline**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/04_AWS_S3_File_Storage_Pipeline.md) — AWS SDK v2, local MinIO, key namespace mappings, and version calculation.
*   [**Module 05: Java 21 Virtual Threads & Background Daemons**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/05_Virtual_Threads_and_Async_Processing.md) — Virtual thread ForkJoinPool mount/unmount behaviors and background schedulers.
*   [**Module 06: Production Cloud Infrastructure & Nginx Proxying**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/06_Production_Deployment_Infrastructure.md) — Vercel edge networks, EC2 security groups, private RDS subnets, and Nginx proxy parameters.
*   [**Module 07: CI/CD Pipelines & Self-Hosted Runner**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/07_CI_CD_and_Self_Hosted_Runner.md) — Outbound HTTPS long-polling runner architecture and Docker replaces.
*   [**Module 08: Frontend React 19 State Architecture, Query Caching & Routing**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/08_Frontend_React19_State_and_Routing.md) — Zustand store persistance, TanStack Query invalidation, Axios auth token request interceptors, and protected routes.

---

### 3. 🌐 Public-Facing Documentation
*   [**Root README (README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/README.md) — Completely refactored landing page with correct workspace references, architecture diagram, feature breakdowns, and unified documentation index.
*   [**Backend README (backend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/README.md) — Layered code structure breakdown, environment reference, and execution commands.
*   [**Frontend README (frontend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/README.md) — Vite script configurations, state managers, routes dictionary, and installation commands.

---

## 🎓 Target Audiences & Objectives
This release ensures that Trajectory serves as:
1.  **Recruiter Review Asset:** Presents a professional, production-ready portfolio project with complete specifications and deployment diagrams.
2.  **Developer Reference Manual:** Explains how to set up, extend, build, and test the project locally.
3.  **Educational Curriculum:** Explains the under-the-hood implementation mechanics of full-stack Java/React architecture.
