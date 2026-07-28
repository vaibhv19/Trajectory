# Folder Structure: Trajectory (v1.0.1)

This document provides a detailed directory mapping of the **Trajectory** repository, showing where configurations, services, components, models, and build environments reside.

---

## 1. Repository Directory Map

The repository is structured as a monorepo containing decoupled backend and frontend code bases:

```
trajectory/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Production deployment CI/CD workflow
├── Docs/                       # Canonical planning & engineering documentation
│   ├── INDEX.md
│   ├── PRD.md
│   └── ...
├── backend/                    # Java 21 / Spring Boot 3.3.1 microservice
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/trajectory/backend/
│   │   │   │   ├── config/     # App-wide configurations (Cors, Security, S3)
│   │   │   │   ├── controller/ # REST Controllers (AI, App, Auth, CRM)
│   │   │   │   ├── dto/        # Immutable Request/Response DTO records
│   │   │   │   ├── exception/  # Custom Exceptions & Global Exception Handler
│   │   │   │   ├── model/      # JPA Hibernate SQL entities
│   │   │   │   ├── repository/ # Spring Data JPA database repository interfaces
│   │   │   │   ├── scheduler/  # Scheduled cron services (Ghost, Notifications)
│   │   │   │   ├── security/   # JWT providers, OAuth success handlers, filters
│   │   │   │   └── service/    # Core business logic services
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway schema SQL migrations (V1, V2)
│   │   │       └── application.yml# Backend application configurations
│   │   └── test/
│   │       └── java/com/trajectory/backend/
│   │           └── service/    # Service-layer JUnit 5 / Mockito unit tests
│   ├── Dockerfile              # Multi-stage production container configuration
│   └── pom.xml                 # Maven build dependencies config
├── frontend/                   # React 19 / TypeScript SPA frontend
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (modals, cards, layout)
│   │   ├── pages/              # Routing pages (Dashboard, CRM, Resumes)
│   │   ├── services/           # Axios client configurations & interceptors
│   │   ├── store/              # Zustand global state slices
│   │   ├── App.tsx             # Main routing registry component
│   │   ├── index.css           # Global CSS & Tailwind imports
│   │   └── main.tsx            # React application entry point
│   ├── vercel.json             # Vercel SPA routing rewrite configurations
│   ├── package.json            # npm package dependency configurations
│   ├── tailwind.config.js      # Tailwind CSS design token configurations
│   └── vite.config.ts          # Vite build configurations
├── docker-compose.yml          # Local dev environment (Postgres, MinIO, Redis)
└── docker-compose.prod.yml     # Production EC2 backend compose configurations
```

---

## 2. Subsystem Details

### 2.1 Backend Microservice Layout
*   `com.trajectory.backend.config` — Contains cross-cutting configurations like `SecurityConfig.java` (Spring Security), `WebConfig.java` (CORS), and `S3Config.java` (AWS S3 Client builder).
*   `com.trajectory.backend.controller` — Contains REST Controller classes exposing endpoints documented in [Docs/API_SPECIFICATION.md](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/API_SPECIFICATION.md).
*   `com.trajectory.backend.model` — Contains the JPA entity models representing the tables defined in [Docs/DATABASE_SCHEMA.md](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATABASE_SCHEMA.md).
*   `com.trajectory.backend.security` — Contains core JWT filter pipelines, OAuth2 success handlers, and the principal context representations.
*   `com.trajectory.backend.scheduler` — Contains background schedulers for automated ghost detection and notification digests.

### 2.2 Frontend Client Layout
*   `src/components` — Reusable components:
    *   `Layout.tsx` — Standard app navigation sidebar wrapper.
    *   `StatusTimeline.tsx` — Chromatic timeline representing application audit records.
    *   `AddApplicationModal.tsx` / `AIImportModal.tsx` — Modals for manual application additions and raw job description parses.
*   `src/pages` — View layers:
    *   `HomePage.tsx` — Combines daily agendas, active counters, and reminders.
    *   `ApplicationsPage.tsx` — Compact high-density data table for application crud tracking.
    *   `AnalyticsPage.tsx` — Renders Recharts graphics tracking sources, profiles, and conversions.
    *   `OutreachPage.tsx` — Grid card layout for networking CRM logs.
    *   `ResumesPage.tsx` — Persona layouts for version control uploads.
    *   `SettingsPage.tsx` — Configures profiles, ghost thresholds, push configurations, and data export/import utilities.
*   `src/store` — Context files:
    *   `authStore.ts` — Tracks active JWT token sessions.
    *   `themeStore.ts` — Manages dark/light theme state.
    *   `stores.test.ts` — Store unit tests.

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Database Schema (Docs/DATABASE_SCHEMA.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/DATABASE_SCHEMA.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
