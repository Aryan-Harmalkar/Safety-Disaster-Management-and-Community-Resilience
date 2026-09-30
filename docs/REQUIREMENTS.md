# CleanConnect — Requirements

**Project:** CleanConnect — Unified Waste Management and Citizen Engagement Platform for Goa, India
**Mode:** Local-only, client-side web prototype
**Backend:** None required
**Database:** None required
**Persistence:** In-memory JavaScript state + localStorage where useful

> All mock data, simulated progressions, rewards, and AI classifications are demo artefacts.
> They do not represent real government services, real AI inference, or real reward schemes.

---

## 1. Problem Statement

> _[Team to define the specific problem being solved — e.g. lack of visibility into waste collection, low citizen reporting rates, poor coordination between collection teams and residents, etc.]_
>
> The prototype demonstrates how a unified digital platform could:
> - Let citizens report waste issues from their location
> - Help citizens segregate and recycle waste using a mock AI classifier
> - Request collection team pickups
> - Track complaint/pickup status
> - Gamify civic participation to encourage sustained engagement

---

## 2. Target Users

- Citizens of Goa, India (primary)
- Municipal/collection team operators (simulated in prototype)

---

## 3. Functional Requirements by View

### 3.1 Landing / Login

**Purpose:** Mock onboarding — collect a minimal local profile for the demo session.

**Inputs:**
| Field | Type | Notes |
|---|---|---|
| Name | Text | Required |
| Phone number | Text | Required; no real verification |
| Location | Text / map pin | Ward or area name |

**Behaviour:**
- No real authentication. Profile stored in-memory (and optionally localStorage).
- After submission, the user enters the Home/Map view.
- A returning user (localStorage) may be auto-restored.

---

### 3.2 Home / Map View

**Purpose:** Spatial awareness of the user's local waste ecosystem.

**Requirements:**
- Leaflet.js map, centered on Goa by default
- Browser Geolocation API for live-location toggle
- Manual location: map pin drag or address text input
- Mock map markers for:
  - 🚛 Collection teams (mock locations + availability status)
  - ♻️ Recycling plants (mock locations)
  - 🖥️ E-waste centers (mock locations)
  - 📍 Active complaints (mock + any user-submitted this session)
- Tapping a marker shows a popup with mock details

> **All marker locations are mock data for demonstration purposes.**

**Navigation:**
- Primary action buttons accessible from the map view:
  - File a Complaint
  - Classify Waste
  - Request Pickup
  - Dashboard

---

### 3.3 File a Complaint

**Purpose:** Allow citizens to report waste issues at a location.

**Inputs:**
| Field | Type | Notes |
|---|---|---|
| Location | Live GPS or manual | Same options as map |
| Description | Textarea | Free-text |
| Photo | File input | Previewed locally; not uploaded to any server |
| Video | File input | Previewed locally; not uploaded to any server |

**Behaviour:**
- Submitting creates a local complaint record in application state.
- Initial status: **Reported**
- Status progression (simulated):
  ```
  Reported → Assigned → Resolved
  ```
- The progression may be triggered by a "Simulate Progress" button or a timer.
- Filing earns **+10 points**; resolution earns **+25 points** (mock).

> Photo and video files are processed only in the browser. No data is sent to a server.

---

### 3.4 AI Waste Classifier

> **⚠️ Mock feature.** No real computer-vision model is used. Classification is determined by filename keywords, deterministic rules, or controlled random assignment.

**Purpose:** Guide citizens on how to dispose of their waste and find the nearest facility.

**Input:** Waste photo (file input, previewed locally)

**Classification categories:**
```
Wet
Dry
Recyclable
  ├── Plastic
  ├── Paper
  ├── Metal
  └── Glass
E-Waste
Hazardous
```

**Post-classification behaviour:**
- Display classification result with appropriate icon/colour
- Identify nearest relevant facility using Haversine distance on mock coordinates
- Provide a **Request Pickup** action where applicable
- Classifying + submitting earns **+15 points** (mock)

---

### 3.5 Pickup Request

> **⚠️ Labelled as "Government-Backed Pickup Facility" in the UI.** This is a demo label only. It does not represent a verified real government service.

**Purpose:** Simulate requesting a waste collection team.

