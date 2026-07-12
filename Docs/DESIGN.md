# Design System: Trajectory 🚀

This document defines the type-safe visual design system, UI guidelines, and token structures for **Trajectory — Your Career Operating System**. It maps the features in the [Docs/PRD.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md) and the user journeys in [Docs/App Flow.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md) into a high-fidelity visual design. 

The specs are optimized for **Tailwind CSS** utility classes and **Shadcn UI** (Radix UI) component structures.

---

## 🎨 1. Global Style Tokens

### Color Palette (Theme Config)
Trajectory uses a modern, high-contrast palette built on slate and zinc neutrals. The primary accent is a vibrant digital indigo, while specialized states correspond directly to application statuses.

#### Base Theme Colors
| Token Name | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **`background`** | `#ffffff` | `#020617` (Slate 950) | Main app viewport background |
| **`foreground`** | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Primary text and high-contrast content |
| **`card`** | `#ffffff` | `#0f172a` (Slate 900) | Metric cards, lists, dialog panels |
| **`card-foreground`**| `#0f172a` | `#f8fafc` | Text within cards |
| **`muted`** | `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | Secondary content blocks, dividers |
| **`muted-foreground`**| `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | Helper text, secondary text, metadata labels |
| **`primary`** | `#4f46e5` (Indigo 600) | `#6366f1` (Indigo 500) | Call-to-actions, brand accents, primary buttons |
| **`border`** | `#e2e8f0` (Slate 200) | `#1e293b` (Slate 800) | Interactive borders, layout lines |
| **`ring`** | `#6366f1` | `#818cf8` | Keyboard focus ring indicators |

#### Application Status Colors (Type-Safe Enums)
Each status enum has a corresponding semantic state token to ensure instant readability in dashboard lists, Kanban boards, and tracking badges:

| Enum Status | Light Mode Theme | Dark Mode Theme | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **`APPLIED`** | Text: `#1d4ed8` (Blue 700)<br>Bg: `#dbeafe` (Blue 100)<br>Border: `#bfdbfe` | Text: `#60a5fa` (Blue 400)<br>Bg: `#1e3a8a/30`<br>Border: `#1d4ed8/50` | Standard job submission |
| **`OA`** | Text: `#b45309` (Amber 700)<br>Bg: `#fef3c7` (Amber 100)<br>Border: `#fde68a` | Text: `#fbbf24` (Amber 400)<br>Bg: `#78350f/30`<br>Border: `#b45309/50` | Online Assessment pending |
| **`INTERVIEW`**| Text: `#7c3aed` (Violet 600)<br>Bg: `#ede9fe` (Violet 100)<br>Border: `#ddd6fe` | Text: `#a78bfa` (Violet 400)<br>Bg: `#4c1d95/30`<br>Border: `#7c3aed/50` | Active interview stages |
| **`OFFER`** | Text: `#047857` (Emerald 700)<br>Bg: `#d1fae5` (Emerald 100)<br>Border: `#a7f3d0` | Text: `#34d399` (Emerald 400)<br>Bg: `#064e3b/30`<br>Border: `#047857/50` | Success milestone reached |
| **`REJECTED`** | Text: `#be123c` (Rose 700)<br>Bg: `#ffe4e6` (Rose 100)<br>Border: `#fecdd3` | Text: `#f43f5e` (Rose 400)<br>Bg: `#881337/30`<br>Border: `#be123c/50` | Unsuccessful pipeline exit |
| **`GHOSTED`** | Text: `#475569` (Slate 600)<br>Bg: `#f1f5f9` (Slate 100)<br>Border: `#e2e8f0` | Text: `#94a3b8` (Slate 400)<br>Bg: `#1e293b/30`<br>Border: `#334155/50` | Inactive (exceeding threshold) |
| **`WITHDRAWN`**| Text: `#71717a` (Zinc 600)<br>Bg: `#f4f4f5` (Zinc 100)<br>Border: `#e4e4e7` | Text: `#a1a1aa` (Zinc 400)<br>Bg: `#27272a/30`<br>Border: `#3f3f46/50` | User cancelled application |

