import { useState, useEffect, useCallback } from 'react';
import type {
  ComplaintItem,
  PickupRequestItem,
  WasteCategory,
  NearestFacilityResponse,
  ClassifyResponse,
} from '../types/cleanconnect';
import {
  classifyWaste as apiClassifyWaste,
  createComplaint as apiCreateComplaint,
  getNearestFacility as apiGetNearestFacility,
  createPickupRequest as apiCreatePickupRequest,
  advanceComplaintStatus as apiAdvanceComplaintStatus,
  advancePickupStatus as apiAdvancePickupStatus,
} from '../services/cleanconnectApi';
import { getTierFromPoints } from '../services/mock/cleanconnectData';

const LOCAL_STORAGE_KEY_USER = 'cleanconnect_user_v1';
const LOCAL_STORAGE_KEY_COMPLAINTS = 'cleanconnect_complaints_v1';
const LOCAL_STORAGE_KEY_PICKUPS = 'cleanconnect_pickups_v1';

export interface PointEvent {
  id: string;
  reason: string;
  pointsAdded: number;
  timestamp: string;
}

export function useCleanConnect() {
  // 1. Citizen Profile & Points state
  const [citizenName, setCitizenName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return 'Aryan Fernandes';
  });

  const [points, setPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.points === 'number') return parsed.points;
      }
    } catch {}
    return 65; // Initial welcoming balance in Bronze tier
  });

  const [pointHistory, setPointHistory] = useState<PointEvent[]>(() => [
    {
      id: 'init-1',
      reason: 'Welcome Civic Eco Bonus',
      pointsAdded: 65,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // 2. Map & Location state
  // Default centered on Panaji, Goa: lat 15.4909, lng 73.8278
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  }>({
    lat: 15.4909,
    lng: 73.8278,
    label: 'Panaji, Goa (Default Center)',
  });
  const [locationMode, setLocationMode] = useState<'live' | 'manual'>('live');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 3. Complaints and Pickup list
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Initial sample complaint in Goa
    return [
      {
        id: 'CMP-GOA-101',
        lat: 15.4925,
        lng: 73.8235,
        description: 'Discarded beverage plastic bottles and packaging near Miramar beach road.',
        category: 'Recyclable-Plastic',
        status: 'Assigned',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ];
  });

  const [pickupRequests, setPickupRequests] = useState<PickupRequestItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PICKUPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'PKP-GOA-201',
        team_name: 'Goa Eco-Squad Alpha (North)',
        team_lat: 15.501,
        team_lng: 73.832,
        status: 'En Route',
        category: 'E-Waste',
        lat: 15.494,
        lng: 73.822,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
  });

  // 4. Latest dynamic action states
  const [lastClassification, setLastClassification] = useState<ClassifyResponse | null>(null);
  const [nearestFacility, setNearestFacility] = useState<NearestFacilityResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRequestingPickup, setIsRequestingPickup] = useState<boolean>(false);
  const [statusActionId, setStatusActionId] = useState<string | null>(null);

  // 5. Accessibility announcement state
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>(
    'CleanConnect Goa ready. Center set to Panaji, Goa.'
  );

  const announce = useCallback((message: string) => {
    setLiveAnnouncement(message);
  }, []);

  // Persist user and data
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_USER,
        JSON.stringify({ name: citizenName, points })
      );
    } catch {}
  }, [citizenName, points]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    } catch {}
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PICKUPS, JSON.stringify(pickupRequests));
    } catch {}
  }, [pickupRequests]);

  // Points incrementer with event log
  const awardPoints = useCallback((amount: number, reason: string) => {
    setPoints((prev) => {
      const next = prev + amount;
      return next;
    });
    setPointHistory((prev) => [
      {
        id: `pts-${Date.now()}-${Math.random()}`,
        reason,
        pointsAdded: amount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 9),
    ]);
  }, []);

  // Geolocation handler
  const fetchLiveLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      announce('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    announce('Locating your position in Goa...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setSelectedLocation({
          lat,
          lng,
          label: `Live GPS (${lat}, ${lng})`,
        });
        setIsLocating(false);
        announce(`Live location acquired: Latitude ${lat}, Longitude ${lng}`);
      },
      (err) => {
        setIsLocating(false);
        // If permission denied or unavailable in sandbox/headless, keep default Goa coords
        const msg =
          err.code === 1
            ? 'Location permission denied. You can click on the map to drop a pin.'
            : 'Live GPS signal timed out. Switched to Panaji, Goa coordinates.';
        setLocationError(msg);
        announce(msg);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [announce]);

  // Manual location selection
  const setManualLocation = useCallback(
    (lat: number, lng: number, label?: string) => {
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;
      setSelectedLocation({
        lat: roundedLat,
        lng: roundedLng,
        label: label ?? `Pin dropped at ${roundedLat}, ${roundedLng}`,
      });
      setLocationError(null);
      announce(`Pin placed at Latitude ${roundedLat}, Longitude ${roundedLng}`);
    },
    [announce]
  );

  // File a complaint flow
  const submitComplaint = useCallback(
    async (
      description: string,
      photoFile: File | null,
      photoDataUrl?: string
    ) => {
      setIsSubmitting(true);
      announce('Analyzing waste details and classifying category...');

      let category: WasteCategory = 'Dry';
      let classified: ClassifyResponse | null = null;

      // 1. Call POST /api/classify
      try {
        classified = await apiClassifyWaste(description, photoFile ? photoFile.name : null);
        category = classified.category;
        setLastClassification(classified);

        // Point rule: AI-classify a photo: +15
        if (photoFile) {
          awardPoints(15, `AI classified photo as ${category} (+15 pts)`);
        }
      } catch (err) {
        console.error('Classification error:', err);
      }

      // 2. Call POST /api/complaints
      let createdComplaintItem: ComplaintItem | null = null;
      try {
        const complaintResp = await apiCreateComplaint(
          selectedLocation.lat,
          selectedLocation.lng,
          description,
          category
        );

        createdComplaintItem = {
          id: complaintResp.id,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          description,
          category,
          status: complaintResp.status,
          created_at: complaintResp.created_at,
          photoPreviewUrl: photoDataUrl,
        };

        // Add to visible complaint list
        setComplaints((prev) => [createdComplaintItem!, ...prev]);

        // Point rule: File complaint: +10
        awardPoints(10, `Filed waste complaint #${complaintResp.id} (+10 pts)`);
        announce(
          `Complaint filed successfully with status Reported. Category identified as ${category}. 10 civic points awarded!`
        );
      } catch (err) {
        console.error('Complaint creation error:', err);
      }

      // 3. Call POST /api/nearest-facility for this category and location
      try {
        const facilityResp = await apiGetNearestFacility(
          category,
          selectedLocation.lat,
          selectedLocation.lng
        );
        setNearestFacility(facilityResp);

        if (createdComplaintItem) {
          setComplaints((prev) =>
            prev.map((c) =>
              c.id === createdComplaintItem!.id ? { ...c, facilityInfo: facilityResp } : c
            )
          );
        }
        announce(
          `Nearest facility found: ${facilityResp.name}, ${facilityResp.distance_km} km away.`
        );
      } catch (err) {
        console.error('Facility search error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedLocation, awardPoints, announce]
  );

  // Request Pickup Flow
  const requestPickup = useCallback(
    async (categoryOverride?: WasteCategory) => {
      const category = categoryOverride ?? lastClassification?.category ?? 'E-Waste';
      setIsRequestingPickup(true);
      announce(`Submitting pickup request for ${category}...`);

      try {
        const resp = await apiCreatePickupRequest(
          category,
          selectedLocation.lat,
          selectedLocation.lng
        );

        const newPickup: PickupRequestItem = {
          id: resp.id,
          team_name: resp.team_name,
          team_lat: resp.team_lat,
          team_lng: resp.team_lng,
          status: resp.status,
          category,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          created_at: new Date().toISOString(),
        };

        setPickupRequests((prev) => [newPickup, ...prev]);
        announce(
          `Pickup request created! Assigned to ${resp.team_name}. Status: Requested.`
        );
      } catch (err) {
        console.error('Pickup request error:', err);
      } finally {
        setIsRequestingPickup(false);
      }
    },
    [lastClassification, selectedLocation, announce]
  );

  // Advance Complaint Status
  const advanceComplaint = useCallback(
    async (id: string) => {
      setStatusActionId(id);
      try {
        const resp = await apiAdvanceComplaintStatus(id);
        setComplaints((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              const prevStatus = c.status;
              const nextStatus = resp.status;
              // Point rule: Complaint resolved: +25
              if (prevStatus !== 'Resolved' && nextStatus === 'Resolved') {
                awardPoints(25, `Complaint #${id} marked Resolved (+25 pts)`);
                announce(`Complaint #${id} is now Resolved! 25 civic points awarded.`);
              } else {
                announce(`Complaint #${id} advanced to ${nextStatus}.`);
              }
              return { ...c, status: nextStatus };
            }
            return c;
          })
        );
      } catch (err) {
        console.error('Advance complaint error:', err);
      } finally {
        setStatusActionId(null);
      }
    },
    [awardPoints, announce]
  );

  // Advance Pickup Status
  const advancePickup = useCallback(
    async (id: string) => {
      setStatusActionId(id);
      try {
        const resp = await apiAdvancePickupStatus(id);
        setPickupRequests((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              const prevStatus = p.status;
              const nextStatus = resp.status;
              // Point rule: E-waste pickup completed: +20
              if (prevStatus !== 'Collected' && nextStatus === 'Collected') {
                awardPoints(20, `Pickup #${id} completed & collected (+20 pts)`);
                announce(`Pickup #${id} completed and collected! 20 civic points awarded.`);
              } else {
                announce(`Pickup #${id} advanced to ${nextStatus}.`);
              }
              return { ...p, status: nextStatus };
            }
            return p;
          })
        );
      } catch (err) {
        console.error('Advance pickup error:', err);
      } finally {
        setStatusActionId(null);
      }
    },
    [awardPoints, announce]
  );

  const tierInfo = getTierFromPoints(points);

  return {
    citizenName,
    setCitizenName,
    points,
    pointHistory,
    tierInfo,
    selectedLocation,
    locationMode,
    setLocationMode,
    isLocating,
    locationError,
    fetchLiveLocation,
    setManualLocation,
    complaints,
    pickupRequests,
    lastClassification,
    nearestFacility,
    isSubmitting,
    isRequestingPickup,
    statusActionId,
    submitComplaint,
    requestPickup,
    advanceComplaint,
    advancePickup,
    liveAnnouncement,
    announce,
  };
}
