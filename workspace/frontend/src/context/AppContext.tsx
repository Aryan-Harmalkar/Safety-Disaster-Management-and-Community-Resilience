import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type {
  ComplaintItem,
  PickupRequestItem,
  ClassifyResponse,
  NearestFacilityResponse,
  CitizenTier,
} from '../types/cleanconnect';
import { getTierFromPoints } from '../services/mock/cleanconnectData';

export type UserRole = 'user' | 'collector' | null;

export interface PointHistoryItem {
  id: string;
  reason: string;
  pointsAdded: number;
  points?: number; // Alias for compatibility with components accessing event.points
  timestamp: string;
}

export interface SelectedLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface TierInfo {
  tier: CitizenTier;
  tierBadge: string;
  nextTierPoints: number | null;
  progressPercent: number;
}

export interface AppContextType {
  // 1. Role authentication & persistence
  role: UserRole;
  setRole: (role: UserRole) => void;
  logout: () => void;

  // 2. Citizen profile & points
  citizenName: string;
  setCitizenName: (name: string) => void;
  points: number;
  addPoints: (amount: number, reason: string) => void;
  pointHistory: PointHistoryItem[];
  tierInfo: TierInfo;

  // 3. Location state
  selectedLocation: SelectedLocation;
  setSelectedLocation: React.Dispatch<React.SetStateAction<SelectedLocation>>;

  // 4. Waste complaints
  complaints: ComplaintItem[];
  setComplaints: React.Dispatch<React.SetStateAction<ComplaintItem[]>>;

  // 5. Pickup requests
  pickupRequests: PickupRequestItem[];
  setPickupRequests: React.Dispatch<React.SetStateAction<PickupRequestItem[]>>;

  // 6. Classification & Facility
  lastClassification: ClassifyResponse | null;
  setLastClassification: React.Dispatch<React.SetStateAction<ClassifyResponse | null>>;
  nearestFacility: NearestFacilityResponse | null;
  setNearestFacility: React.Dispatch<React.SetStateAction<NearestFacilityResponse | null>>;

  // 7. Announcements / Screen reader live updates
  liveAnnouncement: string;
  announce: (msg: string) => void;

  // 8. Backward-compatible state slice and helpers
  state: {
    role: UserRole;
    citizenName: string;
    userName: string;
    points: number;
    pointHistory: PointHistoryItem[];
    tier: CitizenTier;
    tierBadge: string;
    currentLocation: {
      latitude: number;
      longitude: number;
      address: string;
    };
    selectedLocation: SelectedLocation;
    complaints: ComplaintItem[];
    pickupRequests: PickupRequestItem[];
    lastClassification: ClassifyResponse | null;
    nearestFacility: NearestFacilityResponse | null;
  };
  setLocation: (lat: number, lng: number, label?: string) => void;
  addComplaint: (complaint: ComplaintItem) => void;
  addPickupRequest: (request: PickupRequestItem) => void;
  updateComplaintStatus: (id: string, status: ComplaintItem['status']) => void;
  updatePickupStatus: (id: string, status: PickupRequestItem['status']) => void;
}

const LOCAL_STORAGE_KEY_ROLE = 'cleanconnect_role';
const LOCAL_STORAGE_KEY_USER = 'cleanconnect_user_v1';
const LOCAL_STORAGE_KEY_COMPLAINTS = 'cleanconnect_complaints_v1';
const LOCAL_STORAGE_KEY_PICKUPS = 'cleanconnect_pickups_v1';
const LOCAL_STORAGE_KEY_LOCATION = 'cleanconnect_location_v1';

const DEFAULT_LOCATION: SelectedLocation = {
  lat: 15.4909,
  lng: 73.8278,
  label: 'Panaji, Goa',
};

