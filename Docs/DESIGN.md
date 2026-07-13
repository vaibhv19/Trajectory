# Design System: Trajectory

This document defines the type-safe visual design system, UI guidelines, and token structures for **Trajectory — Your Career Operating System**. It maps the features in the [Docs/PRD.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md) and the user journeys in [Docs/App Flow.md](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md) into a high-fidelity visual design. 

The specs are optimized for **Tailwind CSS** utility classes and **Shadcn UI** (Radix UI) component structures.

---

## 🧭 0. Design Direction

**The problem with the previous pass:** Indigo-600 primary on a Slate/Zinc neutral scale is the unmodified shadcn/ui default theme. The status badges (`blue-100`/`blue-700`, `amber-100`/`amber-700`, `purple-100`/`purple-700`...) are literal, un-tinted entries straight out of the Tailwind palette. Outfit + Inter is one of the most common AI-generated font pairings in existence. Rounded-xl cards, a glassmorphic blurred sidebar, and a 4-metric-card-plus-two-charts dashboard grid is the default answer to "make me a SaaS dashboard" — it appears regardless of what the product actually does. None of this is *wrong*, it's just unowned.

**The concept:** Trajectory tracks a job application's path from submission to outcome — literally a trajectory. The design leans into that: data reads like entries in a **flight log / instrument ledger**, not a consumer app. Numbers, dates, and statuses are set in a monospaced data face so they align like a logbook. Status transitions are plotted as an actual traced line rather than implied through a bar chart. Corners are mostly square — this is a precision tool, not a lifestyle app.

**Signature element:** the **trajectory line** — a thin, deliberate stroke that runs through the status timeline (as a ruled connector between ticks, not a generic vertical bar) and reappears as the literal shape of the funnel chart (an arc plotting applications lost at each stage, instead of a bar-per-stage chart). It's the one recurring visual idea the whole system hangs off.

**Palette logic:** brand accent is a deep petrol teal — reserved for primary actions and the trajectory line itself, never used for status. The seven status colors are custom-mixed hues (steel, ochre, plum, moss, brick, stone, taupe) rather than stock Tailwind swatches, so two apps built from this system will never look identical by accident.

---

## 🎨 1. Global Style Tokens

### Color Palette (Theme Config)
Trajectory uses a custom-mixed ledger palette: a graphite-and-paper neutral scale (not stock Slate/Zinc), a single reserved petrol-teal accent, and seven hand-tinted status hues that don't correspond 1:1 to any default Tailwind swatch.

#### Base Theme Colors
| Token Name | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **`background`** | `#F7F6F3` (Paper) | `#14171A` (Graphite 950) | Main app viewport background |
| **`foreground`** | `#1B1D21` (Graphite 900) | `#EDEBE6` (Paper 100) | Primary text and high-contrast content |
| **`card`** | `#FFFFFF` | `#1B1E22` (Graphite 900) | Metric cards, lists, dialog panels |
| **`card-foreground`**| `#1B1D21` | `#EDEBE6` | Text within cards |
| **`muted`** | `#ECE9E2` (Paper 200) | `#22262B` (Graphite 800) | Secondary content blocks, dividers |
| **`muted-foreground`**| `#6B6862` (Stone 500) | `#9A968D` (Stone 300) | Helper text, secondary text, metadata labels |
| **`primary`** | `#0F6E78` (Petrol 600) | `#3FA0AA` (Petrol 400) | Call-to-actions, brand accents, the trajectory line — used sparingly, never for status |
| **`border`** | `#E2DFD6` (Paper 300) | `#2C3036` (Graphite 700) | Interactive borders, layout lines |
| **`ring`** | `#0F6E78` | `#3FA0AA` | Keyboard focus ring indicators |

#### Application Status Colors (Type-Safe Enums)
Each status enum has a corresponding semantic state token to ensure instant readability in dashboard lists, Kanban boards, and tracking badges. These are custom mixes, deliberately offset from stock Tailwind hues so the badge rail doesn't read as a default color picker:

