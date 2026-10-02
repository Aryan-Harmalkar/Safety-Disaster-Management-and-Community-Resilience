import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─── Data & Mocks ──────────────────────────────────────────

const facilities = [
  { name: 'Panaji Recycling Center', lat: 15.4909, lng: 73.8278, type: 'Recycling Plant' },
  { name: 'Mapusa E-Waste Hub', lat: 15.5937, lng: 73.8105, type: 'E-Waste Center' },
  { name: 'Margao Green Recycling', lat: 15.2736, lng: 73.9580, type: 'Recycling Plant' },
  { name: 'Vasco Dry Waste Mgmt', lat: 15.3973, lng: 73.8113, type: 'Recycling Plant' },
  { name: 'Ponda Hazardous Tech', lat: 15.4011, lng: 74.0156, type: 'E-Waste Center' }
];

const teams = [
  { name: 'Team Alpha (Panaji)', lat: 15.4950, lng: 73.8300, status: 'available' },
  { name: 'Team Beta (Margao)', lat: 15.2800, lng: 73.9600, status: 'busy' },
  { name: 'Team Gamma (Mapusa)', lat: 15.6000, lng: 73.8200, status: 'available' },
  { name: 'Team Delta (Vasco)', lat: 15.4000, lng: 73.9000, status: 'available' },
  { name: 'Team Epsilon (Ponda)', lat: 15.4011, lng: 74.0156, status: 'available' }
];

const complaints: any[] = [];
const pickupRequests: any[] = [];

// Helper: Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper: Validate coordinates
function isValidCoord(lat: any, lng: any): boolean {
  return typeof lat === 'number' && typeof lng === 'number' &&
         Number.isFinite(lat) && Number.isFinite(lng) &&
         lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// ─── Endpoints ──────────────────────────────────────────

// 1. Classify
app.post('/api/classify', (req, res) => {
  const { description, filename } = req.body;
  const keywords = ((description || '') + ' ' + (filename || '')).toLowerCase();

  let category = 'Dry';
  if (keywords.match(/(banana|food|apple|wet|peel|vegetable)/)) category = 'Wet';
  else if (keywords.match(/(bottle|plastic|wrapper)/)) category = 'Recyclable-Plastic';
  else if (keywords.match(/(paper|cardboard|newspaper)/)) category = 'Recyclable-Paper';
  else if (keywords.match(/(metal|can|tin|aluminium)/)) category = 'Recyclable-Metal';
  else if (keywords.match(/(glass|jar)/)) category = 'Recyclable-Glass';
  else if (keywords.match(/(battery|phone|laptop|cable|e-waste|electronic)/)) category = 'E-Waste';
  else if (keywords.match(/(chemical|paint|hazardous|oil)/)) category = 'Hazardous';

  res.json({
    category,
    confidence: 0.95,
    source: 'fallback'
  });
});

// 2. Nearest Facility
app.post('/api/nearest-facility', (req, res) => {
  const { category, lat, lng } = req.body;

  if (!isValidCoord(lat, lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const targetType = (category === 'E-Waste' || category === 'Hazardous')
    ? 'E-Waste Center'
    : 'Recycling Plant';

  const eligible = facilities.filter(f => f.type === targetType);

  let nearest = null;
  let minDistance = Infinity;

  for (const f of eligible) {
    const d = haversine(lat, lng, f.lat, f.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = f;
    }
  }

  if (!nearest) {
    return res.status(404).json({ error: 'No facility found' });
  }

  res.json({
    name: nearest.name,
    lat: nearest.lat,
    lng: nearest.lng,
    distance_km: Math.round(minDistance * 10) / 10,
    type: nearest.type
  });
});

// 3. Complaints
app.post('/api/complaints', (req, res) => {
  const { lat, lng, description, category } = req.body;

  if (!isValidCoord(lat, lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const complaint = {
    id: randomUUID(),
    lat,
    lng,
    description,
    category,
    status: 'Reported',
    created_at: new Date().toISOString()
  };
  complaints.push(complaint);
  res.json({
    id: complaint.id,
    status: complaint.status,
    created_at: complaint.created_at
  });
});

app.patch('/api/complaints/:id/advance', (req, res) => {
  const { id } = req.params;
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Not found' });

  if (complaint.status === 'Reported') complaint.status = 'Assigned';
  else if (complaint.status === 'Assigned') complaint.status = 'Resolved';

  res.json({ id: complaint.id, status: complaint.status });
});

// 4. Pickup Requests
app.post('/api/pickup-requests', (req, res) => {
  const { category, lat, lng } = req.body;

  if (!isValidCoord(lat, lng)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const availableTeams = teams.filter(t => t.status === 'available');
  let nearestTeam = null;
  let minDistance = Infinity;

  for (const t of availableTeams) {
    const d = haversine(lat, lng, t.lat, t.lng);
    if (d < minDistance) {
      minDistance = d;
      nearestTeam = t;
    }
  }

  if (!nearestTeam) {
    return res.status(503).json({ error: 'No teams available' });
  }

  nearestTeam.status = 'busy';
  const request = {
    id: randomUUID(),
    category,
    lat,
    lng,
    team_name: nearestTeam.name,
    team_lat: nearestTeam.lat,
    team_lng: nearestTeam.lng,
    status: 'Requested',
    created_at: new Date().toISOString()
  };
  pickupRequests.push(request);

  res.json({
    id: request.id,
    team_name: request.team_name,
    team_lat: request.team_lat,
    team_lng: request.team_lng,
    status: request.status
  });
});

app.patch('/api/pickup-requests/:id/advance', (req, res) => {
  const { id } = req.params;
  const request = pickupRequests.find(r => r.id === id);
  if (!request) return res.status(404).json({ error: 'Not found' });

  if (request.status === 'Requested') request.status = 'Assigned';
  else if (request.status === 'Assigned') request.status = 'En Route';
  else if (request.status === 'En Route') {
    request.status = 'Collected';
    // Free up the team
    const team = teams.find(t => t.name === request.team_name);
    if (team) team.status = 'available';
  }

  res.json({ id: request.id, status: request.status });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});

export default app;
