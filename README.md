# Safety, Disaster Management & Community Resilience

Hackathon project — local-only web application.

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19 · Vite 6 · TypeScript · Tailwind CSS 4 |
| Backend   | Node.js · Express (local only)    |
| Data      | Mock JSON → SQLite (if needed)    |

## Architecture

```
React + Vite + TypeScript + Tailwind
              │
              ▼
      src/services/api.ts
              │
              ▼
    Local backend (Express)
    backend/src/server.ts  :3001
              │
              ▼
  backend/data/mock/  (JSON files)
```

## Quick Start

### Frontend

```bash
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### Backend (optional — only if needed)

```bash
cd backend
npm install
npm run dev
```

Backend runs at **http://localhost:3001**

## Project Structure

```
├── src/                    # Frontend source
│   ├── app/                # App bootstrap & routing
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Generic primitives
│   │   └── shared/         # App-wide shared components
│   ├── features/           # Feature-specific modules
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page-level components (add as needed)
│   ├── services/           # API client boundary (src/services/api.ts)
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Pure utility functions
│
├── backend/                # Optional local backend
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Type definitions
│   │   └── server.ts       # Entry point
│   └── data/mock/          # Mock JSON data files
│
├── docs/                   # Project documentation
└── .env.example            # Environment variable template
```

## Branches

| Branch          | Owner              |
|-----------------|--------------------|
| `main`          | Integration branch |
| `feat/frontend` | Frontend developer |
| `feat/backend`  | Backend developer  |

## Documentation

See the `docs/` folder:

- [`REQUIREMENTS.md`](docs/REQUIREMENTS.md)
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`DATA_MODEL.md`](docs/DATA_MODEL.md)
- [`API_CONTRACT.md`](docs/API_CONTRACT.md)
- [`UI_FLOW.md`](docs/UI_FLOW.md)
- [`TASKS.md`](docs/TASKS.md)
- [`DEMO.md`](docs/DEMO.md)
