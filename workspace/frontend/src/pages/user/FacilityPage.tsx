import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  CheckCircle,
  Truck,
  Factory,
  ShieldCheck,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/cleanconnectApi';
import {
  GOA_FACILITIES,
  calculateDistanceKm,
  findMockNearestFacility,
} from '../../services/mock/cleanconnectData';
import type { WasteCategory, PickupRequestItem } from '../../types/cleanconnect';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const QUICK_TOWNS = [
  { name: 'Panaji', lat: 15.4909, lng: 73.8278 },
  { name: 'Margao', lat: 15.2832, lng: 73.9856 },
  { name: 'Mapusa', lat: 15.5937, lng: 73.8142 },
  { name: 'Calangute', lat: 15.5439, lng: 73.7553 },
  { name: 'Vasco', lat: 15.3995, lng: 73.8122 },
  { name: 'Porvorim', lat: 15.5312, lng: 73.834 },
  { name: 'Ponda', lat: 15.4011, lng: 74.0156 },
  { name: 'Bicholim', lat: 15.5925, lng: 73.954 },
];

export function FacilityPage() {
  const navigate = useNavigate();
  const {
    nearestFacility,
    setNearestFacility,
    pickupRequests,
    addPickupRequest,
    selectedLocation,
    setSelectedLocation,
    lastClassification,
    announce,
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState<WasteCategory>(
    lastClassification?.category ?? 'Recyclable-Plastic'
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLoadingFacility, setIsLoadingFacility] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const userLat = selectedLocation.lat || 15.4909;
  const userLng = selectedLocation.lng || 73.8278;

  // Recompute nearest facility whenever activeCategory or user location changes
  useEffect(() => {
    let isCancelled = false;
    async function loadFacility() {
      setIsLoadingFacility(true);
      try {
        const fac = await api.getNearestFacility(activeCategory, userLat, userLng);
        if (!isCancelled) {
          setNearestFacility(fac);
          announce(`Nearest facility updated to ${fac.name}, ${fac.distance_km} km away.`);
        }
      } catch {
        const fallback = findMockNearestFacility(activeCategory, userLat, userLng);
        if (!isCancelled) {
          setNearestFacility(fallback);
          announce(`Nearest facility: ${fallback.name}, ${fallback.distance_km} km away.`);
        }
      } finally {
        if (!isCancelled) setIsLoadingFacility(false);
      }
    }
    loadFacility();
    return () => {
      isCancelled = true;
    };
  }, [activeCategory, userLat, userLng]);

  // Leaflet map setup and marker update
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      markersGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    if (markersGroupRef.current && mapInstanceRef.current && nearestFacility) {
      markersGroupRef.current.clearLayers();

      // 1. User Location Pin (Blue)
      const userIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(2,132,199,0.3); animation:pulse 2s infinite;"></div>
            <div style="width:26px; height:26px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">
              📍
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(
        markersGroupRef.current
      );
      userMarker.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <strong style="color:#0284c7;">📍 Your Selected Spot</strong>
          <p style="margin:2px 0; font-size:11px; color:#475569;">${selectedLocation.label}</p>
          <span style="font-size:10px; color:#94a3b8;">${userLat.toFixed(4)}, ${userLng.toFixed(4)}</span>
        </div>
      `);

      // 2. Nearest Facility Pin (Emerald or Purple)
      const isEWaste = nearestFacility.type === 'E-Waste Center';
      const facColor = isEWaste ? '#7c3aed' : '#059669';
      const facilityIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:34px; height:34px; border-radius:10px; background:${facColor}; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            ${isEWaste ? '⚡' : '♻️'}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const facMarker = L.marker([nearestFacility.lat, nearestFacility.lng], {
        icon: facilityIcon,
      }).addTo(markersGroupRef.current);

      facMarker.bindPopup(`
        <div style="font-family:sans-serif; max-width:220px; padding:3px;">
          <span style="font-size:10px; font-weight:bold; color:${facColor}; text-transform:uppercase;">
            ${nearestFacility.type}
          </span>
          <strong style="font-size:13px; color:#0f172a; display:block; margin:2px 0;">
            ${nearestFacility.name}
          </strong>
          <p style="margin:2px 0; font-size:11px; color:#475569;">
            Distance: <strong>${nearestFacility.distance_km} km</strong> away
          </p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${nearestFacility.lat},${nearestFacility.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:5px; padding:3px 8px; font-size:10px; background:${facColor}; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">
            Directions &rarr;
          </a>
        </div>
      `);

      // 3. Connective route line
      L.polyline(
        [
          [userLat, userLng],
          [nearestFacility.lat, nearestFacility.lng],
        ],
        {
          color: facColor,
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.7,
        }
      ).addTo(markersGroupRef.current);

      // Fit bounds
      const bounds = L.latLngBounds([
        [userLat, userLng],
        [nearestFacility.lat, nearestFacility.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [nearestFacility, userLat, userLng, selectedLocation.label]);

  const handleSelectTown = (town: { name: string; lat: number; lng: number }) => {
    setSelectedLocation({
      lat: town.lat,
      lng: town.lng,
      label: `${town.name}, Goa`,
    });
  };

  const handleRequestPickup = async () => {
    setIsRequesting(true);
    announce(`Requesting pickup for ${activeCategory}...`);

    try {
      const resp = await api.createPickupRequest(activeCategory, userLat, userLng);
      const newPickup: PickupRequestItem = {
        id: resp.id,
        team_name: resp.team_name,
        team_lat: resp.team_lat,
        team_lng: resp.team_lng,
        status: resp.status,
        category: activeCategory,
        lat: userLat,
        lng: userLng,
        created_at: new Date().toISOString(),
      };

      addPickupRequest(newPickup);
      setSuccessToast(`Pickup requested! Dispatched ${resp.team_name}.`);
      announce(`Pickup requested successfully! Dispatched ${resp.team_name}.`);
      setTimeout(() => setSuccessToast(null), 4500);
    } catch (err) {
      console.error(err);
      alert('Failed to request pickup. Please check network.');
    } finally {
      setIsRequesting(false);
    }
  };

  const categories: WasteCategory[] = [
    'Recyclable-Plastic',
    'E-Waste',
    'Recyclable-Paper',
    'Recyclable-Metal',
    'Recyclable-Glass',
    'Wet',
    'Hazardous',
  ];

  // List all facilities of active type sorted by distance to show dynamic proximity
  const targetType =
    activeCategory === 'E-Waste' || activeCategory === 'Hazardous'
      ? 'E-Waste Center'
      : 'Recycling Plant';

  const otherFacilities = GOA_FACILITIES.filter((f) => f.type === targetType)
    .map((f) => ({
      ...f,
      distance: calculateDistanceKm(userLat, userLng, f.lat, f.lng),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            <span>Goa Waste Facilities &amp; Nearest Collection Plant</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically finds the closest authorized facility based on your location and waste type
          </p>
        </div>
      </div>

      {/* 1. LOCATION SWITCHER BAR (Allows changing location directly on this page) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">
              Your Current Location:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-800 dark:text-emerald-300">
              {selectedLocation.label}
            </span>
            <span className="font-mono text-slate-400 hidden sm:inline">
              ({userLat.toFixed(4)}, {userLng.toFixed(4)})
            </span>
          </div>

          <Link
            to="/user/map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Pick Exact GPS on Map &rarr;</span>
          </Link>
        </div>

        {/* Quick Town Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
            Switch Location:
          </span>
          {QUICK_TOWNS.map((town) => {
            const isCurrent =
              Math.hypot(town.lat - userLat, town.lng - userLng) < 0.03;

            return (
              <button
                key={town.name}
                type="button"
                onClick={() => handleSelectTown(town)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {town.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Waste Category Pills */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          Target Waste:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {successToast && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <Link to="/collector" className="underline font-bold text-emerald-700 dark:text-emerald-300">
            View Driver Dispatch &rarr;
          </Link>
        </div>
      )}

      {/* 3. Facility Card & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Dynamic Nearest Facility Details */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  nearestFacility?.type === 'E-Waste Center'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {nearestFacility?.type ?? 'Recycling Plant'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> GSPCB Certified
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Nearest Authorized Depot
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {isLoadingFacility ? (
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Locating closest plant...
                  </span>
                ) : (
                  nearestFacility?.name
                )}
              </h2>
            </div>

            {/* Dynamic Distance Box */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Straight-line Distance:
                </span>
                <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {nearestFacility ? `${nearestFacility.distance_km} km` : '...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  From:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedLocation.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Facility GPS:
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {nearestFacility ? `${nearestFacility.lat.toFixed(4)}, ${nearestFacility.lng.toFixed(4)}` : ''}
                </span>
              </div>
            </div>

            {nearestFacility && (
              <div className="mt-3 text-right">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestFacility.lat},${nearestFacility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  <span>Open Turn-by-Turn GPS Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              type="button"
              disabled={isRequesting || !nearestFacility}
              onClick={handleRequestPickup}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Dispatching Municipal Pickup Team...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Request Doorstep Pickup for {activeCategory}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Earn +20 civic points once pickup is marked collected by the municipal driver
            </p>
          </div>
        </div>

        {/* Right: Map view */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Route &amp; Depot Radar</span>
            </span>
            <span className="text-emerald-600 font-bold text-xs">
              {nearestFacility?.distance_km} km to nearest
            </span>
          </div>

          <div className="relative w-full h-80 sm:h-96">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* 4. Proximity Table of other Goa Facilities */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-emerald-600" />
              <span>All Goa {targetType}s Ranked by Proximity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by real-time distance from {selectedLocation.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {otherFacilities.map((fac, idx) => {
            const isClosest = idx === 0;

            return (
              <div
                key={fac.name}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 transition-all ${
                  isClosest
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-700 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                      isClosest
                        ? 'bg-emerald-600 text-white font-extrabold'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isClosest ? '⭐ Closest Facility' : `#${idx + 1}`}
                  </span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {fac.distance} km
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-xs pt-1">
                  {fac.name}
                </h4>

                <p className="text-[11px] text-slate-500 font-mono">
                  {fac.lat.toFixed(4)}, {fac.lng.toFixed(4)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active User Pickups List */}
      {pickupRequests.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Your Active Pickup Dispatches</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pickupRequests.map((pkp) => (
              <div
                key={pkp.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    #{pkp.id}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {pkp.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Assigned Vehicle: {pkp.team_name}
                </div>
                <div className="text-slate-500">
                  Category: <strong>{pkp.category}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
