import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ComplaintItem, NearestFacilityResponse, PickupRequestItem } from '../../types/cleanconnect';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface GoaMapProps {
  selectedLocation: { lat: number; lng: number; label: string };
  locationMode: 'live' | 'manual';
  setLocationMode: (mode: 'live' | 'manual') => void;
  isLocating: boolean;
  locationError: string | null;
  onLiveLocationClick: () => void;
  onManualLocationSelect: (lat: number, lng: number, label?: string) => void;
  complaints: ComplaintItem[];
  pickupRequests: PickupRequestItem[];
  nearestFacility: NearestFacilityResponse | null;
}

// Preset popular Goa localities for quick navigation
const GOA_PRESETS = [
  { name: 'Panaji', lat: 15.4909, lng: 73.8278 },
  { name: 'Margao', lat: 15.2832, lng: 73.9856 },
  { name: 'Mapusa', lat: 15.5937, lng: 73.8142 },
  { name: 'Calangute', lat: 15.5439, lng: 73.7553 },
  { name: 'Vasco', lat: 15.3995, lng: 73.8122 },
];

export const GoaMap: React.FC<GoaMapProps> = ({
  selectedLocation,
  locationMode,
  setLocationMode,
  isLocating,
  locationError,
  onLiveLocationClick,
  onManualLocationSelect,
  complaints,
  pickupRequests,
  nearestFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const locationModeRef = useRef<'live' | 'manual'>(locationMode);

  locationModeRef.current = locationMode;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Goa (default Panaji)
    const map = L.map(mapContainerRef.current, {
      center: [selectedLocation.lat, selectedLocation.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click handler on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      // In manual mode, drop pin
      onManualLocationSelect(e.latlng.lat, e.latlng.lng, `Dropped Pin (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when selectedLocation changes significantly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 13, {
      animate: true,
    });
  }, [selectedLocation.lat, selectedLocation.lng]);

  // Redraw Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Current Selected User Pin
    const userPinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(2,132,199,0.3); animation:pulse 1.8s infinite;"></div>
          <div style="width:26px; height:26px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
      icon: userPinIcon,
      zIndexOffset: 1000,
    });
    userMarker.bindPopup(`
      <div style="font-family:sans-serif; padding:4px;">
        <strong style="color:#0284c7;">📍 Active Location</strong>
        <p style="margin:4px 0; font-size:12px; color:#475569;">${selectedLocation.label}</p>
        <span style="font-size:11px; color:#64748b;">${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</span>
      </div>
    `);
    layer.addLayer(userMarker);

    // 2. Complaint Markers
    complaints.forEach((comp) => {
      const statusColor =
        comp.status === 'Resolved'
          ? '#10b981'
          : comp.status === 'Assigned'
          ? '#f59e0b'
          : '#ef4444';
      const statusBadge =
        comp.status === 'Resolved'
          ? '🟢 Resolved'
          : comp.status === 'Assigned'
          ? '🟡 Assigned'
          : '🔴 Reported';

      const complaintIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:28px; height:28px; border-radius:50%; background:${statusColor}; border:2.5px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">
            ⚠️
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const compMarker = L.marker([comp.lat, comp.lng], { icon: complaintIcon });
      compMarker.bindPopup(`
        <div style="font-family:sans-serif; max-width:220px; padding:4px;">
          <strong style="font-size:13px; color:#0f172a;">Complaint #${comp.id}</strong>
          <div style="margin:4px 0;"><span style="font-size:11px; font-weight:600; padding:2px 6px; border-radius:4px; background:${statusColor}22; color:${statusColor};">${statusBadge}</span></div>
          <p style="margin:4px 0; font-size:12px; color:#334155;">${comp.description.slice(0, 90)}...</p>
          <div style="font-size:11px; color:#64748b;">Category: <strong>${comp.category ?? 'Unclassified'}</strong></div>
        </div>
      `);
      layer.addLayer(compMarker);
    });

    // 3. Nearest Facility Marker (if detected)
    if (nearestFacility) {
      const isEWaste = nearestFacility.type === 'E-Waste Center';
      const facilityColor = isEWaste ? '#7c3aed' : '#059669';
      const iconSymbol = isEWaste ? '⚡' : '♻️';

      const facilityIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:32px; height:32px; border-radius:8px; background:${facilityColor}; border:2.5px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            ${iconSymbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const facilityMarker = L.marker([nearestFacility.lat, nearestFacility.lng], {
        icon: facilityIcon,
        zIndexOffset: 800,
      });
      facilityMarker.bindPopup(`
        <div style="font-family:sans-serif; max-width:230px; padding:4px;">
          <div style="font-size:11px; font-weight:bold; color:${facilityColor}; text-transform:uppercase;">Nearest ${nearestFacility.type}</div>
          <strong style="font-size:13px; color:#0f172a;">${nearestFacility.name}</strong>
          <p style="margin:4px 0; font-size:12px; color:#475569;">Distance: <strong>${nearestFacility.distance_km} km</strong></p>
        </div>
      `);
      layer.addLayer(facilityMarker);
    }

    // 4. Pickup Team Markers
    pickupRequests.forEach((pkp) => {
      const truckIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="width:28px; height:28px; border-radius:50%; background:#2563eb; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px;">
            🚛
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const teamMarker = L.marker([pkp.team_lat, pkp.team_lng], { icon: truckIcon });
      teamMarker.bindPopup(`
        <div style="font-family:sans-serif; max-width:210px; padding:4px;">
          <strong style="font-size:12px; color:#2563eb;">🚛 ${pkp.team_name}</strong>
          <div style="font-size:11px; margin-top:2px; color:#475569;">Pickup Request #${pkp.id}</div>
          <div style="font-size:11px; margin-top:2px;">Status: <strong>${pkp.status}</strong></div>
        </div>
      `);
      layer.addLayer(teamMarker);
    });
  }, [selectedLocation, complaints, nearestFacility, pickupRequests]);

  return (
    <section
      aria-labelledby="map-section-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      {/* Map Header / Location Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="map-section-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            1. Goa Interactive Map &amp; Geo-Locator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select waste location in Goa via browser GPS or click anywhere on the map
          </p>
        </div>

        {/* Toggle Mode: Live Location vs Enter Location Manually */}
        <div
          role="radiogroup"
          aria-label="Location input mode"
          className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            role="radio"
            aria-checked={locationMode === 'live'}
            onClick={() => {
              setLocationMode('live');
              onLiveLocationClick();
            }}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              locationMode === 'live'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Use Live Location</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={locationMode === 'manual'}
            onClick={() => setLocationMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              locationMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Enter Location Manually</span>
          </button>
        </div>
      </div>

      {/* Selected Coordinates & Quick Presets */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Selected Pin:</span>
          <code className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </code>
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs">
            ({selectedLocation.label})
          </span>
        </div>

        {/* Quick Goa Town presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Goa Quick Jump:</span>
          {GOA_PRESETS.map((town) => (
            <button
              key={town.name}
              type="button"
              onClick={() => onManualLocationSelect(town.lat, town.lng, `${town.name}, Goa`)}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
            >
              {town.name}
            </button>
          ))}
        </div>
      </div>

      {/* Location Error alert if any */}
      {locationError && (
        <div
          role="alert"
          className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-80 sm:h-96">
        <div
          ref={mapContainerRef}
          aria-label="Map of Goa showing waste complaints and recycling facilities"
          role="region"
          className="w-full h-full"
        />

        {/* Floating Legend / Quick Map Key */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-[11px] flex flex-col gap-1">
          <div className="font-semibold text-slate-700 dark:text-slate-300">Map Legend:</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">Current Pin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">Reported Complaint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">Resolved / Facility</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span className="text-slate-600 dark:text-slate-400">Pickup Team</span>
          </div>
        </div>
      </div>
    </section>
  );
};
