import { useState, useEffect, useRef } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Navigation,
  Bell,
  Volume2,
  VolumeX,
  Compass,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/cleanconnectApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Goa Landmark Resolver for human-readable driver locations
function resolveGoaLocationName(lat: number, lng: number): string {
  const landmarks = [
    { name: 'Panaji Miramar Beach Belt', lat: 15.4909, lng: 73.8278 },
    { name: 'Campal Municipal Area, Panaji', lat: 15.494, lng: 73.819 },
    { name: 'Porvorim Assembly Highway', lat: 15.5312, lng: 73.834 },
    { name: 'Calangute - Baga Coast Road', lat: 15.5439, lng: 73.7553 },
    { name: 'Mapusa Municipal Market', lat: 15.5937, lng: 73.8142 },
    { name: 'Margao City Center, Salcete', lat: 15.2832, lng: 73.9856 },
    { name: 'Vasco da Gama Port Junction', lat: 15.3995, lng: 73.8122 },
    { name: 'Ponda Sub-district Depot', lat: 15.4011, lng: 74.0156 },
    { name: 'Bicholim Industrial Area', lat: 15.5925, lng: 73.954 },
  ];

  let closest = landmarks[0];
  let minDiff = Infinity;
  for (const lm of landmarks) {
    const diff = Math.hypot(lm.lat - lat, lm.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = lm;
    }
  }
  return closest.name;
}

