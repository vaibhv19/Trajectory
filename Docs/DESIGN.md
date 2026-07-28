# Visual Design System: Trajectory (v1.0.1)

This document defines the visual design system, styling guidelines, and component design patterns for **Trajectory**. All frontend components (`frontend/src/components`), pages (`frontend/src/pages`), and Tailwind configurations (`tailwind.config.js`) must strictly conform to these rules to maintain visual consistency.

---

## 1. Design Philosophy

Trajectory is a high-performance career operating system. The visual design focuses on layout clarity, information density, and interactive speed to optimize the job search workflow.

### 1.1 Aesthetic Tone Keywords
`calm` • `precise` • `structured` • `technical` • `focused` • `dense` • `intentional`

### 1.2 Design Decision Hierarchy
1.  **Workflow Efficiency:** The layout should help users perform actions with minimal clicks.
2.  **Readability:** High contrast typography with structured spacing.
3.  **Information Hierarchy:** Focus visual weight on primary content.
4.  **Consistency:** Standardize spacing, alignment, and styling patterns across all modules.
5.  **Micro-Interactions:** Subtle hover effects and transition states.

---

## 2. Non-Negotiable Visual Rules

To maintain a clean visual interface, the UI avoids generic dashboard conventions:

*   ❌ **No Uniform Grid Layouts:** Avoid side-by-side metric cards that have identical dimensions, borders, and visual weight.
*   ❌ **No Repetitive Top-Right Icons:** Stat cards do not use placeholder icons in the top-right corner.
*   ❌ **No Centered Empty-State Illustrations:** Avoid centered illustrations with gray subtext. Empty states should display clear tables with inline options to add data.
*   ❌ **No Ambient Glows or Random Gradients:** Visual elements must correspond to application state or context.
*   ❌ **No Arbitrary Layout Gaps:** Use defined vertical margins to group related information.
*   ❌ **No Flat 0% Progress Bars:** If a rate is at zero, display an alternate state or label rather than an empty progress bar.

---

## 3. Visual Hierarchy & Status Color Mapping

### 3.1 Status Badge Mappings
Application status badges use high-contrast text and low-opacity background fills to improve scannability in dense tables:

| Application Status | Hex Code | CSS / Tailwind Classes | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **`APPLIED`** | `#3b82f6` | `text-blue-400 bg-blue-500/10 border-blue-500/30` | Application submitted; awaiting feedback |
| **`OA`** | `#8b5cf6` | `text-purple-400 bg-purple-500/10 border-purple-500/30` | Online Assessment scheduled |
| **`INTERVIEW`** | `#f59e0b` | `text-amber-400 bg-amber-500/10 border-amber-500/30` | Interview rounds in progress |
| **`OFFER`** | `#10b981` | `text-emerald-400 bg-emerald-500/10 border-emerald-500/30` | Formal offer letter received |
| **`REJECTED`** | `#ef4444` | `text-red-400 bg-red-500/10 border-red-500/30` | Application rejected by company |
| **`GHOSTED`** | `#6b7280` | `text-gray-400 bg-gray-500/10 border-gray-500/30` | Flagged inactive by background cron |
| **`WITHDRAWN`** | `#9ca3af` | `text-gray-300 bg-gray-400/10 border-gray-400/30` | Application manually canceled by user |

### 3.2 Outreach Status Mappings
Outreach status indicators track interaction progress:

| Outreach Status | Hex Code | CSS / Tailwind Classes | CRM Context |
| :--- | :--- | :--- | :--- |
| **`PENDING`** | `#6b7280` | `text-gray-400 bg-gray-500/10 border-gray-500/20` | Logged outreach draft |
| **`CONTACTED`** | `#3b82f6` | `text-blue-400 bg-blue-500/10 border-blue-500/20` | Outbound message sent |
| **`REPLIED`** | `#8b5cf6` | `text-purple-400 bg-purple-500/10 border-purple-500/20` | Recruiter response received |
| **`INTERVIEW_SECURED`**| `#10b981`| `text-emerald-400 bg-emerald-500/10 border-emerald-500/20` | Converted to active interview |
| **`NO_RESPONSE`** | `#ef4444` | `text-red-400 bg-red-500/10 border-red-500/20` | Outreach ignored / follow-up closed |

---

## 4. Spacing System & Layout Density

The spacing system relies on fixed tailwind rem structures to maintain consistent layouts.

```
+-------------------------------------------------------------+
| Container Layout: px-6 py-8                                 |
|   +-------------------------------------------------------+ |
|   | Section Headers: mb-6                                 | |
|   +-------------------------------------------------------+ |
|   | Component Card: p-6                                   | |
|   |   +-------------------------------------------------+ | |
|   |   | Card Header: mb-4                               | | |
|   |   +-------------------------------------------------+ | |
|   |   | Form Element: space-y-4                         | | |
|   |   +-------------------------------------------------+ | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### 4.1 Layout Modes
*   **Compact Mode (Tables):** Applied in [ApplicationsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationsPage.tsx). Uses table paddings of `py-2 px-3` and small fonts (`text-xs`) to display multiple applications on screen without vertical overflow.
*   **Card-Based Grids:** Applied on [OutreachPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/OutreachPage.tsx). Individual recruiter contacts use border divisions (`border-border/40`) with left status indicator lines (`border-l-4`).
*   **Structured Details Sidebar:** Applied in [ApplicationDetailsPage.tsx](file:///d:/Coding/Projects----For%20Resume/Trajectory/frontend/src/pages/ApplicationDetailsPage.tsx). Dividers (`divide-y divide-border/20`) separate audit lists, resume versions, and note files.

### 4.2 Typography Configurations
*   **Primary Copy:** Inter or system default sans-serif font families (`font-sans`) for titles, labels, forms, and descriptions.
*   **Metrics & System Codes:** Fixed-width monospaced font families (`font-mono`) for dates, salary figures, counters, IDs, and statuses.

---

## 5. Component Design Rules

### 5.1 Interactive Data Tables
*   Include a 4px status-colored border strip along the left edge of each application row.
*   Display resume versions as outline tags (e.g., `v1`, `v2`).
*   Use subtle highlight animations on row hover.
*   Row deletion actions require confirmation prompts to prevent accidental removal.

### 5.2 Modal Windows
*   Use a high-contrast backdrop overlay with a subtle blur effect (`backdrop-blur-sm`).
*   Right-align form submission buttons and display loading spinners during request executions.
*   Group inputs in a single column using consistent spacing.

### 5.3 Timeline Auditing
*   Represent audit status milestones as a vertical timeline.
*   Use pulsing indicator rings to highlight the current active stage.
*   Calculate and display stage duration times using small monospaced fonts (`text-xs font-mono`).

---

## Related Documentation
*   [**Documentation Index (Docs/INDEX.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/INDEX.md)
*   [**Product Requirements Document (Docs/PRD.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/PRD.md)
*   [**Feature List (Docs/FEATURE_LIST.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/FEATURE_LIST.md)
*   [**System Architecture (Docs/SYSTEM_ARCHITECTURE.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/SYSTEM_ARCHITECTURE.md)
*   [**Application Flow (Docs/App Flow.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/App%20Flow.md)
*   [**Tech Stack Specification (Docs/Tech Stack.md)**](file:///d:/Coding/Projects----For%20Resume/Trajectory/Docs/Tech%20Stack.md)