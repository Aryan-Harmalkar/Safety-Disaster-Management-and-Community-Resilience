import { useState, useEffect, useRef, useMemo } from 'react';
import { Truck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';
import * as api from '../../services/cleanconnectApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function CollectorDashboard() {
  const { state, setComplaints, setPickupRequests } = useAppContext();
  const [collectorName, setCollectorName] = useState('Govind (Driver)');
  const [isEditingName, setIsEditingName] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const activePickups = useMemo(
    () => state.pickupRequests.filter((p) => p.status !== 'Collected'),
    [state.pickupRequests]
  );
  const assignedComplaints = useMemo(
    () => state.complaints.filter((c) => c.status === 'Assigned'),
    [state.complaints]
  );
  const completedToday = useMemo(
    () =>
      state.pickupRequests.filter((p) => p.status === 'Collected').length +
      state.complaints.filter((c) => c.status === 'Resolved').length,
    [state.pickupRequests, state.complaints]
  );

  // Initialize Leaflet map on mount; clean up on unmount
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([15.4909, 73.8278], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Synchronize markers when activePickups or assignedComplaints change without rebuilding map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    // Add pickup markers (blue)
    const pickupIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="bg-blue-600 text-white rounded-full p-1.5 border-2 border-white shadow-md"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    activePickups.forEach((p) => {
      if (p.lat && p.lng) {
        L.marker([p.lat, p.lng], { icon: pickupIcon }).addTo(map);
        bounds.extend([p.lat, p.lng]);
      }
    });

    // Add complaint markers (amber/red)
    const complaintIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="bg-amber-500 text-white rounded-full p-1.5 border-2 border-white shadow-md"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    assignedComplaints.forEach((c) => {
      if (c.lat && c.lng) {
        L.marker([c.lat, c.lng], { icon: complaintIcon }).addTo(map);
        bounds.extend([c.lat, c.lng]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }, [activePickups, assignedComplaints]);

  const handleAdvancePickup = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Collected') return;
    try {
      const updated = await api.advancePickupStatus(id);
      setPickupRequests(prev => prev.map(p =>
        p.id === id ? { ...p, status: updated.status } : p
      ));
    } catch (error) {
      console.error("Failed", error);
    }
  };

  const handleResolveComplaint = async (id: string) => {
    try {
      const updated = await api.advanceComplaintStatus(id);
      setComplaints(prev => prev.map(c =>
        c.id === id ? { ...c, status: updated.status } : c
      ));
    } catch (error) {
      console.error("Failed", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-blue-100">Welcome,</h1>
            {isEditingName ? (
              <input
                type="text"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="bg-blue-700 text-white text-2xl font-bold px-2 py-1 rounded outline-none"
              />
            ) : (
              <h2
                className="text-2xl font-bold cursor-pointer hover:text-blue-100"
                onClick={() => setIsEditingName(true)}
              >
                {collectorName}
              </h2>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Truck className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 mb-6 grid grid-cols-3 gap-2 text-center divide-x divide-gray-100 dark:divide-gray-700">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activePickups.length}</p>
            <p className="text-xs text-gray-500 font-medium uppercase mt-1">Pickups</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{assignedComplaints.length}</p>
            <p className="text-xs text-gray-500 font-medium uppercase mt-1">Complaints</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500">{completedToday}</p>
            <p className="text-xs text-gray-500 font-medium uppercase mt-1">Done Today</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">

        {/* Map Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Live Route Map
            </h3>
          </div>
          <div className="h-48 w-full relative bg-gray-200">
            <div ref={mapRef} className="absolute inset-0 z-0"></div>
          </div>
        </section>

        {/* Pickups */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-500" /> Active Pickups
          </h3>

          {activePickups.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-4 bg-white dark:bg-gray-800 rounded-xl">No active pickups.</p>
          ) : (
            <div className="space-y-3">
              {activePickups.map(pickup => (
                <div key={pickup.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-500">ID: {pickup.id.substring(0,6)}</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mt-1">
                        Lat: {pickup.lat?.toFixed(4)}, Lng: {pickup.lng?.toFixed(4)}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                      {pickup.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdvancePickup(pickup.id, pickup.status)}
                    className="mt-3 w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold py-2 rounded-lg text-sm transition flex justify-center items-center gap-2 border border-blue-200 dark:border-blue-800"
                  >
                    {pickup.status === 'Requested' ? 'Accept Request' :
                     pickup.status === 'Assigned' ? 'Mark En Route' : 'Mark as Collected'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Complaints */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Assigned Complaints
          </h3>

          {assignedComplaints.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-4 bg-white dark:bg-gray-800 rounded-xl">No assigned complaints.</p>
          ) : (
            <div className="space-y-3">
              {assignedComplaints.map(complaint => (
                <div key={complaint.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-l-amber-500 border-y border-r border-gray-100 dark:border-gray-700">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded capitalize">
                      {complaint.category} Waste
                    </span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mt-2 line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResolveComplaint(complaint.id)}
                    className="mt-3 w-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-semibold py-2 rounded-lg text-sm transition flex justify-center items-center gap-2 border border-amber-200 dark:border-amber-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
