# Architecture Decision Log

Record significant decisions here as they are made.
One entry per decision. Do not delete old entries — mark them superseded if reversed.

---

## ADR-001 — Local-only architecture

**Date:** 2026-09-30
**Status:** Accepted

**Context:** Hackathon prototype. Speed and simplicity are paramount.

**Decision:** No cloud services. All data is local JSON or SQLite.
No Firebase, Supabase, cloud auth, or hosted APIs.

**Consequences:** Fast to iterate. No credentials to manage. Not production-ready.

---

## ADR-002 — Frontend service boundary via `src/services/`

**Date:** 2026-09-30
**Status:** Accepted

**Context:** Two developers working in parallel. UI must not hardcode data source.

**Decision:** All data access goes through `workspace/frontend/src/services/`.
- `api.ts` — calls local backend when available
- `mock/`  — returns local JSON when backend isn't needed yet

UI components never call `fetch` directly.

**Consequences:** Frontend developer can build UI against mock data without waiting for backend.

---

## ADR-003 — Backend is optional until needed

**Date:** 2026-09-30
**Status:** Accepted

**Context:** Requirements not yet finalised. Premature backend = wasted time.

**Decision:** `workspace/backend/` is a placeholder. Frontend uses `mock/` by default.
Backend is only built when a specific feature genuinely requires server-side logic.

---

_Add new ADRs below as decisions are made._
