# Trajectory — Personal Engineering Notebook & Master Learning Guide 📖

Welcome to the internal engineering notebook for **Trajectory**. This directory (`Docs/Learning/`) is designed as a deep-dive educational curriculum. It explains every major technology, architectural pattern, security configuration, database migration, cloud infrastructure component, and CI/CD workflow implemented in Trajectory.

---

## 🎯 Purpose & Learning Goals

This notebook moves beyond standard API documentation to teach **how and why** everything works under the hood. It is written as an in-depth case study for developers who want to master modern full-stack engineering, cloud architecture, and DevOps.

By reading through these guides, you will learn to:
1. Explain, debug, and extend Spring Security JWT authentication and OAuth2 login flows.
2. Master Spring AI prompt orchestration, Java record structured outputs, and mock fallback mechanisms.
3. Understand database schema evolutions using Flyway programmatically and JPA entity design.
4. Architect S3 object storage pipelines with auto-incrementing file versioning.
5. Harness Java 21 Virtual Threads and Spring Scheduler daemons for high-throughput async processing.
6. Deploy production systems on AWS EC2 using Docker Compose, Nginx SSL reverse proxying, and Let's Encrypt Certbot timers.
7. Implement zero-inbound-port CI/CD deployments using GitHub Actions Self-Hosted Runners.
8. Structure high-performance React 19 SPAs using Zustand client stores and TanStack Query v5 server caching.

---

## 📚 Curriculum Learning Modules

| Module # | Guide Title | Core Technologies & Concepts Covered |
| :--- | :--- | :--- |
| **Module 01** | [**Authentication & Spring Security**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/01_Authentication_and_Spring_Security.md) | Spring Security 6, Stateless JWT Tokens, Bcrypt, Google/GitHub OAuth2, `OAuth2AuthenticationSuccessHandler`, `MockOAuth2RedirectFilter`, CORS Security. |
| **Module 02** | [**Spring AI & LLM Orchestration**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/02_Spring_AI_LLM_Orchestration.md) | Spring AI `ChatClient`, Groq Cloud (Llama 3), Java `record` DTOs, Structured Output Converters, `isMockMode()` Fallback Regex. |
| **Module 03** | [**Database Migrations & JPA Persistence**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/03_Database_Flyway_and_JPA.md) | AWS RDS PostgreSQL 16, Flyway `V1` & `V2` SQL Migrations, JPA Entities, PostgreSQL ENUMs, Composite Indexes, Cascade Rules. |
| **Module 04** | [**AWS S3 File Storage Pipeline**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/04_AWS_S3_File_Storage_Pipeline.md) | AWS S3 SDK v2, MinIO Docker Container, `S3StorageService`, Resume Auto-Versioning (`v1` ➔ `v2`), Filename Sanitization Regex. |
| **Module 05** | [**Virtual Threads & Async Processing**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/05_Virtual_Threads_and_Async_Processing.md) | Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`), Platform Threads vs. Virtual Threads, `@Scheduled` Cron Daemons. |
| **Module 06** | [**Production Infrastructure & Reverse Proxy**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/06_Production_Deployment_Infrastructure.md) | AWS EC2 (Ubuntu 24.04), AWS RDS, AWS S3, Docker Compose (`docker-compose.prod.yml`), Nginx SSL Reverse Proxy, Certbot Timers, DuckDNS. |
| **Module 07** | [**CI/CD & Self-Hosted Runner**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/07_CI_CD_and_Self_Hosted_Runner.md) | GitHub Actions (`deploy.yml`), EC2 Self-Hosted Runner, Outbound HTTPS Long-Polling, systemd Service Management, Zero-Port Security. |
| **Module 08** | [**Frontend React 19 State & Routing**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Learning/08_Frontend_React19_State_and_Routing.md) | React 19, Vite, TypeScript Strict Types, Zustand Client Stores (`useAuthStore`), TanStack Query v5 Server Caching, Axios Interceptors. |

---

## 🛠️ Structure of Each Learning Guide

Every guide in this notebook follows a standardized **17-section learning blueprint**:
1. **What it is** — Core conceptual definition.
2. **Why Trajectory uses it** — Architectural trade-offs and rationale.
3. **What problem it solves** — Pain points prevented by this solution.
4. **Where it appears in this repository** — Absolute directory and source file locations.
5. **Every related configuration file** — Properties, YAML, environment keys, and JSON configs.
6. **Every important class/file/script** — Code file listings.
7. **Complete execution flow** — Step-by-step lifecycle walkthrough.
8. **How it works internally** — Under-the-hood implementation mechanics.
9. **How to modify or extend it safely** — Developer extension guidelines.
10. **Common mistakes** (Gotchas to avoid).
11. **Debugging techniques** — CLI commands, logs, and diagnostic endpoints.
12. **Production considerations** — Performance, memory, and scaling trade-offs.
13. **Security considerations** — Vulnerabilities and defensive measures.
14. **Best practices in Trajectory** — Industry standards modeled in this repo.
15. **Practical code example** — Real snippet from Trajectory's codebase.
16. **Architecture diagram** — Visual Mermaid flowcharts.
17. **Reference file paths** — Clickable markdown links to source code.

---

## 📌 Master Navigation Links

- [**Root Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**Production Deployment Guide (Docs/Deployment.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md)
- [**REST API Specification (Docs/API_SPECIFICATION.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md)
