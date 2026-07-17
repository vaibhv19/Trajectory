# DESIGN.md — Trajectory Visual Design System

## Design Philosophy

Trajectory is not a dashboard template.

Trajectory is a personal operating system for managing a job search.

Every design decision must improve one of these:

- clarity
- speed
- focus
- confidence

The interface should disappear behind the workflow.

Users should remember how productive they felt—not what color the buttons were.

If a visual treatment exists only because it looks modern, remove it.

When making design decisions, always prioritize:

1. Workflow
2. Readability
3. Information hierarchy
4. Consistency
5. Delight

Never reverse this order.

Trajectory should feel like software someone actively uses for several hours each week—not software designed only to look impressive in screenshots.

Keywords:

- calm
- precise
- structured
- technical
- focused
- dense
- intentional

Never design toward:

- flashy
- playful
- futuristic
- glassy
- colorful
- experimental
- decorative

**Status:** Governing document. Any UI change — new screen, new component, or agent-generated code — must be checked against this file before merge. If a component contradicts a rule here, the rule wins, not the component.

**Why this file exists:** The current UI (v1) works functionally but reads as generic AI-generated dashboard. Diagnosis, weighted:

| Cause | Weight |
|---|---|
| Weak visual hierarchy | 45% |
| Generic spacing/layout | 25% |
| No distinctive design language | 15% |
| Lack of microinteractions | 10% |
| Missing animation | 5% |

Every section below is ordered and weighted to match — fix hierarchy and layout first; they are not optional polish, they're the majority of the problem.

---

## 0. Non-Negotiable Ban List

The agent must not reach for these defaults, regardless of what a component library suggests:

- ❌ Uniform card grids where every card has identical size, border, icon placement, and visual weight.
- ❌ Icon anchored top-right of every stat card (the shadcn stat-card default). If used at all, vary placement/size by importance or drop it on secondary cards.
- ❌ Centered-icon + bold-title + gray-subtext empty states (the Vercel/shadcn empty-state cliché).
- ❌ Decorative ambient gradient glows that don't correspond to any content or state.
- ❌ Uniform spacing (e.g. 24px gap everywhere) regardless of content relatedness.
- ❌ Accent color applied decoratively/randomly rather than doing a specific job.
- ❌ Flat, un-filled progress bars representing 0% with no alternate empty treatment.

---

## 0.1 Product References

Trajectory should take inspiration from real software rather than dashboard templates.

Primary references:

- Linear
- Attio
- Raycast
- Vercel Dashboard

Secondary references:

- Stripe Dashboard
- Ashby
- GitHub Issues
- Notion (information hierarchy only)

Do NOT copy layouts directly.

Study these products for:

- spacing
- typography
- density
- hierarchy
- interaction
- navigation
- keyboard-first workflows

Avoid inspiration from:

- Dribbble concept dashboards
- Glassmorphism showcases
- Generic admin templates
- Bootstrap dashboards
- Default shadcn examples

---

## 1. Visual Hierarchy (45% — highest priority)

Every screen must resolve to a clear reading order in under 2 seconds. Concretely:

### 1.1 The 1-2-Many Rule
No screen may present more than 2 stat cards at equal visual weight. Structure every metrics screen as:

- **1 Primary metric** — the single number the user most needs right now.
- **2 Secondary metrics** — supporting context.
- **Everything else** — demoted to a compact row, table, or inline list. Not separate equal-weight cards.

**Applied to the Dashboard:**
- Primary: `Active` (what the user needs to act on) — largest card, filled background (`--surface-raised`), petrol-teal left border accent, number at the top of the type scale.
- Secondary: `Total` and `Response Rate` — medium cards, outline only, no fill.
- Demoted to a single compact stat strip (not cards): `Rejected`, `Ghosted`, `Interview Conversion`, `Offer Conversion`. Rendered as a thin horizontal row of label:value pairs, muted text, no borders, no icons.

### 1.2 Type Scale Tied to Importance
Numbers are not all the same size just because they're all numbers. Use a fixed scale:

