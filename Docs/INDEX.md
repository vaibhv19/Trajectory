# Trajectory Documentation Index 📚

Welcome to the canonical documentation center for **Trajectory** (Career Operating System). This directory contains all product specifications, architectural designs, API guides, and operations handbooks.

---

## 🗺️ Documentation Directory

### 📋 1. Product Planning Documents
These documents define product scope, user stories, visual requirements, and design tokens:

| Document | Primary Audience | Core Focus & Contents |
| :--- | :--- | :--- |
| 🚀 [**Root README**](file:///d:/Coding/Projects----For%20Resume/Trajectory/README.md) | Developers & Evaluators | Quickstart instructions, database entity layout, and project overview. |
| 📋 [**Product Requirements (PRD.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md) | Product Managers & Engineers | Core product goals, target personas, detailed functional requirements, and future roadmap. |
| 🗂️ [**Feature List (FEATURE_LIST.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/FEATURE_LIST.md) | Developers & Project Managers | Complete mapping of implemented vs. planned features to their frontend and backend codebase implementations. |
| ⚡ [**Tech Stack Specification (Tech Stack.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Tech%20Stack.md) | System Architects & Developers | Breakdown of technologies across client, server, database, cloud storage, and reverse proxy layers with rationales. |
| 🔄 [**Application Flow (App Flow.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md) | Full-Stack Engineers | End-to-end user journeys, authentication sequence diagrams, status lifecycles, and cron job operations. |
| 🎨 [**Visual Design System (DESIGN.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md) | Frontend Engineers & Designers | Spacing systems, layout densities, color tokens, and non-negotiable visual design constraints. |
| 🏗️ [**System Architecture (SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md) | System Architects | High-level system layout, container connections, database subnets, and thread concurrency profiles. |

---

### ⚙️ 2. Core Engineering Documents
These documents outline detailed technical parameters, security mechanisms, configurations, and internal strategies:

| Document | Primary Audience | Core Focus & Contents |
| :--- | :--- | :--- |
| 🔌 [**REST API Specification (API_SPECIFICATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md) | Integration Developers | Reference for REST API endpoints, DTO records, validation rules, and curl examples. |
| 🗄️ [**Database Schema (DATABASE_SCHEMA.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATABASE_SCHEMA.md) | Database Developers | Table columns, data types, primary/foreign keys, uniqueness constraints, performance indexes, and Flyway history. |
| 🛡️ [**Security Architecture (SECURITY_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SECURITY_ARCHITECTURE.md) | Security Engineers | Network isolation, SSL termination, JWT validations, database tenant isolation, and CORS setups. |
| 🔐 [**Authentication & Authorization (AUTHENTICATION_AUTHORIZATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/AUTHENTICATION_AUTHORIZATION.md) | Backend Developers | Spring Security filter chain configurations, Bcrypt hashing, OAuth2 success handling, and session contexts. |
| 🧩 [**Provider Strategy (PROVIDER_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PROVIDER_STRATEGY.md) | System Integrators | Integration details for S3 storage, Spring AI Groq gateways, and Google/GitHub OAuth identity clients. |
| 🧯 [**Error Handling Strategy (ERROR_HANDLING_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ERROR_HANDLING_STRATEGY.md) | Backend Developers | Custom exception hierarchy, REST error responses, field validation maps, and client toast interceptions. |
| 🧪 [**Testing Strategy (TESTING_STRATEGY.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/TESTING_STRATEGY.md) | QA & Automation | JUnit 5 Mockito configurations, Vitest Zustand store test suites, and local test execution commands. |
| 🚢 [**Deployment Architecture (Deployment.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md) | DevOps & SREs | Multi-stage Docker configs, Nginx proxies, Certbot Let's Encrypt renews, and GitHub Actions EC2 self-hosted runner. |
| 🔧 [**Environment Configuration (ENVIRONMENT_CONFIGURATION.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/ENVIRONMENT_CONFIGURATION.md) | Infrastructure Engineers | Environment variables dictionary, local properties, application.yml mappings, and frontend variables. |
| 📂 [**Folder Structure (FOLDER_STRUCTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/FOLDER_STRUCTURE.md) | New Onboarding Developers | Physical file locations across backend src, frontend assets, infrastructure scripts, and root files. |
| 🌊 [**Data Flow (DATA_FLOW.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATA_FLOW.md) | Full-Stack Developers | Request-response flow, AI extraction sequence, and S3 resume upload pathways. |
| 🔌 [**External Integrations (EXTERNAL_INTEGRATIONS.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/EXTERNAL_INTEGRATIONS.md) | Backend Developers | Integration endpoints for Groq Cloud API, S3 APIs, Google/GitHub OAuth2, and DuckDNS dynamic crons. |

---

### 📚 3. Reference Handbooks
*   🤖 [**Spring AI Prompt Engineering (PromptSkills.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PromptSkills.md) — Prompts, schemas, and chat integrations.
*   ☕ [**Backend Guide (backend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/backend/README.md) — Java build instructions and VM virtual thread profiles.
*   🌐 [**Frontend Guide (frontend/README.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/README.md) — React routing setups, state managers, and Vite commands.

---

## 📌 Document Hierarchy & Source of Truth Rule

```
                                [ Source Code & Configs ]
                                (Authoritative Baseline)
                                           │
                                           ▼
                                   [ Docs/INDEX.md ]
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   [ Product Planning ]             [ Core Engineering ]            [ Reference Handbooks ]
   ├── PRD.md                       ├── API_SPECIFICATION.md        ├── PromptSkills.md
   ├── FEATURE_LIST.md              ├── DATABASE_SCHEMA.md          ├── backend/README.md
   ├── Tech Stack.md                ├── SECURITY_ARCHITECTURE.md    └── frontend/README.md
   ├── App Flow.md                  ├── AUTHENTICATION_...
   ├── DESIGN.md                    ├── PROVIDER_STRATEGY.md
   └── SYSTEM_ARCHITECTURE.md       ├── ERROR_HANDLING_...
                                    ├── TESTING_STRATEGY.md
                                    ├── Deployment.md
                                    ├── ENVIRONMENT_...
                                    ├── FOLDER_STRUCTURE.md
                                    ├── DATA_FLOW.md
                                    └── EXTERNAL_INTEGRATIONS.md
```

### Governing Rule:
If any documentation file conflicts with the actual source code or configuration files in `backend/`, `frontend/`, `infrastructure/`, or `.github/`, **the source code is always right**. Any documentation discrepancy should be corrected to reflect the live codebase.
