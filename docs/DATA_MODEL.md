# CleanConnect — Data Model

**Storage:** In-memory JavaScript state + localStorage (profile/theme only).
**Database:** None. No backend. No SQL schema.

> These are **client-side TypeScript interfaces**, not database tables.
> Keep them minimal. Fields are added only as features are implemented.

---

## Entities

### `User`

Represents the currently logged-in (mock) citizen.

```ts
interface User {
  id: string;                   // generated locally (e.g. crypto.randomUUID())
  name: string;
  phone: string;
  location: string;             // ward or area name (text)
  ward: string;                 // e.g. "Ward 4"
  points: number;               // gamification points
  tier: Tier;                   // 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'CityChampion'
  stats: UserStats;
}

interface UserStats {
  complaintsField: number;
  wasteClassified: number;
  recyclePickupsCompleted: number;
  eWastePickupsCompleted: number;
  complaintsResolved: number;   // for resolution rate calculation
}

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'CityChampion';
```

**Persistence:** Serialised to `localStorage` so the profile survives a page refresh.

---

### `Complaint`

A waste issue reported by the user.

```ts
interface Complaint {
  id: string;
  userId: string;
  location: GeoPoint;
  description: string;
  photoUrl?: string;            // local object URL (FileReader), never uploaded
  videoUrl?: string;            // local object URL (FileReader), never uploaded
  status: ComplaintStatus;
  createdAt: string;            // ISO timestamp
  updatedAt: string;
}

type ComplaintStatus = 'Reported' | 'Assigned' | 'Resolved';
```

**State transitions:**
```
Reported → Assigned → Resolved
```
Transition triggered by simulated button or setTimeout.

---

### `WasteClassification`

Result of the mock AI classification.

```ts
interface WasteClassification {
  id: string;
  userId: string;
  imageName: string;            // original file name (used for mock rule)
  category: WasteCategory;
  subCategory?: WasteSubCategory;
  nearestFacilityId: string;    // resolved via Haversine on mock coordinates
  classifiedAt: string;         // ISO timestamp
}

type WasteCategory = 'Wet' | 'Dry' | 'Recyclable' | 'EWaste' | 'Hazardous';
type WasteSubCategory = 'Plastic' | 'Paper' | 'Metal' | 'Glass';
```

> **Classification result is mock.** No real computer-vision model is used.

---

### `PickupRequest`

A request for a collection team to collect waste.

```ts
interface PickupRequest {
  id: string;
  userId: string;
  category: PickupCategory;
  location: GeoPoint;
  status: PickupStatus;
  assignedTeamId?: string;      // set when a team is found
  createdAt: string;
  updatedAt: string;
}

type PickupCategory = 'General' | 'Recyclable' | 'EWaste';
type PickupStatus = 'Requested' | 'Assigned' | 'EnRoute' | 'Collected';
```

**State transitions:**
```
Requested → Assigned → En Route → Collected
```

---

### `CollectionTeam`

A mock municipal waste collection team.

```ts
interface CollectionTeam {
  id: string;
  name: string;
  location: GeoPoint;           // mock GPS coordinates in Goa
  status: TeamStatus;
}

type TeamStatus = 'available' | 'busy';
```

> **Mock data.** Does not represent real teams. Coordinates are illustrative.

---

### `RecyclingFacility`

A mock recycling plant.

```ts
interface RecyclingFacility {
  id: string;
  name: string;
  location: GeoPoint;
  type: 'RecyclingPlant' | 'EWasteCenter';
  accepts: WasteCategory[];     // which waste categories this facility handles
}
```

> **Mock data.** Does not represent real facilities.

---

### `LeaderboardUser`

A mock citizen entry for the leaderboard.

```ts
interface LeaderboardUser {
  id: string;
  name: string;
  ward: string;
  points: number;
  tier: Tier;
  rank: number;                 // computed; not stored
}
```

10–15 seeded mock entries. The current user's live totals are merged in at render time.

---

### `ReportData`

Aggregated activity data for a report period.

```ts
interface ReportData {
  period: 'weekly' | 'monthly' | 'yearly';
  complaintsField: number;
  wasteClassified: number;
  recycled: number;
  pointsEarned: number;
  rankStart: number;
  rankEnd: number;
}
```

---

### `GeoPoint`

Shared geographic coordinate type.

```ts
interface GeoPoint {
  lat: number;
  lng: number;
}
```

---

## Status Transition Summary

```
Complaint:      Reported → Assigned → Resolved
PickupRequest:  Requested → Assigned → En Route → Collected
CollectionTeam: available ↔ busy  (toggled on assignment / collection)
```

---

## localStorage Keys

| Key | Value |
|---|---|
| `cleanconnect_user` | Serialised `User` object |
| `cleanconnect_theme` | `'light'` \| `'dark'` |

---

## What Is NOT Stored

- No complaint photos/videos are persisted (object URLs are session-only)
- No data is sent to any server
- No SQL tables exist
- No IndexedDB is used (unless added later by the team)
