# CleanConnect — Architecture Decision Log

Significant decisions are recorded here. Do not delete entries — mark as Superseded if reversed.

---

## ADR-001 — Local-only architecture

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** Hackathon prototype. Speed and simplicity are paramount.

**Decision:** No cloud services of any kind.
No Firebase, Supabase, cloud auth, hosted APIs, or external databases.

**Consequences:** Fast to build. No credentials. Not production-ready. Clear scope boundary.

---

## ADR-002 — No backend required (client-side only)

**Date:** 2026-09-30
**Status:** ✅ Accepted (supersedes ADR-003 from prior iteration)

**Context:** CleanConnect's demo features (map, classifier, pickup, leaderboard) can all be
simulated entirely in-browser with mock data and in-memory state.

**Decision:** The `workspace/backend/` directory exists as a structural placeholder only.
It is not used by CleanConnect. All application logic runs in the browser.

**Consequences:** Single developer can build the entire prototype. No npm scripts needed
for a server. Demo runs with just `npm run dev` in `workspace/frontend/`.

---

## ADR-003 — Mock data is intentional and explicit

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** No real Goa waste-management data is available for the hackathon.

**Decision:** All map coordinates, collection teams, facilities, leaderboard users, and
classification results are seeded mock data. Mock artefacts are clearly labelled in the UI.

**Consequences:** The prototype is honest about its demo nature.
No real data is fabricated or presented as factual.

---

## ADR-004 — AI classification is simulated (rule-based / random)

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** No real computer-vision model is available or required for the hackathon.

**Decision:** `classifyWaste(file: File)` returns a result based on:
1. Filename keyword matching (e.g. "plastic_bottle" → Recyclable/Plastic)
2. Deterministic rules (file size ranges → categories)
3. Controlled random assignment as fallback

The UI clearly labels results as "Mock classification".

**Consequences:** Feature is demonstrable without ML infrastructure.
Must not be misrepresented as real AI to judges.

---

## ADR-005 — Leaflet.js + OpenStreetMap for mapping

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** A map is required. No API key should be needed for the hackathon.

**Decision:** Use Leaflet.js with OpenStreetMap tile layer.
- No API key
- Works offline with cached tiles (partial)
- Goa coordinates: approximately lat 15.3, lng 74.0

**Consequences:** Free, open-source. Works in any browser. Keyboard accessible (built-in).
Map tiles require internet; demo assumes connectivity.

---

## ADR-006 — localStorage for user profile and theme persistence

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** Users should not have to re-enter their profile on page refresh during a demo.

**Decision:** Persist the `User` object and `theme` preference to localStorage.

Keys:
```
cleanconnect_user  — serialised User object
cleanconnect_theme — 'light' | 'dark'
```

**Consequences:** Profile survives refresh. Tab-scoped (not cross-device).
No server needed for basic persistence.

---

## ADR-007 — Prototype prioritises functional demo over production infrastructure

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** This is a hackathon, not a production release.

**Decision:** Implementation choices optimise for:
1. Demo completeness (all flows work end-to-end)
2. Visual quality (Tailwind + clean layout)
3. Accessibility (SKILL-website.md requirements)

Not for: scalability, security hardening, real data integrity.

---

## ADR-008 — Accessibility requirements from SKILL-website.md are part of the definition of done

**Date:** 2026-09-30
**Status:** ✅ Accepted

**Context:** Frontend skill guidance specifies concrete accessibility requirements.

**Decision:** The following are non-optional for every page:
- Skip link as first focusable element
- Semantic `<header>/<main>/<footer>`; one `<main>` per screen
- Labels for all inputs
- `aria-live` regions for all dynamic content
- Visible focus indicators; logical tab order
- Dark mode via `data-theme` + CSS variables + localStorage
- `prefers-reduced-motion` respected

Full requirements documented in [UI_FLOW.md § 6](UI_FLOW.md).

---

## Unresolved Choices

| Choice | Options | Notes |
|---|---|---|
| Chart library | Chart.js **or** Recharts | Both work; pick at implementation time |
| Final navigation structure | Tab bar / sidebar / top nav | To be decided with visual design |
| Visual design / colour palette | Not yet defined | Team to decide |
| Final mock data sets | Not yet finalised | Coordinates, names, leaderboard users |
| IndexedDB usage | Yes / No | localStorage may be sufficient for demo |
| Pickup progression method | Button trigger **or** setTimeout auto-advance | UX preference |

---

_Add new ADRs below as decisions are made._