**Supported waste categories:**
- General waste
- Recyclables
- E-waste

**Mock collection teams:** Each team has:
| Field | Type |
|---|---|
| id | string |
| name | string |
| location | { lat, lng } |
| status | `"available"` \| `"busy"` |

**Pickup workflow:**
1. User selects category and confirms request.
2. System finds the nearest available mock team using Haversine distance.
3. Team status changes to `busy`.
4. Pickup status is displayed and updated:
   ```
   Requested → Assigned → En Route → Collected
   ```
5. Progression is simulated (button or timer).
6. Completion earns **+20 points** for e-waste pickups (mock).

---

### 3.6 User Dashboard

**Purpose:** Personal overview of activity, stats, and gamification standing.

**Profile section:**
- Name
- Location / ward
- Contact number

**Statistics:**
| Metric | Description |
|---|---|
| Complaints filed | Count of user-submitted complaints |
| Waste items classified | Count of classifier uses |
| Recyclables sent to plants | Count of completed recyclable pickups |
| E-waste pickups completed | Count of completed e-waste pickups |
| Complaint resolution rate | % of complaints reaching "Resolved" |

**Gamification:**
| Field | Example |
|---|---|
| Points | 320 |
| Rank | #7 in Ward 4 |
| Current tier | Silver |
| Progress to next | 320 / 500 to Gold |

> All statistics and gamification values are demo-generated from in-memory state.

---

### 3.7 Scoreboard / Leaderboard

**Purpose:** Encourage participation through visible rankings.

**Views:**
- Individual ranking (all mock users, 10–15 entries)
- Ward-wise ranking (grouped by ward)

**Point rules (demo):**

| Action | Points |
|---|---:|
| File a complaint | +10 |
| Complaint resolved | +25 |
| AI classify + submit waste photo | +15 |
| Waste confirmed received at recycling plant | +10 |
| E-waste pickup completed | +20 |
| Fake / duplicate report | −10 |

**Tiers (demo):**

| Tier | Example reward shown in UI |
|---|---|
| Bronze | Badge |
| Silver | ₹50–100 coupon |
| Gold | ₹150–250 |
| Platinum | ₹500+ |
| City Champion | Highest reward |

> **Rewards are mock UI elements only. They are not real, guaranteed, or government-issued.**

---

### 3.8 Hall of Fame

**Purpose:** Annual recognition showcase.

**Content:** Top 3 annual performers (mock past winners).

| Position | Prize shown |
|---|---|
| 1st | ₹10,000 |
| 2nd | ₹5,000 |
| 3rd | ₹2,500 |

> **Prize amounts are demo values only. They do not represent verified government prize commitments.**

---

### 3.9 Reports

**Purpose:** Personal periodic activity reports.

**Periods:**
- Weekly
- Monthly
- Yearly

**Metrics per report:**
- Complaints filed
- Waste classified / recycled
- Points earned
- Rank movement

**Charts:** Chart.js or Recharts (to be selected during implementation).

---

### 3.10 Live Counters

**Purpose:** Make the platform feel active; visualise demo impact.

**Example counters:**
- Total complaints today
- Total waste items processed today

**Behaviour:**
- Counters update when the user performs demo actions.
- Animation is optional; must respect `prefers-reduced-motion` if implemented.

---

## 4. Non-Functional Requirements

- Works entirely in-browser; no network requests required
- Target browsers: modern desktop and mobile (Chrome, Firefox, Safari, Edge)
- No installation beyond `npm install` + `npm run dev`
- No API keys, credentials, or cloud accounts required

---

## 5. Accessibility Requirements

See **Section 5 — Accessibility** in [UI_FLOW.md](UI_FLOW.md) for the full frontend accessibility requirements derived from the project's frontend skill guidance.

---

## 6. Constraints

- No Firebase, Supabase, or any cloud service
- No real AI model
- No real government partnership implied
- No real rewards or payments
- No production deployment configuration
- Two developers working in parallel (frontend + no-backend-needed)

---

## 7. Success Criteria

The demo should allow a judge to complete the full primary flow in ≤ 3 minutes:

```
Login → Map → Classify waste → Find facility → Request pickup → Pickup progresses → Points update → Dashboard/Leaderboard
```
