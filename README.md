# CleanConnect

**Unified Waste Management and Citizen Engagement Platform for Goa, India**

> Hackathon prototype — local-only, client-side. No cloud services. No backend required.

| | |
|---|---|
| **Project** | CleanConnect |
| **Domain** | Waste Management · Civic Tech |
| **Target** | Goa, India |
| **Mode** | Local only — runs entirely in the browser |
| **Frontend** | React 19 · Vite 6 · TypeScript · Tailwind CSS 4 |
| **Maps** | Leaflet.js + OpenStreetMap (no API key) |
| **Charts** | Chart.js or Recharts (TBD) |
| **Backend** | None required |
| **Database** | None required |
| **AI** | Mock / rule-based classifier (no real model) |

---

## What It Does

CleanConnect lets citizens of Goa:

1. 📍 **View the map** — live location or manual pin; see collection teams, recycling plants, e-waste centers, and active complaints
2. 🗑️ **File a complaint** — location + description + photo → local record with status tracking
3. 🤖 **Classify waste** (mock AI) — upload a photo → category result → nearest facility
4. 🚛 **Request a pickup** — nearest available mock collection team assigned; track status
5. 📊 **Earn points** — gamification with tiers, leaderboard, ward rankings, Hall of Fame
6. 📈 **View reports** — weekly/monthly/yearly charts of activity

> All AI classification, collection team data, facility locations, rewards, and prizes are
> **mock demo artefacts**. They do not represent real services or government commitments.

---

## Quick Start

```bash
cd workspace/frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**

No API keys. No server. No accounts.

---

## Architecture

```
Browser
│
├── React + Vite + TypeScript + Tailwind CSS
├── In-memory application state
├── Mock data (teams, facilities, users, complaints)
├── localStorage  (profile + theme preference)
├── Leaflet.js + OpenStreetMap
├── Mock AI classifier (filename rules / random)
└── Chart.js or Recharts
```

No network requests are required (except Leaflet map tiles).

---

## Workspace

```
workspace/
└── frontend/   ← entire application lives here
    └── src/
        ├── app/
        ├── components/ (ui/, shared/)
        ├── features/waste-management/
        ├── hooks/
        ├── layouts/
        ├── pages/
        ├── services/ (api.ts, mock/)
        ├── types/
        └── utils/
```

`workspace/backend/` is a structural placeholder — not used by this prototype.

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | Integration |
| `feat/frontend` | Frontend development |
| `feat/backend` | Backend placeholder (unused) |

---

## Documentation

| Doc | Contents |
|---|---|
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | All views, inputs, behaviours, constraints |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, data flow, mock strategy |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | TypeScript interfaces, state transitions |
| [API_CONTRACT.md](docs/API_CONTRACT.md) | Client-side service interfaces |
| [UI_FLOW.md](docs/UI_FLOW.md) | Page map, user journeys, accessibility requirements |
| [DECISIONS.md](docs/DECISIONS.md) | Architecture decision log (ADRs) |
| [TASKS.md](docs/TASKS.md) | Sprint task breakdown |
| [DEMO.md](docs/DEMO.md) | 3-minute demo script + fallbacks |