// Haversine distance in km
function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Gentle pleasant civic audio chime for incoming driver notifications
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function CollectorDashboard() {
  const {
    complaints,
    setComplaints,
    pickupRequests,
    setPickupRequests,
    addPoints,
    announce,
  } = useAppContext();

  // Driver truck state
  const [driverName, setDriverName] = useState('Govind Naik (Driver)');
  const [isEditingName, setIsEditingName] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'pickups' | 'complaints'>('all');

  // Driver truck base GPS (Panaji municipal depot)
  const truckLocation = { lat: 15.495, lng: 73.83, name: 'Panaji Depot Alpha' };

  // Map references
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Active items:
  // Complaints that need driver action (Reported or Assigned)
  const activeComplaints = complaints.filter((c) => c.status !== 'Resolved');
  // Pickups that need driver collection (Requested, Assigned, En Route)
  const activePickups = pickupRequests.filter((p) => p.status !== 'Collected');

  const totalActiveTasks = activeComplaints.length + activePickups.length;
  const completedTodayCount =
    complaints.filter((c) => c.status === 'Resolved').length +
    pickupRequests.filter((p) => p.status === 'Collected').length;

  // Most recent unhandled notification
  const latestPending =
    activePickups.find((p) => p.status === 'Requested') ||
    activeComplaints.find((c) => c.status === 'Reported') ||
    activePickups[0] ||
    activeComplaints[0];

  // Sound chime when a new task is added
  const prevCountRef = useRef(totalActiveTasks);
  useEffect(() => {
    if (totalActiveTasks > prevCountRef.current && soundEnabled) {
      playChime();
    }
    prevCountRef.current = totalActiveTasks;
  }, [totalActiveTasks, soundEnabled]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [truckLocation.lat, truckLocation.lng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Map Bounds
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const bounds = L.latLngBounds([
      [truckLocation.lat, truckLocation.lng],
    ]);

    // 1. Driver Truck Marker
    const truckIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(37,99,235,0.3); animation:pulse 2s infinite;"></div>
          <div style="width:28px; height:28px; border-radius:50%; background:#2563eb; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">
            🚛
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const truckMarker = L.marker([truckLocation.lat, truckLocation.lng], {
      icon: truckIcon,
      zIndexOffset: 1000,
    }).addTo(layer);

    truckMarker.bindPopup(`
      <div style="font-family:sans-serif; padding:4px;">
        <strong style="color:#2563eb;">🚛 Your Driver Truck</strong>
        <p style="margin:3px 0; font-size:12px; color:#475569;">${driverName}</p>
        <span style="font-size:11px; color:#64748b;">${truckLocation.lat.toFixed(4)}, ${truckLocation.lng.toFixed(4)}</span>
      </div>
    `);

    // 2. Active Pickups Markers
    if (filterType === 'all' || filterType === 'pickups') {
      activePickups.forEach((pickup) => {
        if (!pickup.lat || !pickup.lng) return;
        bounds.extend([pickup.lat, pickup.lng]);

        const dist = distanceInKm(truckLocation.lat, truckLocation.lng, pickup.lat, pickup.lng);
        const locName = resolveGoaLocationName(pickup.lat, pickup.lng);

        const isRequested = pickup.status === 'Requested';
        const markerColor = isRequested ? '#0284c7' : '#7c3aed';

        const pickupIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="width:30px; height:30px; border-radius:8px; background:${markerColor}; border:2.5px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">
              📦
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(layer);
        m.bindPopup(`
          <div style="font-family:sans-serif; max-width:230px; padding:4px;">
            <div style="font-size:11px; font-weight:bold; color:${markerColor}; text-transform:uppercase;">
              Recycling Pickup (${pickup.status})
            </div>
            <strong style="font-size:13px; color:#0f172a;">${locName}</strong>
            <p style="margin:4px 0; font-size:12px; color:#475569;">Category: <strong>${pickup.category}</strong></p>
            <p style="margin:2px 0; font-size:11px; color:#64748b;">Distance: <strong>${dist} km</strong> from truck</p>
            <div style="margin-top:6px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; font-size:11px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">
                Turn-by-Turn GPS &rarr;
              </a>
            </div>
          </div>
        `);
      });
    }

    // 3. Active Complaints Markers
    if (filterType === 'all' || filterType === 'complaints') {
      activeComplaints.forEach((comp) => {
        if (!comp.lat || !comp.lng) return;
        bounds.extend([comp.lat, comp.lng]);

        const dist = distanceInKm(truckLocation.lat, truckLocation.lng, comp.lat, comp.lng);
        const locName = resolveGoaLocationName(comp.lat, comp.lng);

        const isReported = comp.status === 'Reported';
        const markerColor = isReported ? '#ef4444' : '#f59e0b';

        const compIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="width:30px; height:30px; border-radius:50%; background:${markerColor}; border:2.5px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">
              ⚠️
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const m = L.marker([comp.lat, comp.lng], { icon: compIcon }).addTo(layer);
        m.bindPopup(`
          <div style="font-family:sans-serif; max-width:240px; padding:4px;">
            <div style="font-size:11px; font-weight:bold; color:${markerColor}; text-transform:uppercase;">
              Citizen Complaint (${comp.status})
            </div>
            <strong style="font-size:13px; color:#0f172a;">${locName}</strong>
            <p style="margin:4px 0; font-size:12px; color:#475569;">${comp.description.slice(0, 90)}...</p>
            <p style="margin:2px 0; font-size:11px; color:#64748b;">Distance: <strong>${dist} km</strong> from truck</p>
            <div style="margin-top:6px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${comp.lat},${comp.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; font-size:11px; background:#ef4444; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">
                Turn-by-Turn GPS &rarr;
              </a>
            </div>
          </div>
        `);
      });
    }

    if (bounds.isValid() && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
    }
  }, [activePickups, activeComplaints, filterType]);

  // Center Map to a specific location
  const focusLocationOnMap = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  // Status handlers
  const handleAdvancePickup = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Collected') return;
    setActionLoadingId(id);
    try {
      const updated = await api.advancePickupStatus(id);
      setPickupRequests((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p))
      );
      if (updated.status === 'Collected') {
        addPoints(20, `Pickup #${id} completed & collected by driver`);
      }
      announce(`Pickup #${id} updated to ${updated.status}.`);
    } catch (error) {
      console.error('Failed to advance pickup', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdvanceComplaint = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Resolved') return;
    setActionLoadingId(id);
    try {
      const updated = await api.advanceComplaintStatus(id);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: updated.status } : c))
      );
      if (updated.status === 'Resolved') {
        addPoints(25, `Complaint #${id} cleared & resolved by driver`);
      }
      announce(`Complaint #${id} updated to ${updated.status}.`);
    } catch (error) {
      console.error('Failed to advance complaint', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Driver Profile & Notification Center Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Truck className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/50 border border-blue-300/30 text-blue-100">
                  Municipal Eco-Driver Portal
                </span>
                <span className="text-xs text-blue-200">Goa Sector 4</span>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="bg-blue-800 text-white font-bold text-xl px-2 py-0.5 rounded border border-blue-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-1 bg-white text-blue-800 font-bold rounded text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-2xl font-black tracking-tight cursor-pointer hover:text-blue-100 flex items-center gap-2 mt-0.5"
                  title="Click to edit driver name"
                >
                  {driverName}
                  <span className="text-xs font-normal text-blue-200 underline">edit</span>
                </h1>
              )}
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-200" />
                Active Truck Depot: <strong className="text-white">{truckLocation.name}</strong> ({truckLocation.lat.toFixed(4)}, {truckLocation.lng.toFixed(4)})
              </p>
            </div>
          </div>

          {/* Sound Toggle & Quick Refresh */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium transition-colors"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                  <span>Audio Alert ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-300" />
                  <span>Audio Alert OFF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE DISPATCH NOTIFICATION BANNER (The driver must be notified with proper location) */}
      {latestPending ? (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500 dark:border-amber-600 rounded-2xl p-4 sm:p-5 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow animate-bounce">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    🚨 INCOMING DISPATCH NOTIFICATION
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    ID: {'category' in latestPending ? latestPending.id : ''}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Location: {resolveGoaLocationName(latestPending.lat, latestPending.lng)}</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Coordinates:{' '}
                  <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-bold">
                    {latestPending.lat.toFixed(4)}° N, {latestPending.lng.toFixed(4)}° E
                  </code>{' '}
                  • Distance:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {distanceInKm(truckLocation.lat, truckLocation.lng, latestPending.lat, latestPending.lng)} km
                  </strong>{' '}
                  from your truck depot.
                </p>

                {'description' in latestPending && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-1 bg-white/70 dark:bg-slate-900/70 p-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                    "{latestPending.description}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions for Driver */}
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => focusLocationOnMap(latestPending.lat, latestPending.lng)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Focus Map</span>
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${latestPending.lat},${latestPending.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps GPS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All assigned Goa complaints and pickup requests are cleared. Standing by for new dispatches.</span>
          </div>
          <span className="font-mono text-[11px] font-bold">Driver Ready</span>
        </div>
      )}

      {/* 3. Shift Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Active Pickups
            </span>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {activePickups.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Pending Complaints
            </span>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {activeComplaints.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Completed Today
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {completedTodayCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Live Driver Route & Interactive Map */}
      <section
        aria-labelledby="driver-map-heading"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h2 id="driver-map-heading" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              Driver Route &amp; Incident Radar (Goa)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive map with live incident coordinates, turn-by-turn navigation, and waste category badges
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All ({totalActiveTasks})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pickups')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'pickups'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Pickups ({activePickups.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('complaints')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'complaints'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Complaints ({activeComplaints.length})
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative w-full h-80 sm:h-96">
          <div ref={mapRef} className="w-full h-full" />
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Map Legend:</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Driver Truck (You)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Reported Complaint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Assigned Complaint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Recycling Pickup</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Detailed Task Lists with Exact Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Pickups */}
        <section
          aria-labelledby="active-pickups-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 id="active-pickups-heading" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Active Recycling &amp; E-Waste Pickups</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {activePickups.length} Active
            </span>
          </div>

          {activePickups.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-6 text-center">
              No active pickups right now.
            </p>
          ) : (
            <div className="space-y-3">
              {activePickups.map((pickup) => {
                const dist = distanceInKm(truckLocation.lat, truckLocation.lng, pickup.lat, pickup.lng);
                const locName = resolveGoaLocationName(pickup.lat, pickup.lng);
                const isLoading = actionLoadingId === pickup.id;

                return (
                  <div
                    key={pickup.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            #{pickup.id}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            {pickup.category}
                          </span>
                        </div>

                        {/* Location Details for Driver */}
                        <div className="mt-2 space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{locName}</span>
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                            {pickup.lat.toFixed(4)}° N, {pickup.lng.toFixed(4)}° E •{' '}
                            <strong className="text-slate-800 dark:text-slate-200">{dist} km</strong> from depot
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ${
                          pickup.status === 'Requested'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : pickup.status === 'Assigned'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                        }`}
                      >
                        {pickup.status}
                      </span>
                    </div>

                    {/* Action Buttons for Driver */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => focusLocationOnMap(pickup.lat, pickup.lng)}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pin on Map</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS Nav</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAdvancePickup(pickup.id, pickup.status)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>
                              {pickup.status === 'Requested'
                                ? 'Accept Dispatch'
                                : pickup.status === 'Assigned'
                                ? 'Start Driving'
                                : 'Confirm Collected'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Assigned Complaints */}
        <section
          aria-labelledby="active-complaints-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 id="active-complaints-heading" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Reported Citizen Dumping Complaints</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {activeComplaints.length} Active
            </span>
          </div>

          {activeComplaints.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-6 text-center">
              No active complaints to clear. Great job!
            </p>
          ) : (
            <div className="space-y-3">
              {activeComplaints.map((comp) => {
                const dist = distanceInKm(truckLocation.lat, truckLocation.lng, comp.lat, comp.lng);
                const locName = resolveGoaLocationName(comp.lat, comp.lng);
                const isLoading = actionLoadingId === comp.id;

                return (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 border-l-4 border-l-amber-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            #{comp.id}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {comp.category ?? 'Unclassified'} Waste
                          </span>
                        </div>

                        {/* Location Details for Driver */}
                        <div className="mt-2 space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{locName}</span>
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                            {comp.lat.toFixed(4)}° N, {comp.lng.toFixed(4)}° E •{' '}
                            <strong className="text-slate-800 dark:text-slate-200">{dist} km</strong> from depot
                          </p>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          {comp.description}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ${
                          comp.status === 'Reported'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => focusLocationOnMap(comp.lat, comp.lng)}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pin on Map</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${comp.lat},${comp.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS Nav</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAdvanceComplaint(comp.id, comp.status)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>
                              {comp.status === 'Reported' ? 'Accept Dispatch' : 'Mark Resolved'}
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
