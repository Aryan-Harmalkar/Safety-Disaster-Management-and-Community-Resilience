# CleanConnect — Demo Script

**Project:** CleanConnect — Waste Management & Citizen Engagement Platform, Goa
**Mode:** Local-only prototype
**Target duration:** ≤ 3 minutes

> All classification, pickup assignment, rewards, and prizes shown in this demo
> are **mock / simulated values** for demonstration purposes only.

---

## Before the Demo — Checklist

```bash
cd workspace/frontend
npm install           # only needed first time
npm run dev           # starts at http://localhost:5173
```

- [ ] Browser open at `http://localhost:5173`
- [ ] Demo image files ready (e.g. `plastic_bottle.jpg`, `ewaste_phone.jpg`, `wet_food.jpg`)
- [ ] `localStorage` cleared if starting fresh (DevTools → Application → Clear Storage)
- [ ] Internet connection available (Leaflet map tiles require it)
- [ ] Screen resolution set to comfortable demo size (≥ 1280 px recommended)

---

## Elevator Pitch (30 seconds)

> "CleanConnect is a civic platform that lets citizens of Goa report waste issues,
> classify waste using AI, request government-backed pickups, and earn rewards
> for keeping their community clean — all through a single app."

---

## Step-by-Step Demo

### Step 1 — Login (20 s)

- Open the app → Landing / Login screen appears
- Enter:
  - **Name:** your name or a demo name
  - **Phone:** any number (e.g. 9876543210)
  - **Location:** "Panaji, Ward 4"
- Click **Get Started**

> _Profile is saved locally. No server. No real authentication._

---

### Step 2 — Home / Map (20 s)

- Leaflet map loads, **centered on Goa**
- Click **Enable Live Location** → browser asks for permission
  - If granted: map pans to your location
  - If denied or unavailable: **drop a manual pin** on Panaji / any Goa location
- Point out mock markers on the map:
  - 🚛 Collection teams
  - ♻️ Recycling plants
  - 🖥️ E-waste centers
  - 📍 Pre-seeded demo complaints

> _"All markers are mock data. In a production system these would be live municipal data."_

---

### Step 3 — Waste Classification (40 s)

- Tap **Classify Waste**
- Upload a sample image (e.g. `plastic_bottle.jpg`)
- The **mock AI classifier** runs:
  - Classification result shown with icon: **Recyclable → Plastic**
  - Badge clearly labelled "Mock classification"
- Nearest recycling plant shown (Haversine on mock coordinates)
- **+15 points** awarded (visible in counter)
- Tap **Request Pickup** to proceed

> _"In a real product, this would use a computer-vision model. Here we simulate it for the demo."_

---

### Step 4 — Pickup Request & Tracking (30 s)

- Pickup category pre-filled: **Recyclable**
- Tap **Confirm Request**
- System finds nearest available mock collection team:
  - Status: **Assigned** (mock team name shown)
- Tap "Simulate Progress" (or wait for timer):
  ```
  Requested → Assigned → En Route → Collected
  ```
- Each transition is visible with colour-coded status badge

> _"This simulates the assignment of a government waste collection team."_

---

### Step 5 — File a Complaint (optional, 20 s)

- Navigate to **File a Complaint**
- Location: live GPS or manual
- Description: "Overflowing bin near beach"
- Attach sample photo (local preview only)
- Submit → Status: **Reported** (+10 points)
- Tap simulate → **Assigned** → **Resolved** (+25 points)

---

### Step 6 — Dashboard (20 s)

- Navigate to **Dashboard**
- Show:
  - Stats: complaints filed, waste classified, pickups completed
  - Points: updated live from demo actions
  - Tier: e.g. **Silver**
  - Progress bar: "320 / 500 points to Gold"
  - Ward rank: e.g. "#7 in Ward 4"

---

### Step 7 — Leaderboard (15 s)

- Navigate to **Leaderboard**
- Show **Individual** tab: ranked list of mock + current user
- Switch to **Ward** tab: ward-level totals
- Scroll to **Hall of Fame**: annual top 3 (mock prizes displayed)

---

### Step 8 — Reports (15 s)

- Navigate to **Reports**
- Switch between **Weekly / Monthly / Yearly**
- Chart shows complaints, waste recycled, points earned, rank movement

---

## Fallback Procedures

| Problem | Fallback |
|---|---|
| Browser geolocation denied | Drop a manual pin on the Goa map |
| File upload broken | Use a pre-typed filename that triggers the mock classifier |
| Map tiles not loading | Describe map visually; continue with other features |
| Any live interaction fails | Show the pre-populated mock state already in the UI |
| Points not updating | Refresh and check localStorage was cleared before demo |

---

## What to Emphasise to Judges

1. **Full end-to-end flow** works locally — no cloud, no API key, no setup
2. **Mock AI** demonstrates the concept; real ML would be the next step
3. **Gamification** (points, tiers, leaderboard) encourages sustained citizen participation
4. **Accessibility** — keyboard navigation, skip links, dark mode, live regions
5. **Upgrade path** is clear: `services/mock/` → real backend API, same interfaces

---

## Post-Hackathon Roadmap (for Q&A)

| Feature | Production requirement |
|---|---|
| Real AI classifier | CV model (TensorFlow.js or cloud ML API) |
| Real collection team dispatch | Municipal API integration |
| Real user accounts | Authentication service |
| Real rewards | Partnership with municipal authorities |
| Real Goa facility data | Open government data or partnership |