const DEFAULT_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'CMP-GOA-101',
    lat: 15.4925,
    lng: 73.8235,
    description: 'Discarded plastic bottles near Miramar beach',
    category: 'Recyclable-Plastic',
    status: 'Assigned',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const DEFAULT_PICKUPS: PickupRequestItem[] = [
  {
    id: 'PKP-GOA-201',
    team_name: 'Goa Eco-Squad Alpha',
    team_lat: 15.501,
    team_lng: 73.832,
    status: 'En Route',
    category: 'E-Waste',
    lat: 15.494,
    lng: 73.822,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // 1. Role state
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROLE);
      if (saved === 'user' || saved === 'collector') {
        return saved;
      }
    } catch (err) {
      console.error('Error loading role from localStorage:', err);
    }
    return null;
  });

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    try {
      if (newRole) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ROLE, newRole);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ROLE);
      }
    } catch (err) {
      console.error('Error saving role to localStorage:', err);
    }
  }, []);

  const logout = useCallback(() => {
    setRole(null);
  }, [setRole]);

  // 2. Citizen profile and points
  const [citizenName, setCitizenName] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Saurabh Chari';
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.name === 'string' &&
          parsed.name.trim() &&
          parsed.name !== 'Citizen of Goa' &&
          parsed.name !== 'Aryan Fernandes'
        ) {
          return parsed.name;
        }
      }
    } catch (err) {
      console.error('Error reading citizen user from localStorage:', err);
    }
    return 'Saurabh Chari';
  });

  const [points, setPoints] = useState<number>(() => {
    if (typeof window === 'undefined') return 65;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number' && !isNaN(parsed.points)) {
          return parsed.points;
        }
      }
    } catch (err) {
      console.error('Error reading citizen points from localStorage:', err);
    }
    return 65;
  });

  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([
    {
      id: 'init-1',
      reason: 'Welcome Civic Eco Bonus',
      pointsAdded: 65,
      points: 65,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Persist citizen name and points
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_USER,
        JSON.stringify({ name: citizenName, points })
      );
    } catch (err) {
      console.error('Failed to save citizen user to localStorage:', err);
    }
  }, [citizenName, points]);

  const addPoints = useCallback((amount: number, reason: string) => {
    setPoints((prev) => prev + amount);
    const newEntry: PointHistoryItem = {
      id: `pts-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reason,
      pointsAdded: amount,
      points: amount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPointHistory((prev) => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  const tierInfo = useMemo(() => getTierFromPoints(points), [points]);

  // 3. Location state
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCATION;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOCATION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading location from localStorage:', err);
    }
    return DEFAULT_LOCATION;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_LOCATION, JSON.stringify(selectedLocation));
    } catch (err) {
      console.error('Failed to save selected location to localStorage:', err);
    }
  }, [selectedLocation]);

  // 4. Complaints state
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_COMPLAINTS;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading complaints from localStorage:', err);
    }
    return DEFAULT_COMPLAINTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch (err) {
      console.error('Failed to save complaints to localStorage:', err);
    }
  }, [complaints]);

  // 5. Pickup requests state
  const [pickupRequests, setPickupRequests] = useState<PickupRequestItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_PICKUPS;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PICKUPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading pickup requests from localStorage:', err);
    }
    return DEFAULT_PICKUPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PICKUPS, JSON.stringify(pickupRequests));
    } catch (err) {
      console.error('Failed to save pickup requests to localStorage:', err);
    }
  }, [pickupRequests]);

  // 6. Classification & Nearest facility
  const [lastClassification, setLastClassification] = useState<ClassifyResponse | null>(null);
  const [nearestFacility, setNearestFacility] = useState<NearestFacilityResponse | null>(null);

  // 7. Announcements / Screen reader live updates
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>(
    'CleanConnect Goa ready. Center set to Panaji, Goa.'
  );

  const announce = useCallback((msg: string) => {
    setLiveAnnouncement(msg);
  }, []);

  // 8. Compatibility methods
  const setLocation = useCallback((lat: number, lng: number, label?: string) => {
    setSelectedLocation({
      lat,
      lng,
      label: label || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
  }, []);

  const addComplaint = useCallback((complaint: ComplaintItem) => {
    setComplaints((prev) => [complaint, ...prev]);
  }, []);

  const addPickupRequest = useCallback((request: PickupRequestItem) => {
    setPickupRequests((prev) => [request, ...prev]);
  }, []);

  const updateComplaintStatus = useCallback((id: string, status: ComplaintItem['status']) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  }, []);

  const updatePickupStatus = useCallback((id: string, status: PickupRequestItem['status']) => {
    setPickupRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }, []);

  const state = useMemo(
    () => ({
      role,
      citizenName,
      userName: citizenName,
      points,
      pointHistory,
      tier: tierInfo.tier,
      tierBadge: tierInfo.tierBadge,
      currentLocation: {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: selectedLocation.label,
      },
      selectedLocation,
      complaints,
      pickupRequests,
      lastClassification,
      nearestFacility,
    }),
    [
      role,
      citizenName,
      points,
      pointHistory,
      tierInfo.tier,
      tierInfo.tierBadge,
      selectedLocation,
      complaints,
      pickupRequests,
      lastClassification,
      nearestFacility,
    ]
  );

  const value = useMemo<AppContextType>(
    () => ({
      role,
      setRole,
      logout,
      citizenName,
      setCitizenName,
      points,
      addPoints,
      pointHistory,
      tierInfo,
      selectedLocation,
      setSelectedLocation,
      complaints,
      setComplaints,
      pickupRequests,
      setPickupRequests,
      lastClassification,
      setLastClassification,
      nearestFacility,
      setNearestFacility,
      liveAnnouncement,
      announce,
      state,
      setLocation,
      addComplaint,
      addPickupRequest,
      updateComplaintStatus,
      updatePickupStatus,
    }),
    [
      role,
      setRole,
      logout,
      citizenName,
      points,
      addPoints,
      pointHistory,
      tierInfo,
      selectedLocation,
      complaints,
      pickupRequests,
      lastClassification,
      nearestFacility,
      liveAnnouncement,
      announce,
      state,
      setLocation,
      addComplaint,
      addPickupRequest,
      updateComplaintStatus,
      updatePickupStatus,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
