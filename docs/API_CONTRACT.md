# API Contract

Placeholder for the contract between the frontend service layer and the backend routes.

## Architecture

```
Frontend: src/services/api.ts  ←→  Backend: backend/src/routes/
```

## Baseline Endpoint

| Method | Path      | Description          |
|--------|-----------|----------------------|
| GET    | /health   | Server health check  |

## Contents to be documented:
- All route definitions with request/response shapes
- Shared type contracts (mirrored in `src/types/` and `backend/src/models/`)
- Error response format: `{ code: string, message: string, details?: unknown }`
- Mock fallback behaviour when backend is not running
