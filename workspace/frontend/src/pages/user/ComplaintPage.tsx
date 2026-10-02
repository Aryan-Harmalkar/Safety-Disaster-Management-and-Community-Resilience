import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, MapPin, CheckCircle2, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';
import * as api from '../../services/cleanconnectApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function ComplaintPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const routerState = routerLocation.state as { prefillDescription?: string; photoUrl?: string; category?: string } | null;
  const { state, setLocation, addComplaint, addPoints, setNearestFacility } = useAppContext();

  const [description, setDescription] = useState(routerState?.prefillDescription || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(routerState?.photoUrl || null);
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>(routerState?.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{category: string, confidence: number} | null>(null);
  const [success, setSuccess] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const lat = state.currentLocation?.latitude ?? 15.4909;
  const lng = state.currentLocation?.longitude ?? 73.8278;
  const coords = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  // Mount/unmount mini-map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false
    }).setView(coords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapInstanceRef.current = map;

    const marker = L.marker(coords).addTo(map);
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map center and marker when coords change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(coords, 14);
    if (markerRef.current) {
      markerRef.current.setLatLng(coords);
    } else {
      markerRef.current = L.marker(coords).addTo(mapInstanceRef.current);
    }
  }, [coords]);

  // Use default coords if none set
  useEffect(() => {
    if (!state.currentLocation) {
      setLocation(15.4909, 73.8278);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. AI Classification
      const classification = await api.classifyWaste(description, photoUrl ? 'uploaded_photo.jpg' : null);
      const chosenCategory = (prefilledCategory || classification.category) as any;
      setClassificationResult({
        category: chosenCategory,
        confidence: classification.confidence,
      });

      // 2. Create Complaint
      const res = await api.createComplaint(
        coords[0],
        coords[1],
        description,
        chosenCategory
      );

      const newComplaint = {
        id: res.id,
        lat: coords[0],
        lng: coords[1],
        description,
        category: chosenCategory,
        status: res.status,
        created_at: res.created_at,
        photoPreviewUrl: photoUrl || undefined,
      };
      addComplaint(newComplaint);

      // 3. Award Points
      addPoints(10, `Filed waste complaint`);
      if (photoUrl) {
        addPoints(15, `AI photo classification bonus`);
      }

      // 4. Find Nearest Facility
      const nearest = await api.getNearestFacility(chosenCategory, coords[0], coords[1]);
      setNearestFacility(nearest);

      setSuccess(true);
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Complaint Logged!</h2>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6 text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Classification:</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{classificationResult?.category}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {(classificationResult?.confidence! * 100).toFixed(0)}% Match
              </span>
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              +{photoUrl ? 25 : 10} Points Earned!
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/user/status" className="block w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition">
              View Status
            </Link>
            <Link to="/user/facility" className="block w-full bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-500 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Request Pickup
            </Link>
            <Link to="/user" className="block w-full text-gray-500 dark:text-gray-400 font-medium py-2 mt-2">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">File Complaint</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-6">
        {/* Location Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <span>Location</span>
            </div>
            <Link to="/user/map" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Change
            </Link>
          </div>
          <div className="h-[150px] w-full relative bg-gray-200">
            <div ref={mapRef} className="absolute inset-0 z-0"></div>
          </div>
        </section>

        {/* Photo Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="text-gray-800 dark:text-white font-semibold mb-3">Add Photo (Optional)</h2>
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden h-48 border border-gray-200 dark:border-gray-700 bg-black">
              <img src={photoUrl} alt="Preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute top-2 right-2 bg-white/90 text-red-600 px-3 py-1 rounded-full text-sm font-bold shadow"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                <Camera className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Take Photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
              </label>
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Gallery</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          )}
          {!photoUrl && (
            <div className="mt-3 space-y-2">
              <Link
                to="/user/scan"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Gemini AI Waste Scanner (Auto-Detect & Contamination)</span>
              </Link>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Upload a photo for AI classification and earn +15 bonus points!
              </p>
            </div>
          )}
        </section>

        {/* Description Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="text-gray-800 dark:text-white font-semibold mb-3">Description</h2>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (prefilledCategory && e.target.value !== routerState?.prefillDescription) {
                setPrefilledCategory(undefined);
              }
            }}
            placeholder="E.g., Large pile of plastic bottles near the beach entrance..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[120px]"
            required
          />
        </section>

        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Analyzing & Submitting...</span>
          ) : (
            <span>Submit Complaint</span>
          )}
        </button>
      </form>

      {/* Accessibility aria-live region */}
      <div aria-live="polite" className="sr-only">
        {classificationResult && `AI classified waste as ${classificationResult.category} with ${(classificationResult.confidence * 100).toFixed(0)}% confidence`}
      </div>
    </main>
  );
};
