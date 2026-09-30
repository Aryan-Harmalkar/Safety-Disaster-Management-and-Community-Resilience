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
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/cleanconnectApi';
import { findMockNearestFacility } from '../../services/mock/cleanconnectData';
import type { WasteCategory, PickupRequestItem } from '../../types/cleanconnect';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function FacilityPage() {
  const navigate = useNavigate();
  const {
    nearestFacility,
    setNearestFacility,
    pickupRequests,
    addPickupRequest,
    selectedLocation,
    lastClassification,
    announce,
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState<WasteCategory>(
    lastClassification?.category ?? 'E-Waste'
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const userLat = selectedLocation.lat || 15.4909;
  const userLng = selectedLocation.lng || 73.8278;

  // Compute facility for active category
  useEffect(() => {
    async function loadFacility() {
      try {
        const fac = await api.getNearestFacility(activeCategory, userLat, userLng);
        setNearestFacility(fac);
      } catch {
        const fallback = findMockNearestFacility(activeCategory, userLat, userLng);
        setNearestFacility(fallback);
      }
    }
    loadFacility();
  }, [activeCategory, userLat, userLng]);

  // Leaflet map setup
  useEffect(() => {
    if (!mapRef.current || !nearestFacility) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      markersGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    if (markersGroupRef.current && mapInstanceRef.current) {
      markersGroupRef.current.clearLayers();

      // User pin
      const userIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:26px; height:26px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px;">
            📍
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(markersGroupRef.current)
        .bindPopup('Your Current Location');

      // Facility pin
      const isEWaste = nearestFacility.type === 'E-Waste Center';
      const facColor = isEWaste ? '#7c3aed' : '#059669';
      const facilityIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:32px; height:32px; border-radius:8px; background:${facColor}; border:2.5px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            ${isEWaste ? '⚡' : '♻️'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([nearestFacility.lat, nearestFacility.lng], { icon: facilityIcon })
        .addTo(markersGroupRef.current)
        .bindPopup(`<strong>${nearestFacility.name}</strong><br/>${nearestFacility.type} • ${nearestFacility.distance_km} km`);

      const bounds = L.latLngBounds([
        [userLat, userLng],
        [nearestFacility.lat, nearestFacility.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [nearestFacility, userLat, userLng]);

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
    'E-Waste',
    'Recyclable-Plastic',
    'Recyclable-Paper',
    'Recyclable-Metal',
    'Recyclable-Glass',
    'Wet',
    'Hazardous',
  ];

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
            <span>Goa Waste Facilities &amp; Pickup Dispatch</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Locate certified Goa recycling plants &amp; request municipal doorstep collection
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
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
          <Link to="/user/status" className="underline font-bold text-emerald-700 dark:text-emerald-300">
            View Live Tracker &rarr;
          </Link>
        </div>
      )}

      {/* Facility Card + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Facility Details & Action */}
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

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
              {nearestFacility?.name ?? 'Saligao Waste Processing Plant'}
            </h2>

            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Distance from your location:</span>
                <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                  {nearestFacility?.distance_km ?? 4.2} km
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plant GPS Coordinates:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {nearestFacility?.lat.toFixed(4)}, {nearestFacility?.lng.toFixed(4)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              Certified eco-facility equipped for segregated solid waste processing, electronic component recovery, and safe hazardous neutralization in Goa.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              type="button"
              disabled={isRequesting}
              onClick={handleRequestPickup}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Dispatching Municipal Pickup Team...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Request Doorstep Pickup ({activeCategory})</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Earn +20 civic points once pickup is marked collected by the driver
            </p>
          </div>
        </div>

        {/* Right: Map view */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Route Preview to Facility</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {selectedLocation.label}
            </span>
          </div>

          <div className="relative w-full h-80 sm:h-96">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Active User Pickups List */}
      {pickupRequests.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Your Active Pickup Dispatches</span>
            </h3>
            <Link to="/user/status" className="text-xs font-semibold text-emerald-600 hover:underline">
              Advance in Status Simulator &rarr;
            </Link>
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
                  Assigned: {pkp.team_name}
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