| Role | Font size | Weight | Color |
|---|---|---|---|
| Primary metric value | 56px | 700 | `--text-primary` or `--accent-teal` |
| Secondary metric value | 32px | 600 | `--text-primary` |
| Tertiary/stat-strip value | 20px | 500 | `--text-secondary` |
| Section headers | 14px, uppercase, tracked | 600 | `--text-tertiary` |

A "0" representing the primary metric and a "0" representing a tertiary metric must never render at the same size.

### 1.3 Section Weight Reflects Data Density
Never split a data-rich section (chart) and an empty-state section (agenda with 0 tasks) into an even 50/50 layout. Rule: the section with more information gets more space. Default dashboard split: **65% funnel chart / 35% agenda**, not 50/50. If the agenda has items, it can grow up to 45%; it never exceeds the chart's width.

### 1.4 One Focal Point Per Screen
Every screen has exactly one element designed to be looked at first — via size, color, or position, never all three at once (that reads as "the AI tried too hard"). Pick one lever per screen.

---

## 2. Layout & Spacing (25%)

### 2.1 Spacing Scale
Use only these values, no arbitrary pixel spacing: `4, 8, 12, 16, 24, 32, 48, 64`.

### 2.2 Relatedness Determines Spacing
- Elements within the same logical group (e.g. a stat label and its value): `4–8px`.
- Cards within the same row: `16px`.
- Between distinct sections (e.g. stat row → chart section): `48px` minimum, not the same `16–24px` used inside a card.

Generic layouts use one spacing value everywhere. Distinctive layouts compress related things and give real air between unrelated things.

### 2.3 Break the Grid on Purpose
At least one element per screen must violate the implicit grid — e.g. the primary metric card spans 2 grid columns while secondary cards span 1. A perfectly even 4-column, 4-card row is the single most recognizable "default AI dashboard" signature. Never ship one un-broken.

### 2.4 Column Count Is Derived, Not Assumed
Don't default to "N metrics = N equal columns." Decide column span per metric based on section 1's hierarchy, not on how many stats happen to exist.

## 2.5 Information Density

Trajectory is a productivity tool.

It should display the maximum useful information without becoming visually noisy.

Prefer:

- compact controls
- shorter cards
- denser tables
- multiple related items on screen

Avoid:

- oversized cards
- excessive empty space
- large decorative headers
- unnecessary padding

Whitespace should separate concepts—not simply fill the screen.

Every scroll should reveal new information, not more empty space.

---

## 3. Design Language (15%)

### 3.1 Palette — Functional, Not Decorative
Base palette: **Graphite** (neutrals) + **Petrol Teal** (single accent) + IBM Plex (type).

| Token | Hex (reference) | Usage — and ONLY this usage |
|---|---|---|
| `--surface-base` | `#0B0F12` (dark) / `#F4F5F6` (light) | App background |
| `--surface-raised` | `#12181C` (dark) / `#FFFFFF` (light) | Cards, panels |
| `--border-subtle` | `#1E262B` (dark) / `#E2E5E7` (light) | Default card borders, 1px, never >1px |
| `--text-primary` | `#EDEFF0` (dark) / `#14181A` (light) | Headlines, primary values |
| `--text-secondary` | `#9AA5AA` (dark) / `#5B6469` (light) | Labels, supporting text |
| `--text-tertiary` | `#5B6469` (dark) / `#8A9297` (light) | Section headers, metadata |
| `--accent-teal` | `#1F9E93` | **Reserved exclusively for: (a) the single primary metric on a screen, (b) interactive/clickable elements (links, active nav, primary buttons), (c) positive-direction data (e.g. rising response rate).** Never used for decoration, never used on more than one card per screen unless it's interactive. |
| `--status-*` | see §3.3 | Status-only, never reused for anything else |

**Rule:** If teal appears more than twice on one screen and neither use is the primary metric nor an interactive element, that's a violation — pull it back.

### 3.2 Typography
- **IBM Plex Sans** — UI text, labels, body.
- **IBM Plex Mono** — all numeric values (stat numbers, dates, version numbers like `v1`/`v2`, timestamps). This is a signature detail: numbers in monospace is what makes this feel like "Trajectory" rather than "generic dashboard #4,281." Apply it everywhere a number appears, no exceptions.
- Section headers: uppercase, `letter-spacing: 0.05em`, IBM Plex Sans Medium — this is already working in v1, keep it, it's one of the few things reading as intentional.

