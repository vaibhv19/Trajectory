# DESIGN.md — Trajectory Visual Design System

This document is the governing visual design system specification for **Trajectory** (Career Operating System). All frontend components (`frontend/src/components`), pages (`frontend/src/pages`), and Tailwind CSS classes (`tailwind.config.js`) must strictly conform to the design tokens, visual hierarchy rules, and component constraints defined here.

For a complete overview of all documentation, refer to the [Documentation Index (Docs/INDEX.md)](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md).

---

## Design Philosophy

Trajectory is not a dashboard template. Trajectory is a personal operating system for managing a job search.

Every design decision must improve one of these:
- **Clarity**
- **Speed**
- **Focus**
- **Confidence**

The interface should disappear behind the workflow. Users should remember how productive they felt—not what color the buttons were.

If a visual treatment exists only because it looks modern, remove it.

### Decision Priority Order:
1. Workflow
2. Readability
3. Information hierarchy
4. Consistency
5. Delight

*Never reverse this order.*

Keywords defining the UI tone:
`calm` • `precise` • `structured` • `technical` • `focused` • `dense` • `intentional`

Never design toward:
`flashy` • `playful` • `futuristic` • `glassy` • `colorful` • `experimental` • `decorative`

---

## 0. Non-Negotiable Ban List

The interface must **never** utilize these generic design tropes:

- ❌ Uniform card grids where every card has identical size, border, icon placement, and visual weight.
- ❌ Icon anchored top-right of every stat card (the default stat-card cliché).
- ❌ Centered-icon + bold-title + gray-subtext empty states.
- ❌ Decorative ambient gradient glows that don't correspond to any content or state.
- ❌ Uniform spacing (e.g., 24px gap everywhere) regardless of content relatedness.
- ❌ Accent color applied decoratively or randomly rather than performing a specific UX job.
- ❌ Flat, un-filled progress bars representing 0% with no alternate empty treatment.

---

## 0.1 Product Design References

Trajectory draws visual inspiration from production-grade professional software:

- **Primary References:** Linear, Attio, Raycast, Vercel Dashboard
- **Secondary References:** Stripe Dashboard, Ashby, GitHub Issues, Notion

---

## 1. Visual Hierarchy & Status Color Mapping

### Status Colors & Indicators

| Application Status | Hex Color Code | UI Badge / Border Styling | Semantic Context |
| :--- | :--- | :--- | :--- |
| **`APPLIED`** | `#3b82f6` (Blue 500) | `border-l-blue-500 bg-blue-500/10 text-blue-400` | Application submitted; awaiting response |
| **`OA`** | `#8b5cf6` (Purple 500)| `border-l-purple-500 bg-purple-500/10 text-purple-400`| Online Assessment invite received |
| **`INTERVIEW`** | `#f59e0b` (Amber 500) | `border-l-amber-500 bg-amber-500/10 text-amber-400` | Active interview rounds scheduled |
| **`OFFER`** | `#10b981` (Emerald 500)| `border-l-emerald-500 bg-emerald-500/10 text-emerald-400`| Formal offer extended |
| **`REJECTED`** | `#ef4444` (Red 500) | `border-l-red-500 bg-red-500/10 text-red-400` | Application rejected |
| **`GHOSTED`** | `#6b7280` (Gray 500) | `border-l-gray-500 bg-gray-500/10 text-gray-400` | Flagged inactive by automated daemon |
| **`WITHDRAWN`** | `#9ca3af` (Gray 400) | `border-l-gray-400 bg-gray-400/10 text-gray-300` | Application manually withdrawn by user |

---

## 2. Layout Density & Spacing System

- **Compact Mode:** Default view for high-density tables (`ApplicationsPage.tsx`). Padding is `py-2 px-4`, text is `text-xs font-mono`, reducing vertical scrolling.
- **Card Density:** Cards on `OutreachPage.tsx` and `DashboardPage.tsx` use precise borders (`border-border/40`) with subtle left status strips (`border-l-4`).
- **Typography:** Uses Inter / System sans-serif for UI labels and mono font (`font-mono`) for dates, salary figures, numbers, IDs, and status codes.

---

## 3. Component Design Rules

### 3.1 Data Tables (`ApplicationsPage.tsx`)
- Status border indicator strip on the left edge of each row.
- Outline version tags (`v1`, `v2`) for associated resumes.
- Inline empty states when search returns zero records.

### 3.2 Modal Dialogs (`AddApplicationModal.tsx`, `AIImportModal.tsx`)
- High-contrast dialog overlay with `backdrop-blur-sm`.
- Step-by-step form progression for AI extractions.
- Primary actions right-aligned with standard loading spinners during API calls.

---

## Related Documentation

- [**Documentation Index (Docs/INDEX.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
- [**Frontend Developer Guide (frontend/README.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/frontend/README.md)
- [**Product Requirements Document (Docs/PRD.md)**](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md)