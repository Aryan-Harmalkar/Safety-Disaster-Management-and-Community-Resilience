# CleanConnect — UI Flow & User Journeys

---

## 1. Page Map

```
Landing / Login
      │
      ▼
Home / Map ──────────────────────────────────────────┐
      │                                              │
  ┌───┼──────────────────┐                          │
  ▼   ▼                  ▼                          │
File a   Waste       Dashboard ───────────────────┐  │
Complaint Classifier     │                         │  │
  │         │        Leaderboard                   │  │
  ▼         ▼            │                         │  │
Status   Facility    Reports                       │  │
Result   Result           │                        │  │
             │        Hall of Fame                 │  │
             ▼                                     │  │
        Request Pickup ◄──────────────────────────┘  │
             │                                        │
             ▼                                        │
        Pickup Tracking ──────────────────────────────┘
```

---

## 2. Primary User Journey (Demo Path)

This is the **primary end-to-end demonstration flow** — complete it in ≤ 3 minutes.

```
1. Login
   └── Enter name, phone, location → profile saved (localStorage)

2. Home / Map
   └── Goa-centered Leaflet map
       ├── Enable live GPS  OR  drop manual pin
       └── View mock markers (teams, facilities, complaints)

3. Classify Waste
   └── Upload a waste photo (browser only, no upload)
       ├── Mock classification runs (filename/rule-based)
       ├── Category result displayed with icon
       ├── Nearest facility shown on map
       └── +15 points awarded

4. Request Pickup
   └── Confirm category and location
       ├── Nearest available mock team found (Haversine)
       ├── Status: Requested → Assigned → En Route → Collected
       └── +20 points for e-waste (mock)

5. View Updated Points
   └── Points counter updates in real time

6. Dashboard
   └── Stats, tier, progress bar, ward rank

7. Leaderboard
   ├── Individual ranking
   └── Ward-wise ranking

8. Reports
   └── Weekly / Monthly / Yearly charts
```

---

## 3. Secondary Flows

### File a Complaint

```
Home / Map
  └── "File Complaint" action
        ├── Set location (live GPS or manual)
        ├── Enter description
        ├── Attach photo / video (local preview only)
        └── Submit → status: Reported (+10 pts)
              └── Simulate progress → Assigned → Resolved (+25 pts)
```

### Hall of Fame

```
Dashboard / Leaderboard
  └── "Hall of Fame" section
        └── Annual top 3 (mock past winners, mock prizes)
```

---

## 4. Page Responsibilities

| Page | Primary purpose |
|---|---|
| `LoginPage` | Mock profile capture; localStorage save |
| `MapPage` | Leaflet map + live/manual location; navigation hub |
| `ClassifierPage` | Image upload → mock classification → facility result |
| `PickupPage` | Category selection → team assignment → status tracking |
| `ComplaintPage` | Location + description + photo/video → local complaint record |
| `DashboardPage` | Stats, gamification, tier, ward rank |
| `LeaderboardPage` | Individual + ward rankings |
| `ReportsPage` | Weekly/monthly/yearly charts |
| `HallOfFamePage` | Annual top 3 (mock) |

---

## 5. Navigation Structure

```
<AppLayout>
  <SkipLink href="#main" />             ← first focusable element
  <header>
    <Navbar>                            ← logo + primary nav links
  </header>
  <main id="main" tabIndex={-1}>       ← skip link target
    <Outlet />                          ← current page
  </main>
  <footer>
    ...
  </footer>
</AppLayout>
```

---

## 6. Accessibility Requirements

> These requirements are derived from the project's frontend skill guidance (SKILL-website.md).
> They are part of the **frontend definition of done**.

### 6.1 Page Structure

- Every page uses semantic `<header>`, `<main>`, `<footer>`
- Exactly **one** `<main>` element per screen
- All form inputs have associated `<label>` elements (not placeholder-only)
- Icon-only buttons have accessible names (`aria-label` or visually hidden text)

### 6.2 Skip Navigation

```html
<a href="#main" class="skip-link">Skip to main content</a>
```

- First focusable element on every page
- Visually hidden until focused (CSS clip trick; never `display:none`)
- Target `<main id="main" tabIndex={-1} />`
- Keyboard focus moves to `<main>` on activation (browser default with `tabindex="-1"`)

### 6.3 Dynamic Content — `aria-live`

Use live regions for any content that updates without a page navigation:

| Content | Region type |
|---|---|
| Classification result | `aria-live="polite"` |
| Complaint submission confirmation | `aria-live="polite"` |
| Pickup status changes | `aria-live="polite"` |
| Loading states (spinner visible) | `aria-live="polite"` + `aria-busy="true"` |
| Error messages | `role="alert"` (implicit `aria-live="assertive"`) |
| Live counter updates | `aria-live="polite"` |

Do not use `aria-live="assertive"` except for urgent errors.

### 6.4 Theme / Dark Mode

- Respect OS preference: `@media (prefers-color-scheme: dark)`
- Allow explicit user toggle stored in `localStorage` key `cleanconnect_theme`
- Use `data-theme="light|dark"` attribute on `<html>` to switch themes
- Implement all custom colours as CSS variables:
  ```css
  :root[data-theme="light"] { --color-bg: #f5f5f5; --color-text: #1a1a1a; … }
  :root[data-theme="dark"]  { --color-bg: #1e1e1e; --color-text: #e5e5e5; … }
  ```
- Avoid pure `#000000` / `#ffffff`; use near-black / near-white for comfortable reading

### 6.5 Keyboard Navigation

- All interactive elements (buttons, links, inputs, map controls) reachable by Tab
- Visible focus indicator on every focusable element — do not suppress `:focus-visible`
- Logical tab order that follows visual reading order
- No keyboard traps; modal dialogs return focus to trigger on close

### 6.6 Responsive Design

| Viewport | Requirement |
|---|---|
| 360 px | Fully functional; single-column layout |
| 1280 px | Full desktop layout |
| Both | No horizontal body scrollbar |
| 200% zoom | Content readable; no overlapping elements |

- Mobile layout must remain usable (tap targets ≥ 44 × 44 px)
- Leaflet map must be keyboard-navigable (built-in; verify not broken)

### 6.7 Interaction Principles

- No hover-only functionality (touch users cannot hover)
- Every action provides **visible feedback** (success/error state; status update)
- Prevent errors where possible (disable submit until required fields are filled)
- Prefer **recognition over recall** (show options; do not require users to remember)
- Minimise unnecessary typing (autocomplete, toggles, dropdowns where practical)
- Keep primary call-to-action visually prominent on each screen

### 6.8 Animation

- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
- Live counter animation is optional but must honour the above

---

## 7. State Transitions (UI)

### Complaint status

```
[Reported]  →  [Assigned]  →  [Resolved]
  (red)          (amber)         (green)
```

### Pickup status

```
[Requested]  →  [Assigned]  →  [En Route]  →  [Collected]
   (grey)          (blue)         (amber)         (green)
```

---

## 8. Loading & Error States

Every async or simulated operation shows:

1. **Loading state** — spinner or skeleton; `aria-busy="true"` on container
2. **Success state** — result + visible confirmation; `aria-live="polite"`
3. **Error state** — friendly message + retry; `role="alert"`

---

## 9. Mock vs Real — Clarity

The UI must make it visually clear when content is mock:

| Context | UI treatment |
|---|---|
| AI classification result | Badge: "Mock classification" |
| Collection team assignment | Note: "Simulated team assignment" |
| Reward tiers | Note: "Demo rewards — not guaranteed" |
| Map markers | Marker legend notes data is illustrative |
| Hall of Fame prizes | Footnote: "Demo prize values" |
