# Trajectory— React Frontend SPA 🌐

The frontend of **Trajectory** is a high-fidelity Single Page Application (SPA) designed as an interactive instrument ledger / control center for career management.

---

## 🛠️ Technology Stack & Libraries

*   **Framework:** React 18+ (bundled with **Vite** for fast HMR and compilation).
*   **Language:** TypeScript (configured for strict type checks, no `any`).
*   **Styling:** **Tailwind CSS** implementing a custom-mixed paper-and-graphite layout token structure (detailed in `DESIGN.md`).
*   **UI Components:** **Shadcn UI** built over raw **Radix UI** primitives.
*   **State Management:**
    *   **Server State:** **TanStack Query (React Query v5)** for API fetch caching, optimistic UI updates, and synchronization.
    *   **Client State:** **Zustand** for lightweight global UI states (sidebar toggles, modal open states, active profiles, and active themes).
*   **Forms & Validation:** **React Hook Form** + **Zod** schema constraints matching backend validations.
*   **Analytics Visualizations:** **Recharts** rendering custom Area and Bar conversions (representing the application funnel).
*   **Iconography:** Lucide React icons.
*   **Router:** React Router Dom (v6+).

---

## 📂 Project Structure

All client application source files are nested in the [`/src`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src) directory:

*   [`pages/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages) — Main route canvases:
    *   `LoginPage`: Minimal canvas handling email credentials login/registration and social auth button triggers.
    *   `DashboardPage`: Command Center showing high-level counters, Recharts area charts, and "Today's Agenda".
    *   `ApplicationsPage`: High-density application matrix showing a tabular, paginated database list with filter controls. Includes AI Import and Quick Resume Upload dialogs.
    *   `ApplicationDetailsPage`: Detailed view displaying status audit trails on a chronological timeline (represented by diamond nodes), S3 resume associations, and schedule invite parser modals.
    *   `OutreachPage`: Networking CRM contacts grid with follow-up warning triggers and "Convert to Application" widgets.
    *   `ResumesPage`: Career persona configurations, versioned PDF records, and keywords changelog logs.
    *   `ResourcesPage`: Placement records database for 100+ technology companies and private S3-backed document uploads.
    *   `SettingsPage`: Display name profile edits, passwords updates, and ghost threshold configs.
*   [`components/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/components) — Reusable components (e.g. navigation sidebar, shell layout, table primitives).
*   [`services/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/services) — `api.ts` Axios-based client layer with API token interceptors and hooks.
*   [`store/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/store) — Zustand global slices (e.g. authentication, themes, UI alerts).
*   [`types/`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/types) — Strict TypeScript interfaces mapping database entities.

---

## ⚙️ Routing & View Paths

Client-side routes are mapped inside [`App.tsx`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/App.tsx):

*   `/login` — Credentials login/signup tabs.
*   `/dashboard` — Command center landing.
*   `/applications` — Job tracker table list.
*   `/applications/:id` — Detail view and audit history timeline.
*   `/outreach` — CRM networking and recruiters.
*   `/resumes` — Career profiles and resume manager.
*   `/resources` — Placement details and private storage.
*   `/settings` — User preferences and configurations.

---

## 🛠️ Developer Commands

Ensure that the backend server is running on `http://localhost:8080` (or configure `VITE_API_BASE_URL` in `.env` accordingly).

### Install Dependencies
```bash
npm install
```

### Run Local Dev Server
```bash
npm run dev
```
Starts Vite dev server, typically exposed at [http://localhost:5173](http://localhost:5173).

### Build Production Bundle
```bash
npm run build
```
Creates optimized build assets inside `/dist/`.

### Run Linter
```bash
npm run lint
# or run oxlint fast linter:
npx oxlint
```