### 3.3 Status Color Mapping (from PRD/schema ENUMs)
Status colors must be consistent site-wide and never reused for anything else (no reusing "rejected red" for an unrelated error state).

| Status | Color | Notes |
|---|---|---|
| `APPLIED` | Graphite/neutral | Default, no color needed |
| `OA` | Amber `#C9922B` | |
| `INTERVIEW` | Petrol teal `#1F9E93` (allowed exception — represents active momentum) | |
| `OFFER` | Green `#3DA35D` | |
| `REJECTED` | Muted red `#B54B4B` | Desaturated — this is a data point, not an error alert |
| `GHOSTED` | Violet-gray `#6E6A85` | Deliberately "faded," reinforces the concept |
| `WITHDRAWN` | `--text-tertiary` | Fully neutral |
| Outreach: `CONTACTED` | Graphite | |
| Outreach: `REPLIED` | Amber | |
| Outreach: `INTERVIEW_SECURED` | Teal | |
| Outreach: `NO_RESPONSE` | Violet-gray | |

Status color appears as: a small left-border strip on rows/cards (2px), and in the corresponding filter chip. Never as full-card background fill — that's loud and generic.

### 3.4 Signature Details (repeat these everywhere, they build recognition)
- All card corner radii: exactly `4px`. Not `8px`, not `12px`, not `0`. Pick one and never vary it — variation reads as unintentional.
- All card borders: `1px solid var(--border-subtle)`. No shadows on flat cards. Reserve shadow/elevation exclusively for the primary metric card and modals.
- Numeric values: IBM Plex Mono (§3.2), always.
- Section headers: uppercase + tracked (§3.2).

## 3.5 Component Personality

Every component should have a consistent personality.

Buttons

- confident
- restrained
- functional
- never flashy

Cards

- architectural
- structured
- quiet
- never floating unnecessarily

Inputs

- disappear into workflow
- minimal chrome
- obvious focus state

Tables

- optimized for scanning
- information first
- decoration second

Charts

- communicate trends
- never decorate
- minimal color usage

Navigation

- always predictable
- always stable
- never surprising

Empty states

- informative
- compact
- action-oriented

Never humorous.
Never oversized.

---

## 4. Microinteractions (10%)

- **Card hover (data cards, table rows):** border transitions from `--border-subtle` to `--accent-teal` at 40% opacity, 150ms ease. No shadow-pop, no scale transform — those read as generic "SaaS marketing site" hovers, not "productivity tool."
- **Filter chips (status filters on Applications page):** active state = filled `--accent-teal` background + `--surface-base` text. Inactive = outline only. Transition 100ms.
- **Buttons:** primary button (`Add Application`) darkens 8% on press, not just hover — press feedback matters more than hover feedback for a tool used daily.
- **Table/list rows:** clicking anywhere in the row navigates, with a 100ms background flash on click before navigation, so the click feels registered.

## 4.1 Motion Philosophy

Motion should explain.

Never decorate.

Every animation must communicate one of:

- state change
- navigation
- confirmation
- loading
- hierarchy

If removing an animation does not reduce usability, remove the animation.

Motion should feel fast and intentional.

Never bouncy.

Never exaggerated.

Never "look at me."

Prefer subtle opacity, position, and color transitions over scaling, spinning, or elastic motion.

## 5. Animation (5%, lowest priority — only if time remains)

- Funnel chart bars animate in from 0 height on first load only (not on every re-render), 400ms ease-out, staggered 40ms per bar.
- Stat numbers count up from 0 on first dashboard load only. Do not repeat this on every fetch/refetch — that becomes noisy, not delightful.
- No generic fade-in-on-mount for static content. Animation must attach to something meaningful (a number changing, data arriving) or skip it.

---

## 6. Empty States (replaces the banned pattern in §0)

