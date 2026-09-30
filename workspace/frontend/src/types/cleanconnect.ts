export type WasteCategory =
  | 'Wet'
  | 'Dry'
  | 'Recyclable-Plastic'
  | 'Recyclable-Paper'
  | 'Recyclable-Metal'
  | 'Recyclable-Glass'
  | 'E-Waste'
  | 'Hazardous';

export type ComplaintStatus = 'Reported' | 'Assigned' | 'Resolved';

export type PickupStatus = 'Requested' | 'Assigned' | 'En Route' | 'Collected';

export interface ClassifyResponse {
  category: WasteCategory;
  confidence: number;
  source: 'ai' | 'fallback';
}

export interface NearestFacilityResponse {
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
  type: 'Recycling Plant' | 'E-Waste Center';
}

export interface ComplaintResponse {
  id: string;
  status: ComplaintStatus;
  created_at: string;
}

export interface PickupRequestResponse {
  id: string;
  team_name: string;
  team_lat: number;
  team_lng: number;
  status: PickupStatus;
}

export interface ComplaintItem {
  id: string;
  lat: number;
  lng: number;
  description: string;
  category: WasteCategory | null;
  status: ComplaintStatus;
  created_at: string;
  photoPreviewUrl?: string;
  facilityInfo?: NearestFacilityResponse;
}

export interface PickupRequestItem {
  id: string;
  team_name: string;
  team_lat: number;
  team_lng: number;
  status: PickupStatus;
  category: WasteCategory;
  lat: number;
  lng: number;
  created_at: string;
}

export type CitizenTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface CitizenProfile {
  name: string;
  points: number;
  tier: CitizenTier;
  tierBadge: string;
  resolvedComplaintsCount: number;
  classifiedPhotosCount: number;
  pickupsCompletedCount: number;
  complaintsFiledCount: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  ward: string;
  tier: CitizenTier;
  tierBadge: string;
}
