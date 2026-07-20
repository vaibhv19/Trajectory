# Trajectory Documentation Index 📚

Welcome to the canonical documentation center for **Trajectory** (Career Operating System). This directory contains all technical specifications, product requirements, architectural design documents, API specifications, and deployment operational guides.

---

## 🗺️ Documentation Directory

| Document | Target Audience | Primary Focus & Description |
| :--- | :--- | :--- |
| 🚀 [**Root README**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/README.md) | All Developers & Evaluators | Project overview, key features, high-level architecture diagram, database schema summary, tech stack summary, and quickstart commands. |
| 📋 [**Product Requirements (PRD.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md) | Product Managers & Engineers | Core product goals, target personas, detailed functional requirements (Dashboard, Applications, Resumes, CRM, AI, Documents), non-functional requirements, and future roadmap. |
| 🔄 [**Application Flow (App Flow.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md) | Full-Stack Engineers | End-to-end user journeys, execution lifecycles, authentication sequence diagrams, background Spring Scheduler cron workflows, and data portability operations. |
| ⚡ [**Tech Stack Specification (Tech Stack.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Tech%20Stack.md) | System Architects & Developers | Comprehensive breakdown of technology stacks across client, server, database, cloud storage, containerization, and reverse proxy layers with architectural rationales. |
| 🔌 [**REST API Specification (API_SPECIFICATION.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md) | Backend & Integration Developers | Complete reference for all 11 REST API controllers, endpoint paths, HTTP verbs, request/response DTO records, error codes, and validation constraints. |
| 🎨 [**Visual Design System (DESIGN.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md) | Frontend Engineers & UI Designers | Design philosophy, non-negotiable UI ban list, visual hierarchy, spacing, Tailwind CSS mappings, Shadcn/Radix component structures, and status color codes. |
| 🤖 [**Spring AI Prompt Engineering (PromptSkills.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PromptSkills.md) | AI Engineers & Backend Developers | System prompts, prompt templates, structured JSON schema definitions, Spring AI `ChatClient` integration, and automatic mock fallback algorithms. |
| 🚢 [**Production Deployment Guide (Deployment.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/Deployment.md) | DevOps & Infrastructure Engineers | Single source of truth for AWS EC2, AWS RDS PostgreSQL 16, AWS S3, Vercel SPA hosting, Nginx HTTPS proxying, Certbot SSL, and GitHub Actions Self-Hosted Runner CI/CD. |
| 📊 [**Documentation Audit Report (DOCUMENTATION_AUDIT.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/DOCUMENTATION_AUDIT.md) | Maintenance Team & Auditors | Audit metrics, obsolete documentation removed, undocumented features brought to light, and the **Documentation Coverage Matrix**. |
| ☕ [**Backend Developer Guide (backend/README.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/backend/README.md) | Java / Spring Boot Developers | Package layout under `/src/main/java`, Spring Virtual Thread configuration, Flyway migration setup, and local build instructions. |
| 🌐 [**Frontend Developer Guide (frontend/README.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/README.md) | React / TypeScript Developers | Component directory tree under `/src`, Zustand store slices, TanStack Query integration, React Router paths, and Vite build commands. |

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
 [ System Architecture ]          [ Data & API Specs ]             [ Infrastructure ]
 ├── README.md                    ├── API_SPECIFICATION.md         ├── Deployment.md
 ├── PRD.md                       ├── Flyway Migrations            ├── docker-compose.prod.yml
 └── Tech Stack.md                └── PromptSkills.md              └── .github/workflows/
```

### Governing Rule:
If any documentation file conflicts with the actual source code or configuration files in `backend/`, `frontend/`, `infrastructure/`, or `.github/`, **the source code is always right**. Any documentation discrepancy should be corrected to reflect the live codebase.
