# Backend — Local Waste Management API

Optional local Express server. Only build this when the frontend actually needs server-side logic.

## Stack

- Node.js + TypeScript
- Express
- Local JSON / SQLite (TBD)

## Dev

```bash
cd workspace/backend
npm install
npm run dev        # ts-node src/server.ts  → http://localhost:3001
```

## Health check

```
GET http://localhost:3001/health
```

## Structure

```
src/
├── routes/     # Express routers — one file per resource
├── services/   # Business logic (called by routes)
├── models/     # TypeScript types / interfaces
├── utils/      # Pure helper functions
└── server.ts   # Entry point
data/
└── mock/       # JSON fixture files for early dev (no DB required)
```
