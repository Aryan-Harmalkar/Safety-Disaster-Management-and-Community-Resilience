import React, { useState, useRef } from 'react';
import type { WasteCategory, ClassifyResponse } from '../../types/cleanconnect';
import {
  Camera,
  X,
  Sparkles,
  AlertTriangle,
  Send,
  MapPin,
} from 'lucide-react';

interface ComplaintFormProps {
  selectedLocation: { lat: number; lng: number; label: string };
  isSubmitting: boolean;
  onSubmit: (description: string, photoFile: File | null, photoDataUrl?: string) => Promise<void>;
  lastClassification: ClassifyResponse | null;
}

export const CATEGORY_METADATA: Record<
  WasteCategory,
  { label: string; icon: string; bg: string; text: string; border: string; desc: string }
> = {
  'Wet': {
    label: 'Wet / Organic Waste',
    icon: '🍏',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    desc: 'Biodegradable kitchen food, garden trimmings, leaves.',
  },
  'Dry': {
    label: 'Dry Waste',
    icon: '📦',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    desc: 'Mixed dry packaging, non-biodegradable debris.',
  },
  'Recyclable-Plastic': {
    label: 'Recyclable Plastic',
    icon: '🧴',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-800',
    desc: 'PET bottles, containers, clean packaging film.',
  },
  'Recyclable-Paper': {
    label: 'Recyclable Paper',
    icon: '📄',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    desc: 'Cardboard boxes, clean paper sheets, cartons.',
  },
  'Recyclable-Metal': {
    label: 'Recyclable Metal',
    icon: '🥫',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    desc: 'Beverage cans, tin boxes, iron scrap, foil.',
  },
  'Recyclable-Glass': {
    label: 'Recyclable Glass',
    icon: '🍾',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-800',
    desc: 'Glass bottles, jars, unbroken glassware.',
  },
  'E-Waste': {
    label: 'Electronic Waste (E-Waste)',
    icon: '⚡',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    desc: 'Laptops, mobile devices, circuits, chargers, batteries.',
  },
  'Hazardous': {
    label: 'Hazardous Waste',
    icon: '☣️',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    desc: 'Chemicals, paints, medical waste, pesticides.',
  },
};

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  selectedLocation,
  isSubmitting,
  onSubmit,
  lastClassification,
}) => {
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setPhotoFile(file);
    setFormError(null);

    // FileReader preview only (no remote upload)
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
      setFormError('Please enter a short description of the waste or hazard.');
      return;
    }

    setFormError(null);
    await onSubmit(description.trim(), photoFile, photoPreview ?? undefined);

    // Reset description and photo
    setDescription('');
    handleRemovePhoto();
  };

  return (
    <section
      aria-labelledby="complaint-form-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-col justify-between"
    >
      <div>
        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h2
              id="complaint-form-heading"
              className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
              2. File a Waste Complaint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add photo preview &amp; AI will automatically classify waste category
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            +10 to +25 pts
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Location read-out */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Incident Location (from Map):</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs">
              <span className="text-slate-900 dark:text-slate-100 font-mono font-medium">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[200px]">
                {selectedLocation.label}
              </span>
            </div>
          </div>

          {/* Description text field */}
          <div>
            <label
              htmlFor="waste-description"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Waste Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="waste-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g., Overflowing plastic bottles and discarded electronics near beach entrance..."
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              required
              aria-required="true"
            />
          </div>

          {/* Single Photo Upload & Preview */}
          <div>
            <label
              htmlFor="photo-upload"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Photo Preview <span className="text-slate-400 font-normal">(Optional — +15 AI points)</span>
            </label>

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/40"
              >
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="sr-only"
                />
                <Camera className="w-6 h-6 mx-auto text-slate-400 dark:text-slate-500 mb-1" aria-hidden="true" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Click to select photo
                </p>
                <p className="text-[11px] text-slate-400">Single photo preview only (client-side)</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 flex items-center gap-3">
                <img
                  src={photoPreview}
                  alt="Waste complaint preview"
                  className="w-16 h-16 object-cover rounded-lg shadow-sm border border-slate-300 dark:border-slate-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {photoFile?.name ?? 'waste-photo.jpg'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" /> Ready for AI category classification
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  aria-label="Remove photo"
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Validation Error Message */}
          {formError && (
            <div role="alert" className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              {formError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Running AI Classification &amp; Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Submit Complaint &amp; Classify</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Classification Result Panel (aria-live="polite") */}
      <div
        aria-live="polite"
        className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800"
      >
        {lastClassification ? (
          <div
            className={`p-3 rounded-xl border ${
              CATEGORY_METADATA[lastClassification.category]?.bg ?? 'bg-slate-50'
            } ${CATEGORY_METADATA[lastClassification.category]?.border ?? 'border-slate-200'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                AI Classified Category
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(lastClassification.confidence * 100)}% match
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xl" role="img" aria-label={lastClassification.category}>
                {CATEGORY_METADATA[lastClassification.category]?.icon ?? '♻️'}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {CATEGORY_METADATA[lastClassification.category]?.label ?? lastClassification.category}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {CATEGORY_METADATA[lastClassification.category]?.desc}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-[11px] text-slate-400 dark:text-slate-500">
            Submit a complaint above to see the AI classification and nearest Goa facility.
          </div>
        )}
      </div>
    </section>
  );
};
