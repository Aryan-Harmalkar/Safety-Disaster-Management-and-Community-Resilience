# System Architecture

Placeholder for high-level system architecture documentation.

## Architecture Decision: Local-Only

```
React + Vite + TypeScript + Tailwind
              │
              ▼
      src/services/api.ts
              │
              ▼
    Local backend (Express)
    backend/src/server.ts
              │
              ▼
  Local data / JSON / SQLite
  backend/data/mock/
```

No cloud infrastructure. No Firebase. No deployment configuration.

## Contents to be documented:
- System Component Diagram
- Technology Stack Rationale
- Frontend Architecture & State Strategy
- Frontend ↔ Backend Contract (API boundary via `src/services/api.ts`)
- Data Layer Strategy (mock JSON → SQLite → other if needed)
- Security & Local Auth Model (if applicable)
- Dev Environment Setup
