# CleanConnect — Tasks

**Project:** CleanConnect — Waste Management & Citizen Engagement Platform, Goa
**Mode:** Local-only, client-side prototype
**Branch:** `feat/frontend` (primary); `feat/backend` (placeholder — not required)

Work is split so both developers can build in parallel without blocking each other.

---

## 🏗️ Foundation

- [ ] Install Leaflet.js (`leaflet`, `@types/leaflet`)
- [ ] Select chart library: **Chart.js** or **Recharts** (decide and install)
- [ ] Set up React Router (if not already)
- [ ] Create `AppLayout` component (header, skip link, main, footer)
- [ ] Set up theme system: CSS variables + `data-theme` on `<html>` + localStorage
- [ ] Create `src/utils/haversine.ts` — Haversine distance utility
- [ ] Create `src/utils/cn.ts` or confirm existing `cn()` helper
- [ ] Seed all mock data in `src/services/mock/`:
  - [ ] `users.ts` — 10–15 mock leaderboard users
  - [ ] `facilities.ts` — recycling plants + e-waste centers (Goa mock coords)
  - [ ] `teams.ts` — mock collection teams (Goa mock coords, availability)
  - [ ] `complaints.ts` — pre-seeded demo complaints
  - [ ] `classifier.ts` — filename-keyword + fallback random classifier
  - [ ] `leaderboard.ts` — merge live user into mock list
- [ ] Define all TypeScript interfaces in `src/types/index.ts` (from DATA_MODEL.md)

---

## 🎨 Frontend — Pages

Each page is independently buildable against the mock service layer.

- [ ] `LoginPage` — name / phone / location form → localStorage save
- [ ] `MapPage` — Leaflet map, Goa center, mock markers, live/manual location
- [ ] `ClassifierPage` — file input, local preview, mock classification, facility result
- [ ] `PickupPage` — category select, team assign, status progression
- [ ] `ComplaintPage` — location + description + photo/video + local record
- [ ] `DashboardPage` — stats, gamification, tier, ward rank, progress bar
- [ ] `LeaderboardPage` — individual table + ward table + Hall of Fame
- [ ] `ReportsPage` — weekly/monthly/yearly charts (Chart.js or Recharts)

---

## 🎨 Frontend — Components

- [ ] `SkipLink` — first focusable element, targets `#main`
- [ ] `Navbar` — primary navigation + theme toggle
- [ ] `MapView` — Leaflet map wrapper with marker support
- [ ] `StatusBadge` — complaint/pickup status with colour coding
- [ ] `PointsCounter` — animated live points display (respect `prefers-reduced-motion`)
- [ ] `TierBadge` — Bronze / Silver / Gold / Platinum / City Champion
- [ ] `LiveCounter` — real-time counter that updates on demo actions
- [ ] `ClassificationResult` — result card with `aria-live="polite"`
- [ ] `PickupStatusTracker` — step-by-step status display with `aria-live`
- [ ] `ComplaintStatusCard` — complaint item with status + simulate button
- [ ] Error boundary + loading spinner (with `aria-busy`)

---

## ♿ Accessibility

- [ ] Verify skip link on every page; confirm focus moves to `<main>`
- [ ] Audit all form inputs for associated `<label>` elements
- [ ] Audit icon-only buttons for `aria-label` or screen-reader text
- [ ] Add `aria-live="polite"` to: classifier result, complaint confirmation, pickup status, counters
- [ ] Confirm `role="alert"` on all error messages
- [ ] Verify visible focus indicators (`outline` / `ring` not suppressed)
- [ ] Test keyboard navigation through all flows
- [ ] Test at 360 px and 1280 px — no horizontal scroll
- [ ] Test at 200% browser zoom
- [ ] Test dark mode (OS preference + manual toggle)
- [ ] Verify `prefers-reduced-motion` suppresses animations

---

## 🗂️ Data / Mock Logic

- [ ] Implement `classifyWaste()` — filename keyword matching + fallback
- [ ] Implement `findNearestFacility()` — Haversine on mock coordinates
- [ ] Implement `createPickupRequest()` — nearest available team, status flow
- [ ] Implement `awardPoints()` — per PointAction enum, update User in state + localStorage
- [ ] Implement `updateComplaintStatus()` — step through Reported → Assigned → Resolved
- [ ] Implement `updatePickupStatus()` — step through Requested → Assigned → En Route → Collected
- [ ] Implement `getLeaderboard()` — merge live user with mock list, sort by points

---

## 🧪 Testing

- [ ] Smoke-test full demo flow end-to-end (manual, in-browser)
- [ ] Keyboard-only run-through of all pages
- [ ] Screen reader spot-check on classifier result and pickup status
- [ ] Verify localStorage restores profile on page refresh
- [ ] Verify dark mode persists on page refresh
- [ ] Test with geolocation permission denied → manual fallback works

---

## 🎬 Demo Preparation

- [ ] Prepare demo image files (e.g. `plastic_bottle.jpg`, `ewaste_phone.jpg`) that trigger desired mock classification
- [ ] Pre-populate mock state so the leaderboard has enough variation to look real
- [ ] Practice the 3-minute demo flow (see DEMO.md)
- [ ] Verify the app starts cleanly with `npm install && npm run dev`
- [ ] Document any demo-time environment quirks in DEMO.md

---

## 📊 Presentation

- [ ] Add project name and one-line pitch to app header or splash screen
- [ ] Confirm all mock/demo labels are visible to judges
- [ ] Run final `npm run build` to confirm no TypeScript errors
- [ ] Update DEMO.md with final demo notes

---

## 🚫 Backend (`feat/backend`) — Not Required

The `workspace/backend/` directory is a placeholder.

The only task here is to decide whether it remains unused or is removed before final demo.

- [ ] Decide: keep placeholder or remove for a cleaner repo
