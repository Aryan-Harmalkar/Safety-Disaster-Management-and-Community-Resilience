import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  MapPin,
  Crosshair,
  Check,
  Compass,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// Goa Town Presets
const GOA_TOWNS = [
  { name: 'Panaji (Capital)', coords: [15.4909, 73.8278] as [number, number] },
  { name: 'Margao (South)', coords: [15.2832, 73.9856] as [number, number] },
  { name: 'Mapusa (North)', coords: [15.5937, 73.8142] as [number, number] },
  { name: 'Calangute (Coast)', coords: [15.5439, 73.7553] as [number, number] },
  { name: 'Vasco da Gama', coords: [15.3995, 73.8122] as [number, number] },
  { name: 'Porvorim', coords: [15.5312, 73.834] as [number, number] },
  { name: 'Ponda', coords: [15.4011, 74.0156] as [number, number] },
];

function resolveGoaName(lat: number, lng: number): string {
  const landmarks = [
    { name: 'Panaji / Miramar Coast, Goa', lat: 15.4909, lng: 73.8278 },
    { name: 'Campal Municipal Area, Panaji', lat: 15.494, lng: 73.819 },
    { name: 'Porvorim Highway Corridor', lat: 15.5312, lng: 73.834 },
    { name: 'Calangute Beach Belt, North Goa', lat: 15.5439, lng: 73.7553 },
    { name: 'Mapusa Town Center', lat: 15.5937, lng: 73.8142 },
    { name: 'Margao Municipal Area, South Goa', lat: 15.2832, lng: 73.9856 },
    { name: 'Vasco Port Zone, Goa', lat: 15.3995, lng: 73.8122 },
    { name: 'Ponda Sub-district', lat: 15.4011, lng: 74.0156 },
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

export function LocationPickerPage() {
  const navigate = useNavigate();
  const { selectedLocation, setSelectedLocation, announce } = useAppContext();

  const [coords, setCoords] = useState<[number, number]>([
    selectedLocation.lat || 15.4909,
    selectedLocation.lng || 73.8278,
  ]);
  const [locationLabel, setLocationLabel] = useState<string>(
    selectedLocation.label || 'Panaji, Goa'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: coords,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom Draggable Pin
    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:38px; height:38px; border-radius:50%; background:rgba(16,185,129,0.3); animation:pulse 1.8s infinite;"></div>
          <div style="width:28px; height:28px; border-radius:50%; background:#059669; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const marker = L.marker(coords, { draggable: true, icon: pinIcon }).addTo(map);
    markerRef.current = marker;
    mapInstanceRef.current = map;

    const updatePin = (lat: number, lng: number) => {
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;
      const newCoords: [number, number] = [roundedLat, roundedLng];
      setCoords(newCoords);
      const name = resolveGoaName(roundedLat, roundedLng);
      setLocationLabel(`${name} (${roundedLat}, ${roundedLng})`);
      if (markerRef.current) {
        markerRef.current.setLatLng(newCoords);
      }
    };

    map.on('click', (e: L.LeafletMouseEvent) => {
      updatePin(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updatePin(pos.lat, pos.lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const jumpToTown = (newCoords: [number, number], townName: string) => {
    setCoords(newCoords);
    setLocationLabel(`${townName}, Goa`);
    setGeoError(null);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo(newCoords, 14, { duration: 1.2 });
      markerRef.current.setLatLng(newCoords);
    }
  };

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        const newCoords: [number, number] = [lat, lng];
        setCoords(newCoords);
        const label = `Live GPS (${lat}, ${lng})`;
        setLocationLabel(label);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo(newCoords, 15, { duration: 1.2 });
          markerRef.current.setLatLng(newCoords);
        }
        announce(`Live GPS acquired: Latitude ${lat}, Longitude ${lng}`);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          err.code === 1
            ? 'Location permission denied. Click anywhere on the map to place the pin manually.'
            : 'Live GPS signal timed out. Switched to Panaji, Goa coordinates.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirmLocation = () => {
    setSelectedLocation({
      lat: coords[0],
      lng: coords[1],
      label: locationLabel,
    });
    announce(`Location confirmed: ${locationLabel}`);
    navigate(-1);
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Pinpoint Waste Location on Map</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click anywhere on the map or drag the pin to set the exact incident or recycling spot in Goa
            </p>
          </div>
        </div>

        {/* Live GPS button */}
        <button
          type="button"
          onClick={useLiveLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My Live GPS'}</span>
        </button>
      </div>

      {/* Quick Town Jumps */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          Goa Town Jump:
        </span>
        {GOA_TOWNS.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => jumpToTown(t.coords, t.name)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0 transition-colors cursor-pointer"
          >
            {t.name}
          </button>
        ))}
      </div>

      {geoError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Full Interactive Leaflet Map Canvas */}
      <div className="relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div ref={mapRef} className="w-full h-full" />

        {/* Floating Instructions */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs max-w-xs pointer-events-none">
          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Drop-Pin</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Click anywhere on the map or drag the green pin to position the incident.
          </p>
        </div>
      </div>

      {/* Confirmation & Coordinate Readout Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Selected Spot Details
          </span>
          <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{locationLabel}</span>
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
            Latitude: <strong className="text-slate-800 dark:text-slate-200">{coords[0].toFixed(5)}° N</strong> • Longitude:{' '}
            <strong className="text-slate-800 dark:text-slate-200">{coords[1].toFixed(5)}° E</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmLocation}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Confirm This Location</span>
        </button>
      </div>
    </div>
  );
}
