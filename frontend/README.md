# Trajectory — React Frontend SPA 🌐

The frontend of **Trajectory** is a high-fidelity Single Page Application (SPA) designed as a high-density, real-time command center for career pipeline management.

---

## 🌐 Live Production Application

The React SPA is deployed live in production:

*   **Live Web Application:** [**https://trajectory-mu-six.vercel.app**](https://trajectory-mu-six.vercel.app) — Production frontend hosted on Vercel's global Edge CDN.
*   **Production REST API:** [**https://trajectory-api.duckdns.org/api**](https://trajectory-api.duckdns.org/api) — Secure HTTPS API server processing client requests.
*   **Live Swagger Documentation:** [**https://trajectory-api.duckdns.org/swagger-ui/index.html**](https://trajectory-api.duckdns.org/swagger-ui/index.html) — Interactive API specification.

---

## 🛠️ Technology Stack & Dependencies

*   **Framework:** **React 19** (`^19.0.0`) bundled with **Vite** (`^5.3.4`) for fast HMR and compilation.
*   **Language:** TypeScript (`^5.5.3`) configured for strict type safety.
*   **Styling:** **Tailwind CSS** (`^3.4.6`) implementing custom tokens defined in [Docs/DESIGN.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/DESIGN.md).
*   **UI Components:** **Shadcn UI** primitives built over **Radix UI** primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`).
*   **State Management:**
    *   **Server State:** **TanStack Query v5** (`@tanstack/react-query ^5.51.1`) for API fetching, caching, optimistic UI updates, and query invalidation.
    *   **Client State:** **Zustand** (`^4.5.4`) for global authentication (`useAuthStore`), theme customization (`useThemeStore`), and UI alerts (`useUIStore`).
*   **Forms & Validation:** **React Hook Form** (`^7.52.1`) + **Zod** (`^3.23.8`) for client-side input validation.
*   **Analytics Visualizations:** **Recharts** (`^2.12.7`) rendering area and conversion funnel charts.
*   **Iconography:** Lucide React (`^0.407.0`).
*   **Routing:** React Router Dom (`^6.25.1`).
*   **Hosting Configuration:** Vercel Edge Network configured via [frontend/vercel.json](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/vercel.json) (`source: "/(.*)", destination: "/index.html"`).

---

## 📂 Frontend Directory Structure

Source files are organized under [`frontend/src`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src):

```text
src/
├── components/                     # Reusable UI Components
│   ├── auth/                       # Protected Route Wrappers
│   ├── common/                     # Dialogs, Modals, Loading Spinners
│   ├── layout/                     # Sidebar Navigation, Navbar, Header
│   └── ui/                         # Base Shadcn / Radix primitives
├── pages/                          # Primary Page Views & Canvases
│   ├── LoginPage.tsx               # Auth Page (Credentials & OAuth triggers)
│   ├── DashboardPage.tsx           # Main Command Center & Recharts Funnels
│   ├── ApplicationsPage.tsx        # High-Density Paginated Job Application Table
│   ├── ApplicationDetailsPage.tsx  # Timeline Inspector & History Nodes
│   ├── OutreachPage.tsx            # Networking CRM & Recruiter Cards Grid
│   ├── ResumesPage.tsx             # Career Profile Personas & Resume Manager
│   ├── ResourcesPage.tsx           # Company Placement Sheets & Document Uploads
│   └── SettingsPage.tsx            # User Preferences & Inactivity Thresholds
├── services/                       # API Integration Layer
│   └── api.ts                      # Axios Client Instance with Interceptors
├── store/                          # Zustand Global Slices
│   ├── authStore.ts                # Session state, JWT, and LocalStorage sync
│   ├── themeStore.ts               # Theme modes (light, dark, system)
│   └── uiStore.ts                  # Modals and notifications state
└── types/                          # Strict TypeScript Interfaces
    └── index.ts                    # User, Application, Outreach, DTO interfaces
```

---

## ⚙️ Client-Side Routing Reference

Client-side routes are configured in [`App.tsx`](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/src/App.tsx):

*   **`/login`** — Authentication Canvas.
*   **`/dashboard`** — Command Center landing page (`<ProtectedRoute>`).
*   **`/applications`** — Applications Table (`<ProtectedRoute>`).
*   **`/applications/:id`** — Application Detail Inspector & History Timeline (`<ProtectedRoute>`).
*   **`/outreach`** — Networking CRM Contact Grid (`<ProtectedRoute>`).
*   **`/resumes`** — Career Profile Manager & Versioned Resumes (`<ProtectedRoute>`).
*   **`/resources`** — Placement Criteria Sheets & Private S3 Storage (`<ProtectedRoute>`).
*   **`/settings`** — User Profile Settings & Ghost Threshold Controls (`<ProtectedRoute>`).

---

## 🛠️ Developer Commands

Ensure backend server is available at `VITE_API_BASE_URL` (defaults to `http://localhost:8080/api`).

### Install Dependencies
```bash
npm install
```

### Run Local Dev Server
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:5173`.

### Build Production Asset Bundle
```bash
npm run build
```
Generates optimized static build assets inside `/dist/`.

### Run Linters
```bash
npm run lint
```