---

### Typography Scale
Use Google Fonts **Outfit** for headings to give a sleek digital dashboard feel, paired with **Inter** for readability in body copy and data tables.

*   **Font Families:**
    *   `font-sans`: `Inter, system-ui, sans-serif`
    *   `font-display`: `Outfit, system-ui, sans-serif`
*   **Scale Limits:**
    *   `text-xs`: `0.75rem` (12px) — Helper tags, timeline timestamps, metadata.
    *   `text-sm`: `0.875rem` (14px) — Body text, table rows, button labels.
    *   `text-base`: `1rem` (16px) — Form labels, input fields, standard card descriptions.
    *   `text-lg`: `1.125rem` (18px) — Dialog headers, secondary card titles.
    *   `text-xl`: `1.25rem` (20px) — Widget headings, main card headers.
    *   `text-2xl`: `1.5rem` (24px) — Section headers, page layouts.
    *   `text-3xl`: `1.875rem` (30px) — Major stats counters (e.g. Dashboard active applications count).
    *   `text-4xl`: `2.25rem` (36px) — High-impact dashboard metrics.

---

### Radii & Borders
Trajectory features a premium, polished card layout with soft rounded corners.
*   **Small (`radius-sm`):** `4px` (`rounded-sm`) — Checkboxes, sub-status tags.
*   **Medium (`radius-md`):** `8px` (`rounded-md`) — Buttons, input fields, badges.
*   **Large (`radius-lg`):** `12px` (`rounded-lg`) — Modals, primary cards, popovers.
*   **Extra Large (`radius-xl`):** `16px` (`rounded-xl`) — Dashboard widgets, floating navigation bars.

---

### Layout Padding & Spacing Scale
The layout follows a strict 4px grid. Standard container padding increments:
*   `px-2` (`8px`) — Inline element spacing (badge icons, tags).
*   `p-4` (`16px`) — Default list items, mobile layout gutters, inputs.
*   `p-6` (`24px`) — Core card padding, desktop sidebar gutters, modal containers.
*   `p-8` (`32px`) — Large dashboard section panels.

---

## 🏛️ 2. Layout System & Shell

### Global Shell (Application Scaffold)
The workspace follows a responsive split layout consisting of a left-aligned navigation sidebar and a main workspace view.

*   **Desktop Structure:**
    *   Sidebar width: `w-64` (fixed, collapsing to `w-16` on demand).
    *   Sidebar backdrop: Glassmorphic blur (`backdrop-blur-md bg-background/80 border-r border-border`).
    *   Viewport container: Scrollable page content wrapper (`flex-1 h-screen overflow-y-auto px-6 py-8 md:px-8 bg-background`).

---

### Grid A: Multi-Metric Dashboard Layout
The main dashboard distributes metrics, agenda lists, and visual charts responsively using Tailwind's CSS grid properties:

```
+-----------------------------------------------------------------------+
|  PAGE HEADER (Title + Career Profile Filter + AI Quick Add Button)   |
+-----------------------------------------------------------------------+
|  [ Metric A ]    |  [ Metric B ]   |  [ Metric C ]   |  [ Metric D ]  |
+------------------------------------+----------------------------------+
|                                    |                                  |
|   FUNNEL ANALYTICS CHART           |   TODAY'S AGENDA WIDGET          |
|   (Span 8 Cols)                    |   (Span 4 Cols)                  |
|                                    |                                  |
+------------------------------------+----------------------------------+
|                                    |                                  |
|   RESUME HITS COMPARATOR           |   APPLICATIONS BY SOURCE         |
|   (Span 6 Cols)                    |   (Span 6 Cols)                  |
|                                    |                                  |
+------------------------------------+----------------------------------+
```