| Enum Status | Light Mode Theme | Dark Mode Theme | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **`APPLIED`** | Text: `#3F587A` (Steel)<br>Bg: `#E7ECF2`<br>Border: `#C4CEDA` | Text: `#8FA6C4` (Steel 300)<br>Bg: `#293646/50`<br>Border: `#3F587A/60` | Standard job submission |
| **`OA`** | Text: `#8A5E14` (Ochre)<br>Bg: `#F3E9D3`<br>Border: `#E1CB9E` | Text: `#D9AE5F` (Ochre 300)<br>Bg: `#3D2F14/50`<br>Border: `#8A5E14/60` | Online Assessment pending |
| **`INTERVIEW`**| Text: `#6B4079` (Plum)<br>Bg: `#EFE5F1`<br>Border: `#D6BEDC` | Text: `#B98FC6` (Plum 300)<br>Bg: `#332538/50`<br>Border: `#6B4079/60` | Active interview stages |
| **`OFFER`** | Text: `#2F6E45` (Moss)<br>Bg: `#E4EFE7`<br>Border: `#BBD9C4` | Text: `#74B389` (Moss 300)<br>Bg: `#1C2E22/50`<br>Border: `#2F6E45/60` | Success milestone reached |
| **`REJECTED`** | Text: `#8C3A34` (Brick)<br>Bg: `#F2E3E1`<br>Border: `#DFBAB5` | Text: `#CB8580` (Brick 300)<br>Bg: `#3A2320/50`<br>Border: `#8C3A34/60` | Unsuccessful pipeline exit |
| **`GHOSTED`** | Text: `#5C5850` (Stone)<br>Bg: `#ECE9E2`<br>Border: `#D2CDC1` | Text: `#A6A196` (Stone 300)<br>Bg: `#2B2925/50`<br>Border: `#5C5850/60` | Inactive (exceeding threshold) |
| **`WITHDRAWN`**| Text: `#6E6558` (Taupe)<br>Bg: `#EFEBE3`<br>Border: `#D6CDBB` | Text: `#AB9F8A` (Taupe 300)<br>Bg: `#2E2A22/50`<br>Border: `#6E6558/60` | User cancelled application |

---

### Typography Scale
Trajectory uses three roles, not two, because the mono face is doing real signature work, not just decoration for code blocks.

*   **Font Families:**
    *   `font-display`: `"IBM Plex Sans", system-ui, sans-serif` — headings, page titles, nav labels. Set slightly condensed with tightened letter-spacing (`tracking-tight`) so it reads as an instrument label, not a marketing headline.
    *   `font-sans`: `"Public Sans", system-ui, sans-serif` — body copy, form labels, descriptions. Chosen over Inter specifically because it's less ubiquitous in AI-generated UI while remaining just as legible.
    *   `font-mono`: `"IBM Plex Mono", ui-monospace, monospace` — **every number, date, timestamp, status code, and ID.** Metric counters, table figures, timeline dates, and badge text all use tabular mono figures. This is the signature typographic move: it makes the app read like a flight log rather than a landing page, and it has the practical benefit of aligning columns of numbers.
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
Trajectory is a precision instrument, not a lifestyle app — corners stay close to square. Nothing in the system uses the 12–16px "floating card" radius that makes AI-generated dashboards look interchangeable.
*   **Small (`radius-sm`):** `2px` (`rounded-sm`) — Checkboxes, sub-status tags.
*   **Medium (`radius-md`):** `3px` (`rounded-md`) — Buttons, input fields, badges.
*   **Large (`radius-lg`):** `4px` (`rounded-lg`) — Modals, primary cards, popovers.
*   **Extra Large (`radius-xl`):** `6px` (`rounded-xl`) — Reserved for the rare large panel; never used on the sidebar or nav.

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
    *   Sidebar backdrop: **Flat, not glass.** `bg-card border-r border-border` — no `backdrop-blur`. Glassmorphic sidebars are a strong AI-generated tell; a solid panel with a hairline border reads as an actual control panel instead.
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
*   **Metric Row (4 Cards):** `col-span-12 sm:col-span-6 lg:col-span-3`. Label each card as a small-caps mono eyebrow (`font-mono text-xs uppercase tracking-wider text-muted-foreground`, e.g. `TOTAL`, `ACTIVE`, `REJECTED`, `GHOSTED`) above a large `font-mono` figure. Do not number these 01–04 — they're independent counters, not a sequence, and numbering them would be decoration without meaning.
*   **Funnel Chart:** `col-span-12 lg:col-span-8 p-6 rounded-lg border bg-card`. Render as a single traced **arc line** (Recharts `AreaChart` with one line, no bar-per-stage) plotting applications remaining at each stage — the literal "trajectory" the product is named after, not a generic multi-color bar chart. Stroke in `primary` (petrol), fill as a soft gradient of `primary` at low opacity.
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
    *   *Hover:* `bg-[#0C5A62] dark:bg-[#4CB0BA] transition-colors duration-200` (one step darker/lighter than `primary`, not a swap to a different hue family)
    *   *Focus:* `ring-2 ring-ring ring-offset-2 outline-none`
    *   *Disabled:* `opacity-50 pointer-events-none cursor-not-allowed`
    *   *Loading (Spinner state):* Inserts a Lucide `Loader2` rotating icon (`animate-spin mr-2 h-4 w-4`).
*   **Secondary Ghost Button (e.g. Cancel)**:
    *   *Idle:* `border border-border bg-transparent text-foreground hover:bg-muted`
    *   *Hover:* `bg-muted` (already token-driven — no separate Slate reference needed)

---

### Form Input Fields (`/src/components/ui/input.tsx`)
Text fields enforce data cleanliness and precise error feedback during LLM edits.

*   **Standard Inputs**:
    *   *Idle:* `w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm transition-colors`
    *   *Focus:* `outline-none ring-2 ring-ring ring-offset-0 border-primary`
    *   *Placeholder:* `text-muted-foreground`
    *   *Disabled:* `opacity-50 cursor-not-allowed bg-muted`
