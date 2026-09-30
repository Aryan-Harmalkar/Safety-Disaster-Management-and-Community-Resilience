# Waste Management

**Hackathon project — local-only prototype.**

| | |
|---|---|
| **Topic** | Waste Management |
| **Mode** | Local only — no cloud services |
| **Frontend** | React 19 · Vite 6 · TypeScript · Tailwind CSS 4 |
| **Backend** | Node.js · Express (optional local server) |
| **Data** | Mock JSON → local DB if needed |

---

## Architecture

```
React + Vite + TypeScript + Tailwind
              │
              ▼
    workspace/frontend/src/services/api.ts
              │
              ▼
    Local Express backend  :3001
              │
              ▼
    workspace/backend/data/mock/  (JSON files)
```

The backend is **optional** — the frontend uses mock data from
`workspace/frontend/src/services/mock/` until a real backend is needed.

---

## Workspace

```
workspace/
├── frontend/   ← React app (feat/frontend branch)
└── backend/    ← Express API (feat/backend branch)
```

---

## Quick Start

### Frontend

```bash
cd workspace/frontend
cp ../../.env.example .env.local
npm install
npm run dev
```

Frontend → **http://localhost:5173**

### Backend (optional)

```bash
cd workspace/backend
npm install
npm run dev
```

Backend → **http://localhost:3001**

---

## Branches

| Branch | Owner |
|---|---|
| `main` | Integration |
| `feat/frontend` | Frontend developer |
| `feat/backend` | Backend developer |

---

## Documentation

See [`docs/`](docs/):

- [REQUIREMENTS.md](docs/REQUIREMENTS.md) — problem statement & requirements
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design decisions
- [DATA_MODEL.md](docs/DATA_MODEL.md) — data entities & schema
- [API_CONTRACT.md](docs/API_CONTRACT.md) — frontend↔backend API contract
- [UI_FLOW.md](docs/UI_FLOW.md) — user journeys & page flows
- [DECISIONS.md](docs/DECISIONS.md) — architecture decision log
- [TASKS.md](docs/TASKS.md) — sprint tasks & milestones
- [DEMO.md](docs/DEMO.md) — demo script & submission notes