#### Tailwind Classes for Grid A
*   **Parent Page Layout:** `grid grid-cols-12 gap-6`
*   **Metric Row (4 Cards):** `col-span-12 sm:col-span-6 lg:col-span-3`
*   **Funnel Chart:** `col-span-12 lg:col-span-8 p-6 rounded-xl border bg-card`
*   **Agenda Sidebar Widget:** `col-span-12 lg:col-span-4 p-6 rounded-xl border bg-card`
*   **Resume Hits Comparator:** `col-span-12 md:col-span-6 p-6 rounded-xl border bg-card`
*   **Source Allocation:** `col-span-12 md:col-span-6 p-6 rounded-xl border bg-card`

---

### Grid B: CRM Outreach List View
The Networking/CRM tab structures contacts and actions through an adaptive card list layout:

*   **View Filter Bar:** Flex row with query inputs (`flex flex-col md:flex-row gap-4 items-center justify-between pb-6`).
*   **Contact Cards Grid:** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`.
*   **Card Anatomy:**
    ```html
    <div class="p-6 rounded-lg border bg-card flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
      <!-- Top header with Recruiter name and position -->
      <!-- Middle body detailing Company, email, and linkedin -->
      <!-- Footer containing Date Sent, Follow-up tag, and "Convert" Action -->
    </div>
    ```

---

## ⚡ 3. Core Component Visual States

### Buttons
All primary action elements use standard focus styles to facilitate navigation accessibility.

*   **Primary Action Button (`/src/components/ui/button.tsx`)**:
    *   *Idle:* `bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm`
    *   *Hover:* `bg-indigo-700 dark:bg-indigo-600 transition-colors duration-200`
    *   *Focus:* `ring-2 ring-ring ring-offset-2 outline-none`
    *   *Disabled:* `opacity-50 pointer-events-none cursor-not-allowed`
    *   *Loading (Spinner state):* Inserts a Lucide `Loader2` rotating icon (`animate-spin mr-2 h-4 w-4`).
*   **Secondary Ghost Button (e.g. Cancel)**:
    *   *Idle:* `border border-border bg-transparent text-foreground hover:bg-muted`
    *   *Hover:* `bg-slate-100 dark:bg-slate-800`

---

### Form Input Fields (`/src/components/ui/input.tsx`)
Text fields enforce data cleanliness and precise error feedback during LLM edits.

*   **Standard Inputs**:
    *   *Idle:* `w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm transition-colors`
    *   *Focus:* `outline-none ring-2 ring-ring ring-offset-0 border-primary`
    *   *Placeholder:* `text-muted-foreground`
    *   *Disabled:* `opacity-50 cursor-not-allowed bg-muted`
*   **Validation Error State**:
    *   *Classes:* `border-rose-500 text-rose-900 placeholder-rose-300 focus:ring-rose-500 focus:border-rose-500`
    *   *Error Message:* Follows the input immediately as `text-xs text-rose-500 mt-1 font-medium`.

---

### Dialog Modals (`/src/components/ui/dialog.tsx`)
Overlay panels trigger when users upload resumes, edit timelines, or prompt AI imports.

*   **Overlay Backdrop:** `fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in`
*   **Modal Container:** `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg duration-200 rounded-lg sm:max-w-md md:max-w-lg`
*   **Animations:**
    *   Entrance: `animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-1/2`
    *   Exit: `animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-1/2`

---

### Status Timeline Component
Used inside application detail pages to display chronological status transitions.

*   **Timeline Node (Completed):**
    *   *Indicator:* Circle with filled background (`bg-primary`) and checkmark SVG.
    *   *Timeline Bar:* Vertical/horizontal linking line (`bg-primary w-[2px] md:h-[2px]`).
*   **Timeline Node (Active / Current State):**
    *   *Indicator:* Pulsing glowing ring (`ring-4 ring-indigo-500/30 bg-primary h-4 w-4 border-2 border-background`).
*   **Timeline Node (Pending):**
    *   *Indicator:* Empty bordered circle (`border-2 border-muted bg-background h-4 w-4`).
    *   *Timeline Bar:* Faded linking line (`bg-muted w-[2px] md:h-[2px]`).

---

### Status Badges (Enums Mapping)
Status labels are created using the [Shadcn UI Badge](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/README.md) schema.

```tsx
import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        APPLIED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50",
        OA: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
        INTERVIEW: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/50",
        OFFER: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50",
        REJECTED: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50",
        GHOSTED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50",
        WITHDRAWN: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-400 dark:border-zinc-800/50",
      },
    },
    defaultVariants: {
      status: "APPLIED",
    },
  }
)
```

---

## ⚙️ 4. Tailwind Config Mapping Guide

To map these design system tokens directly to Tailwind utilities, extend your `tailwind.config.js` configuration as follows:

```javascript
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic Application Status Color Configurations
        status: {
          applied: {
            bg: "rgba(30, 58, 138, var(--status-opacity, 0.1))",
            text: "#60a5fa",
            border: "#1d4ed8",
          },
          oa: {
            bg: "rgba(120, 53, 15, var(--status-opacity, 0.1))",
            text: "#fbbf24",
            border: "#b45309",
          },
          interview: {
            bg: "rgba(76, 29, 149, var(--status-opacity, 0.1))",
            text: "#a78bfa",
            border: "#7c3aed",
          },
          offer: {
            bg: "rgba(6, 78, 59, var(--status-opacity, 0.1))",
            text: "#34d399",
            border: "#047857",
          },
          rejected: {
            bg: "rgba(136, 19, 55, var(--status-opacity, 0.1))",
            text: "#f43f5e",
            border: "#be123c",
          },
          ghosted: {
            bg: "rgba(30, 41, 59, var(--status-opacity, 0.1))",
            text: "#94a3b8",
            border: "#334155",
          },
          withdrawn: {
            bg: "rgba(39, 39, 42, var(--status-opacity, 0.1))",
            text: "#a1a1aa",
            border: "#3f3f46",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.sans],
      },
      keyframes: {
        "status-pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: .4 },
        },
      },
      animation: {
        "pulse-slow": "status-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 🚦 5. Page Directory & Routing Architecture

Trajectory runs as a multi-page React application with client-side routing managed by **React Router (v6+)**. The router handles transition animation states, layout shells, and type-safe parameter passing.

### Route Manifest

| Path | Screen Name | Layout Shell | Core Visual Components / Interactions |
| :--- | :--- | :--- | :--- |
| **`/login`** | Authentication Canvas | Minimal / Empty Shell | - Central login card with sliding state tabs (Login / Sign Up)<br>- Email/Password credentials form with Zod schema validation errors<br>- Google & GitHub OAuth buttons (brand SVG icons) |
| **`/dashboard`** | Command Center | Navigation Sidebar | - **4 Core Metrics counters** (Total, Active, Rejected, Ghosted)<br>- Funnel Conversion Rate analytics charts (Recharts Area/Bar)<br>- **Today's Agenda Widget** (upcoming interview and follow-up cards) |
| **`/applications`** | Application Matrix | Navigation Sidebar | - Search input & filter toggles (by profile, status, or date)<br>- Dense database grid with hover rows and paginated list pages<br>- Inline triggers for **Resume Quick Upload** and **AI Import** modals |
| **`/applications/:id`** | Application Inspector | Navigation Sidebar | - Chronological transition history timeline with duration indicators<br>- Pulsing active status ring & green checked completed markers<br>- Detailed notes, original JD text viewer, and meeting link triggers |
| **`/outreach`** | Networking CRM | Navigation Sidebar | - Recruiter and contact grid list layout (2/3 columns responsive)<br>- Follow-up warning indicators (dates highlighted based on thresholds)<br>- **Convert to Application** CTA to migrate contact info to a job entry |
| **`/resumes`** | Career Profiles Matrix | Navigation Sidebar | - Persona selector buttons (custom color headers & Lucide icons)<br>- Resume version list table (auto-incremented `v1`, `v2` badges)<br>- Changelog audit logs and quick upload forms |