*   **Validation Error State**:
    *   *Classes:* `border-[#8C3A34] text-[#8C3A34] placeholder-[#8C3A34]/40 focus:ring-[#8C3A34] focus:border-[#8C3A34]` (reuses the `REJECTED` status hue — errors and rejections share a semantic register)
    *   *Error Message:* Follows the input immediately as `text-xs text-[#8C3A34] mt-1 font-mono`.

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
Used inside application detail pages to display chronological status transitions. This is where the **trajectory line** signature element lives: nodes are square ticks on a ruled line, like waypoints on a flight log, not the generic circle-and-checkmark pattern.

*   **Timeline Node (Completed):**
    *   *Indicator:* Small filled square (`bg-primary h-3 w-3 rotate-45` — a diamond tick, not a circle) with the date set in `font-mono text-xs` beside it.
    *   *Timeline Bar:* The trajectory line itself — `bg-primary w-[2px] md:h-[2px]`.
*   **Timeline Node (Active / Current State):**
    *   *Indicator:* Same diamond tick, with a subtle pulse restricted to opacity only (`animate-pulse-slow`) — no glowing ring. Glow rings read as decorative; a calm opacity pulse reads as "still in progress."
*   **Timeline Node (Pending):**
    *   *Indicator:* Empty bordered diamond (`border-2 border-muted bg-background h-3 w-3 rotate-45`).
    *   *Timeline Bar:* Faded linking line (`bg-muted w-[2px] md:h-[2px]`), dashed (`border-dashed`) to distinguish "not yet traveled" from "traveled."

---

### Status Badges (Enums Mapping)
Status labels are created using the [Shadcn UI Badge](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/README.md) schema.

Badges use `font-mono` (they're status *codes*, not prose) and pull from the `status.*` color tokens wired into `tailwind.config.js` (section 4) — never raw Tailwind palette classes. Radius is `rounded-md` (this system's small radius), not `rounded-full`: a pill shape is the single most common "AI badge" tell, a slightly-rounded rectangle reads as a data tag instead.

```tsx
import { cva, type VariantProps } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        APPLIED: "bg-status-applied-bg text-status-applied-text border-status-applied-border",
        OA: "bg-status-oa-bg text-status-oa-text border-status-oa-border",
        INTERVIEW: "bg-status-interview-bg text-status-interview-text border-status-interview-border",
        OFFER: "bg-status-offer-bg text-status-offer-text border-status-offer-border",
        REJECTED: "bg-status-rejected-bg text-status-rejected-text border-status-rejected-border",
        GHOSTED: "bg-status-ghosted-bg text-status-ghosted-text border-status-ghosted-border",
        WITHDRAWN: "bg-status-withdrawn-bg text-status-withdrawn-text border-status-withdrawn-border",
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
        // Flat keys with hyphens (status-applied-bg, etc.) so `bg-status-applied-bg`
        // resolves correctly — Tailwind won't reach three levels deep into a nested object.
        "status-applied-bg": { DEFAULT: "#E7ECF2", dark: "#293646" },
        "status-applied-text": { DEFAULT: "#3F587A", dark: "#8FA6C4" },
        "status-applied-border": { DEFAULT: "#C4CEDA", dark: "#3F587A" },
        "status-oa-bg": { DEFAULT: "#F3E9D3", dark: "#3D2F14" },
        "status-oa-text": { DEFAULT: "#8A5E14", dark: "#D9AE5F" },
        "status-oa-border": { DEFAULT: "#E1CB9E", dark: "#8A5E14" },
        "status-interview-bg": { DEFAULT: "#EFE5F1", dark: "#332538" },
        "status-interview-text": { DEFAULT: "#6B4079", dark: "#B98FC6" },
        "status-interview-border": { DEFAULT: "#D6BEDC", dark: "#6B4079" },
        "status-offer-bg": { DEFAULT: "#E4EFE7", dark: "#1C2E22" },
        "status-offer-text": { DEFAULT: "#2F6E45", dark: "#74B389" },
        "status-offer-border": { DEFAULT: "#BBD9C4", dark: "#2F6E45" },
        "status-rejected-bg": { DEFAULT: "#F2E3E1", dark: "#3A2320" },
        "status-rejected-text": { DEFAULT: "#8C3A34", dark: "#CB8580" },
        "status-rejected-border": { DEFAULT: "#DFBAB5", dark: "#8C3A34" },
        "status-ghosted-bg": { DEFAULT: "#ECE9E2", dark: "#2B2925" },
        "status-ghosted-text": { DEFAULT: "#5C5850", dark: "#A6A196" },
        "status-ghosted-border": { DEFAULT: "#D2CDC1", dark: "#5C5850" },
        "status-withdrawn-bg": { DEFAULT: "#EFEBE3", dark: "#2E2A22" },
        "status-withdrawn-text": { DEFAULT: "#6E6558", dark: "#AB9F8A" },
        "status-withdrawn-border": { DEFAULT: "#D6CDBB", dark: "#6E6558" },
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
        mono: ["var(--font-mono)", ...fontFamily.mono],
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