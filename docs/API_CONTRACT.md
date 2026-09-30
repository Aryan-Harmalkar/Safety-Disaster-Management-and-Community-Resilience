# CleanConnect — API Contract

## ⚠️ No Production API is Required

CleanConnect is a **client-side-only prototype**. There is no HTTP server, REST API, or GraphQL endpoint.

All operations are performed in the browser using in-memory state and mock data from
`workspace/frontend/src/services/mock/`.

---

## Frontend Service Boundaries

The following are **conceptual client-side service interfaces** — TypeScript function signatures
that UI components and hooks will call. They live in `src/services/mock/` and operate on
in-memory state.

They are documented here so both developers share a common contract:
- The frontend developer implements the UI against these interfaces
- If a backend is ever added, these interfaces are the replacement target

---

### User Service

```ts
// Retrieve the current session user (from localStorage or memory)
getUser(): User | null

// Save / update the user profile (to localStorage)
saveUser(user: User): void

// Clear the session
logout(): void
```

---

### Location / Map Service

```ts
// Return all mock map markers (teams, facilities, complaints)
getMapLocations(): MapLocations

interface MapLocations {
  collectionTeams: CollectionTeam[];
  recyclingFacilities: RecyclingFacility[];
  eWasteCenters: RecyclingFacility[];
  activeComplaints: Complaint[];
}

// Get browser live position (wraps navigator.geolocation)
getLiveLocation(): Promise<GeoPoint>
```

---

### Complaint Service

```ts
// Create a new complaint in local state
createComplaint(input: CreateComplaintInput): Complaint

interface CreateComplaintInput {
  location: GeoPoint;
  description: string;
  photoUrl?: string;   // local object URL only
  videoUrl?: string;   // local object URL only
}

// Get all complaints for the current user
getComplaints(userId: string): Complaint[]

// Advance complaint status one step
updateComplaintStatus(id: string): Complaint
```

---

### Waste Classifier Service

```ts
// Classify a waste image using mock rules
// (filename keywords / deterministic / random — NOT a real AI model)
classifyWaste(file: File): WasteClassification

// Find the nearest facility for a given category and location
findNearestFacility(
  category: WasteCategory,
  from: GeoPoint
): RecyclingFacility | null
```

---

### Pickup Service

```ts
// Create a pickup request and assign the nearest available team
createPickupRequest(input: CreatePickupInput): PickupRequest

interface CreatePickupInput {
  userId: string;
  category: PickupCategory;
  location: GeoPoint;
}

// Get all pickup requests for a user
getPickupRequests(userId: string): PickupRequest[]

// Advance pickup status one step
updatePickupStatus(id: string): PickupRequest

// Get all collection teams
getCollectionTeams(): CollectionTeam[]
```

---

### Leaderboard Service

```ts
// Return individual rankings (seeded mock users + live current user)
getLeaderboard(): LeaderboardUser[]

// Return ward-aggregated rankings
getWardLeaderboard(): WardLeaderboardEntry[]

interface WardLeaderboardEntry {
  ward: string;
  totalPoints: number;
  memberCount: number;
  rank: number;
}
```

---

### Reports Service

```ts
// Return aggregated activity data for a period
getReports(userId: string, period: 'weekly' | 'monthly' | 'yearly'): ReportData
```

---

### Points Service

```ts
// Award points for an action and return the updated User
awardPoints(userId: string, action: PointAction): User

type PointAction =
  | 'FILE_COMPLAINT'        // +10
  | 'COMPLAINT_RESOLVED'    // +25
  | 'CLASSIFY_WASTE'        // +15
  | 'RECYCLE_CONFIRMED'     // +10
  | 'EWASTE_COMPLETED'      // +20
  | 'FAKE_REPORT'           // -10
```

---

## Error Handling

All service functions should follow the `ServiceResult<T>` pattern from `src/types/index.ts`:

```ts
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }
```

This keeps error handling consistent whether the mock is later replaced by a real API.

---

## If a Backend Is Added (Future)

If the concept is productionised, the above service boundaries map directly to REST endpoints:

| Service function | HTTP equivalent |
|---|---|
| `getComplaints()` | `GET /api/complaints?userId=…` |
| `createComplaint()` | `POST /api/complaints` |
| `updateComplaintStatus()` | `PATCH /api/complaints/:id/status` |
| `classifyWaste()` | `POST /api/classify` (real ML service) |
| `createPickupRequest()` | `POST /api/pickups` |
| `getLeaderboard()` | `GET /api/leaderboard` |
| `getReports()` | `GET /api/reports?userId=…&period=…` |

> The `workspace/backend/` placeholder is structured for exactly this upgrade path.
