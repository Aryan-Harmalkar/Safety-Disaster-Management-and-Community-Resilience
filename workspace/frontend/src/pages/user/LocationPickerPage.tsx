import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, MapPin, Navigation, Crosshair } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';

// Fix for default marker icon in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GOA_CENTER: [number, number] = [15.4909, 73.8278]; // Panaji

const TOWNS = [
  { name: 'Panaji', coords: [15.4909, 73.8278] as [number, number] },
  { name: 'Margao', coords: [15.2736, 73.9581] as [number, number] },
  { name: 'Mapusa', coords: [15.5937, 73.8105] as [number, number] },
  { name: 'Calangute', coords: [15.5494, 73.7626] as [number, number] },
  { name: 'Vasco', coords: [15.3981, 73.8111] as [number, number] },
];

export function LocationPickerPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const navigate = useNavigate();
  const { state, setLocation } = useAppContext();

  const [coords, setCoords] = useState<[number, number]>(
    state.currentLocation ? [state.currentLocation.latitude, state.currentLocation.longitude] : GOA_CENTER
  );
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(coords, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      markerRef.current = L.marker(coords, { draggable: true }).addTo(mapInstanceRef.current);

      // Handle map click
      mapInstanceRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
        setCoords(newCoords);
        if (markerRef.current) {
          markerRef.current.setLatLng(newCoords);
        }
      });

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        if (markerRef.current) {
          const pos = markerRef.current.getLatLng();
          setCoords([pos.lat, pos.lng]);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const flyTo = (newCoords: [number, number]) => {
    setCoords(newCoords);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo(newCoords, 14);
      markerRef.current.setLatLng(newCoords);
    }
  };

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        flyTo([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        setIsLocating(false);
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  const confirmLocation = () => {
    setLocation(coords[0], coords[1]);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center z-10 relative">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex-1">Pin Location</h1>
      </header>

      <div className="bg-white dark:bg-gray-800 p-3 shadow-sm z-10 relative">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={useLiveLocation}
            disabled={isLocating}
            className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            <Crosshair className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Live Location'}</span>
          </button>
          
          {TOWNS.map(town => (
            <button
              key={town.name}
              onClick={() => flyTo(town.coords)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {town.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 z-0"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden">
          {/* Fallback visual pin if marker logic fails */}
          <MapPin className="h-8 w-8 text-red-500 drop-shadow-md pb-4" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 relative">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Selected Coordinates</p>
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <Navigation className="h-5 w-5 text-emerald-500" />
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
              {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
            </span>
          </div>
        </div>
        
        <button
          onClick={confirmLocation}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors focus:ring-4 focus:ring-emerald-300"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
