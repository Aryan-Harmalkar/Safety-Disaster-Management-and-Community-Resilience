import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Send,
  X,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/cleanconnectApi';
import type { ComplaintItem, WasteCategory, ClassifyResponse } from '../../types/cleanconnect';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function ComplaintPage() {
  const navigate = useNavigate();
  const {
    selectedLocation,
    addComplaint,
    addPoints,
    setNearestFacility,
    setLastClassification,
    announce,
  } = useAppContext();

  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassifyResponse | null>(null);
  const [successComplaint, setSuccessComplaint] = useState<ComplaintItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<L.Map | null>(null);

  const coords: [number, number] = [selectedLocation.lat || 15.4909, selectedLocation.lng || 73.8278];

  // Initialize mini-map
  useEffect(() => {
    if (!miniMapRef.current || miniMapInstance.current) return;

    const map = L.map(miniMapRef.current, {
      center: coords,
      zoom: 14,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="width:26px; height:26px; border-radius:50%; background:#ef4444; border:2.5px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px;">
          📍
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    L.marker(coords, { icon: pinIcon }).addTo(map);
    miniMapInstance.current = map;

    return () => {
      map.remove();
      miniMapInstance.current = null;
    };
  }, []);

  // Update mini-map when selectedLocation changes
  useEffect(() => {
    if (miniMapInstance.current) {
      miniMapInstance.current.setView(coords, 14);
    }
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setPhotoFile(file);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please provide a short description of the waste or dumping.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    announce('Analyzing waste image and classifying category...');

    try {
      // 1. POST /api/classify
      const classified = await api.classifyWaste(
        description.trim(),
        photoFile ? photoFile.name : null
      );
      setClassificationResult(classified);
      setLastClassification(classified);

      // Award +15 points for AI classify if photo provided
      if (photoFile) {
        addPoints(15, `AI photo classified as ${classified.category} (+15 pts)`);
      }

      // 2. POST /api/complaints
      const complaintResp = await api.createComplaint(
        coords[0],
        coords[1],
        description.trim(),
        classified.category
      );

      // 3. POST /api/nearest-facility
      let facilityInfo = undefined;
      try {
        const facility = await api.getNearestFacility(classified.category, coords[0], coords[1]);
        facilityInfo = facility;
        setNearestFacility(facility);
      } catch (err) {
        console.error('Facility search failed:', err);
      }

      const newComplaint: ComplaintItem = {
        id: complaintResp.id,
        lat: coords[0],
        lng: coords[1],
        description: description.trim(),
        category: classified.category as WasteCategory,
        status: complaintResp.status,
        created_at: complaintResp.created_at,
        photoPreviewUrl: photoPreview || undefined,
        facilityInfo,
      };

      addComplaint(newComplaint);
      // Award +10 points for filing complaint
      addPoints(10, `Filed waste complaint #${complaintResp.id} (+10 pts)`);

      setSuccessComplaint(newComplaint);
      announce(`Complaint #${complaintResp.id} submitted! Status: Reported. Category: ${classified.category}.`);
    } catch (err) {
      console.error('Submission failed', err);
      setFormError('Failed to submit complaint. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (successComplaint) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Complaint Registered
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Complaint #{successComplaint.id}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Status: <strong className="text-rose-600">Reported</strong> • Sent to Goa Municipal Driver Dispatch
          </p>
        </div>

        {/* AI Classification Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI Category:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {Math.round((classificationResult?.confidence ?? 0.9) * 100)}% Match
            </span>
          </div>

          <div className="text-base font-bold text-slate-900 dark:text-white">
            {successComplaint.category}
          </div>

          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
            +{photoPreview ? '25' : '10'} Total Eco Points Awarded!
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccessComplaint(null);
              setDescription('');
              handleRemovePhoto();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>File Another Complaint</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Title & Back */}
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
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>File a Waste Complaint</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit photo preview and description. AI categorizes waste and alerts local collection teams.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        {/* Incident Location Box with Mini-Map */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Incident Location:</span>
            </div>
            <Link
              to="/user/map"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Change Pin on Map</span>
            </Link>
          </div>

          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {selectedLocation.label}
          </div>

          {/* Mini Leaflet Preview */}
          <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div ref={miniMapRef} className="w-full h-full" />
            <Link
              to="/user/map"
              className="absolute inset-0 bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-center text-xs font-bold text-white transition-colors"
            >
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow">
                Click to Open Full Map &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <label htmlFor="complaint-desc" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Waste Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="complaint-desc"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="e.g., Overflowing plastic bags, cardboard, and broken electronics dumped near beach road..."
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        {/* Photo file input & preview */}
        <div>
          <label htmlFor="complaint-photo" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Photo Preview <span className="text-slate-400 font-normal">(Optional — +15 AI points)</span>
          </label>

          {!photoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-5 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer"
            >
              <input
                ref={fileInputRef}
                id="complaint-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="sr-only"
              />
              <Camera className="w-7 h-7 mx-auto text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to attach waste image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Client-side preview only (no remote server storage)
              </p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 flex items-center gap-3">
              <img
                src={photoPreview}
                alt="Waste preview"
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {photoFile?.name ?? 'waste-image.jpg'}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Ready for AI category classification
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                aria-label="Remove image"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {formError && (
          <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Running AI Classifier &amp; Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Complaint (+10 to +25 pts)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