Instead of centered icon + bold title + subtext:
- **Applications list (no results):** left-aligned within the existing table header area — small icon inline with text, one line: `No applications match these filters.` Plus a text-only "Clear filters" action. No illustration, no vertical centering in a large empty box.
- **Today's Agenda (no items):** keep it compact — a single muted line inside the existing widget bounds, not a full illustrated placeholder taking the same visual weight as a populated agenda would. The empty widget should visibly take *less* space than a full one, not the same footprint with a hollow message inside it.

---

## 7. Component-Specific Rules

### 7.1 Dashboard
- Layout order top to bottom: primary+secondary stat row → funnel chart (65%) / agenda (35%) → resume performance comparison → source/profile distribution.
- Resume performance chart (comparing response rate by version — PRD §3.1): bar or line chart, IBM Plex Mono for axis labels, version labels use monospace (`v1`, `v2`).

### 7.2 Applications Table/List
- Status shown via the 2px left-border strip (§3.3), not a colored badge pill — pills-everywhere is another generic-template tell.
- Career profile shown as a small colored dot + label (profiles have user-assigned colors per PRD §3.3) — dot, not a badge.
- Sortable column headers: underline-on-hover only, sort arrow appears only on the active sort column, IBM Plex Mono for the arrow glyph.

### 7.3 Career Profile Color Coding
Each user-defined profile gets one color from a fixed 8-color set (not arbitrary hex the user free-picks — constrained choice keeps the palette coherent):
`#1F9E93 (teal), #C9922B (amber), #3DA35D (green), #4B7FB5 (blue), #A5588C (mauve), #8A6FB0 (violet), #B5804B (clay), #5B8C8C (slate-teal)`

### 7.4 Resume Version Badges
Version numbers (`v1`, `v2`, `v3`) render in IBM Plex Mono inside a small `4px`-radius outline chip — never a filled pill.

## Screen Rhythm

Every screen should naturally follow this reading order:

Page Title

↓

Primary Action

↓

Primary Content

↓

Supporting Content

↓

Analytics

↓

Metadata

Never place analytics before actionable information.

---

## Trajectory DNA

Trajectory is NOT:

- a Bootstrap dashboard
- a generic admin template
- a marketing website
- a Dribbble concept
- a glassmorphism showcase
- an AI-generated CRUD application

Trajectory IS:

- a professional productivity application
- a workflow-first tool
- an operating system for job searching
- software designed for daily use
- information-dense without feeling cluttered
- calm and focused

Every screen should answer one question:

"What is the next best action the user should take?"

If a design decision does not improve that answer, reconsider it.

## 8. Implementation Notes (Tailwind / Shadcn mapping)

Since the stack is Tailwind + shadcn/Radix (Tech_Stack.md), encode these rules as **design tokens in `tailwind.config`**, not ad hoc classes, so the coding agent inherits constraints structurally rather than needing to remember prose rules on every file:

```js
// tailwind.config extension (example shape, not final values)
theme: {
  extend: {
    colors: {
      surface: { base: 'var(--surface-base)', raised: 'var(--surface-raised)' },
      accent: { teal: '#1F9E93' },
      status: {
        oa: '#C9922B', interview: '#1F9E93', offer: '#3DA35D',
        rejected: '#B54B4B', ghosted: '#6E6A85', withdrawn: 'var(--text-tertiary)'
      }
    },
    borderRadius: { card: '4px' }, // single radius token, enforce everywhere
    fontFamily: {
      sans: ['IBM Plex Sans', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    }
  }
}
```

Shadcn components (`Card`, `Badge`, etc.) should be restyled via these tokens rather than used with default Tailwind/shadcn styling out of the box — default shadcn styling is precisely what makes v1 recognizable as templated.

---

## 9. Pre-Merge Checklist

Before accepting any AI-agent-generated screen, verify:

- [ ] Is there exactly one primary metric, visually distinct from everything else on screen?
- [ ] Does teal appear only on the primary metric and/or interactive elements?
- [ ] Are all numeric values in IBM Plex Mono?
- [ ] Is spacing varied by relatedness, not uniform?
- [ ] Does at least one element break the even grid?
- [ ] Are corner radii consistently `4px`?
- [ ] Does any empty state use the banned centered-icon-title-subtext pattern? (If yes, reject.)
- [ ] Do status colors match §3.3 exactly, with no reuse elsewhere?