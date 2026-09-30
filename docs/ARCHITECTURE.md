# Architecture

**Decided:** Local-only. No cloud services.

## Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4 | ✅ Initialized |
| Backend | Node.js, Express (optional) | ✅ Placeholder ready |
| Database | Mock JSON → SQLite TBD | ⬜ TBD |
| Auth | None (local only) | ✅ Not needed |
| Hosting | None (local only) | ✅ Not needed |

## Data Flow

```
React Components
       ↓
Features / Hooks
       ↓
workspace/frontend/src/services/
    ├── api.ts          → localhost:3001 (when backend is running)
    └── mock/           → local JSON (when backend is not needed yet)
       ↓
workspace/backend/src/
    ├── routes/
    ├── services/
    └── data/mock/
```

## Frontend Structure

```
workspace/frontend/src/
├── app/           — bootstrap & routing
├── components/
│   ├── ui/        — generic primitives (Button, Input, Card…)
│   └── shared/    — app-wide (Navbar, Footer, ErrorBoundary…)
├── features/
│   └── waste-management/   — domain boundary
├── hooks/         — reusable React hooks
├── layouts/       — page shell wrappers
├── pages/         — route-level components
├── services/      — API client + mock adapter
│   └── mock/
├── types/         — shared TypeScript types
└── utils/         — pure helper functions
```

## Open Decisions

- [ ] Does the app need user accounts / identity at all?
- [ ] Which specific features will be built?
- [ ] SQLite or pure JSON for persistence?
- [ ] Does the backend need to run during the demo?
