import type { CitizenTier, LeaderboardEntry, NearestFacilityResponse, WasteCategory } from '../../types/cleanconnect';

export interface GoaFacility {
  name: string;
  lat: number;
  lng: number;
  type: 'Recycling Plant' | 'E-Waste Center';
  categories: WasteCategory[];
}

export const GOA_FACILITIES: GoaFacility[] = [
  {
    name: 'Saligao Integrated Solid Waste Management Facility',
    lat: 15.5482,
    lng: 73.782,
    type: 'Recycling Plant',
    categories: ['Wet', 'Dry', 'Recyclable-Plastic', 'Recyclable-Paper', 'Recyclable-Metal', 'Recyclable-Glass'],
  },
  {
    name: 'Panaji City Material Recovery & Composting Center',
    lat: 15.494,
    lng: 73.819,
    type: 'Recycling Plant',
    categories: ['Wet', 'Dry', 'Recyclable-Plastic', 'Recyclable-Paper', 'Recyclable-Metal', 'Recyclable-Glass'],
  },
  {
    name: 'Cacora Integrated Waste Management Plant',
    lat: 15.2655,
    lng: 74.1284,
    type: 'Recycling Plant',
    categories: ['Wet', 'Dry', 'Recyclable-Plastic', 'Recyclable-Paper', 'Recyclable-Metal'],
  },
  {
    name: 'Bicholim E-Waste & Hazardous Safe Processing Hub',
    lat: 15.5925,
    lng: 73.954,
    type: 'E-Waste Center',
    categories: ['E-Waste', 'Hazardous'],
  },
  {
    name: 'Margao Municipal E-Waste & Electronics Depot',
    lat: 15.2832,
    lng: 73.9856,
    type: 'E-Waste Center',
    categories: ['E-Waste', 'Hazardous'],
  },
  {
    name: 'Porvorim E-Waste & Tech Disposal Center',
    lat: 15.5312,
    lng: 73.834,
    type: 'E-Waste Center',
    categories: ['E-Waste', 'Hazardous'],
  },
  {
    name: 'Vasco Green Recycling & Metal Salvage Plant',
    lat: 15.3995,
    lng: 73.8122,
    type: 'Recycling Plant',
    categories: ['Recyclable-Metal', 'Recyclable-Glass', 'Recyclable-Plastic', 'Dry'],
  },
];

export const GOA_COLLECTION_TEAMS = [
  { name: 'Goa Eco-Squad Alpha (North)', latOffset: 0.008, lngOffset: 0.006 },
  { name: 'Mandovi Rapid E-Waste Unit', latOffset: -0.007, lngOffset: 0.009 },
  { name: 'Zuari Clean Patrol Team 2', latOffset: 0.005, lngOffset: -0.008 },
  { name: 'Salcete Municipal Eco Crew', latOffset: -0.006, lngOffset: -0.007 },
];

export const STATIC_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    name: 'Sunita Kamat',
    points: 620,
    ward: 'Panaji Ward 4',
    tier: 'Platinum',
    tierBadge: '💎',
  },
  {
    id: 'lead-2',
    name: 'Devraj Sawant',
    points: 545,
    ward: 'Margao Ward 2',
    tier: 'Platinum',
    tierBadge: '💎',
  },
  {
    id: 'lead-3',
    name: 'Alisha D\'Souza',
    points: 480,
    ward: 'Calangute Ward 1',
    tier: 'Gold',
    tierBadge: '🥇',
  },
  {
    id: 'lead-4',
    name: 'Rohan Naik',
    points: 425,
    ward: 'Mapusa Ward 6',
    tier: 'Gold',
    tierBadge: '🥇',
  },
  {
    id: 'lead-5',
    name: 'Fatima Shaikh',
    points: 360,
    ward: 'Ponda Ward 3',
    tier: 'Gold',
    tierBadge: '🥇',
  },
  {
    id: 'lead-6',
    name: 'Vikram Prabhu',
    points: 290,
    ward: 'Porvorim Ward 2',
    tier: 'Silver',
    tierBadge: '🥈',
  },
  {
    id: 'lead-7',
    name: 'Maria Rodrigues',
    points: 235,
    ward: 'Vasco Ward 5',
    tier: 'Silver',
    tierBadge: '🥈',
  },
  {
    id: 'lead-8',
    name: 'Aniket Vernekar',
    points: 190,
    ward: 'Candolim Ward 3',
    tier: 'Silver',
    tierBadge: '🥈',
  },
  {
    id: 'lead-9',
    name: 'Pooja Gaonkar',
    points: 145,
    ward: 'Bicholim Ward 1',
    tier: 'Silver',
    tierBadge: '🥈',
  },
  {
    id: 'lead-10',
    name: 'Neil Fernandes',
    points: 110,
    ward: 'Morjim Ward 2',
    tier: 'Silver',
    tierBadge: '🥈',
  },
  {
    id: 'lead-11',
    name: 'Kavita Shet',
    points: 85,
    ward: 'Curchorem Ward 3',
    tier: 'Bronze',
    tierBadge: '🥉',
  },
  {
    id: 'lead-12',
    name: 'Joshua Lobo',
    points: 50,
    ward: 'Quepem Ward 4',
    tier: 'Bronze',
    tierBadge: '🥉',
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function findMockNearestFacility(
  category: WasteCategory,
  lat: number,
  lng: number
): NearestFacilityResponse {
  const isEWasteOrHazardous = category === 'E-Waste' || category === 'Hazardous';
  const targetType: 'Recycling Plant' | 'E-Waste Center' = isEWasteOrHazardous
    ? 'E-Waste Center'
    : 'Recycling Plant';

  const candidates = GOA_FACILITIES.filter((f) => f.type === targetType);
  const pool = candidates.length > 0 ? candidates : GOA_FACILITIES;

  let nearest = pool[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < pool.length; i++) {
    const dist = calculateDistanceKm(lat, lng, pool[i].lat, pool[i].lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = pool[i];
    }
  }

  return {
    name: nearest.name,
    lat: nearest.lat,
    lng: nearest.lng,
    distance_km: minDistance,
    type: targetType,
  };
}

export function getTierFromPoints(points: number): {
  tier: CitizenTier;
  tierBadge: string;
  nextTierPoints: number | null;
  progressPercent: number;
} {
  if (points >= 500) {
    return {
      tier: 'Platinum',
      tierBadge: '💎',
      nextTierPoints: null,
      progressPercent: 100,
    };
  }
  if (points >= 300) {
    return {
      tier: 'Gold',
      tierBadge: '🥇',
      nextTierPoints: 500,
      progressPercent: Math.min(100, Math.round(((points - 300) / 200) * 100)),
    };
  }
  if (points >= 100) {
    return {
      tier: 'Silver',
      tierBadge: '🥈',
      nextTierPoints: 300,
      progressPercent: Math.min(100, Math.round(((points - 100) / 200) * 100)),
    };
  }
  return {
    tier: 'Bronze',
    tierBadge: '🥉',
    nextTierPoints: 100,
    progressPercent: Math.min(100, Math.round((points / 100) * 100)),
  };
}
