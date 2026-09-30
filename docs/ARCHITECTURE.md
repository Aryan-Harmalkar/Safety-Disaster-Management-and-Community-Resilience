# CleanConnect — Architecture

**Decided:** Client-side only. No server. No cloud. No database.

> This is an intentionally self-contained hackathon prototype.
> The architecture prioritises a working demo over production infrastructure.

---

## Architecture Overview

```
Browser
│
├── React UI (Vite + TypeScript + Tailwind CSS)
│
├── Application State
│   └── In-memory React state (useState / useReducer / Context)
│
├── localStorage
│   ├── User profile (persisted across refresh)
│   └── Theme preference
│
├── Mock Data Layer  (workspace/frontend/src/services/mock/)
│   ├── Mock users (10–15 leaderboard entries)
│   ├── Mock collection teams (id, name, lat, lng, status)
│   ├── Mock recycling facilities (name, lat, lng, type)
│   ├── Mock e-waste centers (name, lat, lng)
│   └── Mock complaints (seeded for demo)
│
├── Leaflet.js + OpenStreetMap
│   ├── No API key required
│   ├── Goa-centered default view
│   └── Mock markers rendered from in-memory data
│
├── Browser Geolocation API
│   └── navigator.geolocation (with manual fallback)
│
├── Mock AI Classifier
│   ├── Input: waste image file (browser FileReader, preview only)
│   ├── Classification: filename keywords / deterministic rules / controlled random
│   └── Output: category + nearest facility (Haversine distance on mock coords)
│
└── Chart.js or Recharts
    └── Weekly / Monthly / Yearly report charts
```

**No server runs. No data leaves the browser.**

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19 | UI rendering |
| Build tool | Vite 6 | Dev server + bundler |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS 4 | Utility-first |
| Maps | Leaflet.js + OpenStreetMap | No API key |
| Charts | Chart.js or Recharts | TBD during implementation |
| Persistence | localStorage | Profile + theme only |
| Backend | **None required** | — |
| Database | **None required** | — |
| Auth | **None** | Mock login only |
| AI | **Mock/rule-based** | No real model |

---

## Frontend Structure

```
workspace/frontend/src/
├── app/
│   ├── App.tsx               — root component, router
│   └── routes.tsx            — route definitions
│
├── components/
│   ├── ui/                   — generic primitives (Button, Input, Badge, Card…)
│   └── shared/               — app-wide (Navbar, Footer, SkipLink, ErrorBoundary…)
│
├── features/
│   └── waste-management/     — domain boundary
│       ├── components/       — feature-specific UI
│       ├── hooks/            — data hooks
│       └── index.ts
│
├── hooks/                    — shared custom hooks
├── layouts/                  — page shell wrappers (AppLayout)
├── pages/                    — route-level page components
│   ├── LoginPage.tsx
│   ├── MapPage.tsx
│   ├── ComplaintPage.tsx
│   ├── ClassifierPage.tsx
│   ├── PickupPage.tsx
│   ├── DashboardPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── ReportsPage.tsx
│   └── HallOfFamePage.tsx
│
├── services/
│   ├── api.ts                — local backend client (unused in client-only mode)
│   └── mock/                 — all mock data and simulated operations
│       ├── index.ts
│       ├── users.ts
│       ├── complaints.ts
│       ├── classifier.ts
│       ├── pickups.ts
│       ├── facilities.ts
│       └── leaderboard.ts
│
├── types/
│   └── index.ts              — shared TypeScript interfaces
│
└── utils/
    └── index.ts              — pure helpers (cn, haversine, formatDate…)
```

---

## Mock Data Strategy

All data that the prototype displays is **seeded in-memory** at application startup.

| Data | Source |
|---|---|
| Map markers (teams, facilities) | `services/mock/facilities.ts` — hardcoded Goa coordinates |
| Leaderboard users | `services/mock/leaderboard.ts` — 10–15 seeded mock users |
| Demo complaints | `services/mock/complaints.ts` — pre-populated for demo |
| AI classification | `services/mock/classifier.ts` — filename/random rule |
| Pickup progression | Simulated with `setTimeout` or button trigger |

---

## No-Backend Decision

The `workspace/backend/` directory exists as a structural placeholder.

**It is not used by CleanConnect.** All functionality is client-side.

If the concept is developed beyond the hackathon into a production product, the backend would handle:
- Real authentication
- Persistent complaint/pickup storage
- Real AI inference
- Integration with municipal systems

---

## Decisions

See [DECISIONS.md](DECISIONS.md) for the full ADR log.
