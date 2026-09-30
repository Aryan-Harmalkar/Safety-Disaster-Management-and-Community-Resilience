import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Navigation, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';
import * as api from '../../services/cleanconnectApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function FacilityPage() {
  const navigate = useNavigate();
  const { state, addPickupRequest } = useAppContext();
  const { nearestFacility, pickupRequests, currentLocation } = state;
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !nearestFacility || !currentLocation) return;
    
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false
      }).setView([currentLocation.latitude, currentLocation.longitude], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
      
      // User marker
      L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(mapInstanceRef.current);
      
      // Facility marker (blue)
      const facilityIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="bg-blue-600 text-white rounded-full p-2 border-2 border-white shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });
      
      L.marker([nearestFacility.lat, nearestFacility.lng], { icon: facilityIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(nearestFacility.name);

      // Fit bounds to show both
      const bounds = L.latLngBounds([
        [currentLocation.latitude, currentLocation.longitude],
        [nearestFacility.lat, nearestFacility.lng]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [nearestFacility, currentLocation]);

  const handleRequestPickup = async () => {
    if (!nearestFacility || !currentLocation) return;
    
    setIsRequesting(true);
    try {
      const res = await api.createPickupRequest(
        'general' as any,
        currentLocation.latitude,
        currentLocation.longitude
      );
      
      addPickupRequest({
        id: res.id,
        team_name: res.team_name,
        team_lat: res.team_lat,
        team_lng: res.team_lng,
        status: res.status,
        category: 'general' as any,
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        created_at: new Date().toISOString()
      });
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Failed to request pickup");
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Requested': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Assigned': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'En Route': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Collected': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Nearest Facility</h1>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {!nearestFacility ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 mt-10">
            <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Facility Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              File a complaint first so we can locate the nearest processing facility to your location.
            </p>
            <Link to="/user/complaint" className="inline-block bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition">
              File Complaint
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="h-48 w-full relative bg-gray-200">
                <div ref={mapRef} className="absolute inset-0 z-0"></div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{nearestFacility.name}</h2>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded">
                    {nearestFacility.type.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                  <Navigation className="h-4 w-4" />
                  <span>{nearestFacility.distance_km.toFixed(1)} km away</span>
                  <span>•</span>
                  <span>Est. arrival: 30-45 mins</span>
                </div>

                {showSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Pickup request sent successfully!
                  </div>
                ) : (
                  <button
                    onClick={handleRequestPickup}
                    disabled={isRequesting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow transition-colors flex justify-center items-center gap-2"
                  >
                    <Truck className="h-5 w-5" />
                    {isRequesting ? 'Requesting...' : 'Request Pickup'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Requests</h3>
                <Link to="/user/status" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">View All</Link>
              </div>
              
              {pickupRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent pickup requests.</p>
              ) : (
                <div className="space-y-3">
                  {pickupRequests.slice(0, 3).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">ID: {req.id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
