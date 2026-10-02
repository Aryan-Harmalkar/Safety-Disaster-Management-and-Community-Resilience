import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MapPin,
  FileText,
  Key,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { detectWaste, getActiveApiKey, setActiveApiKey } from "./geminiVision";
import { fileToBase64 } from "./fileUtils";
import { box2dToCss, categoryColor } from "./boxUtils";
import type { WasteItem, DetectionResult } from "./types";
import { useAppContext } from "../../context/AppContext";

type Status = "idle" | "loading" | "done" | "error";

interface WasteDetectorProps {
  onItemSelect?: (item: WasteItem) => void;
  className?: string;
  showPointsReward?: boolean;
}

export default function WasteDetector({
  onItemSelect,
  className = "",
  showPointsReward = true,
}: WasteDetectorProps) {
  const navigate = useNavigate();
  const { addPoints } = useAppContext();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [items, setItems] = useState<WasteItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [resultMeta, setResultMeta] = useState<DetectionResult | null>(null);

  // API Key management
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = getActiveApiKey();
    setApiKeyInput(key);
    setHasCustomKey(!!key);
  }, []);

  const handleSaveApiKey = () => {
    setActiveApiKey(apiKeyInput);
    setHasCustomKey(!!apiKeyInput.trim());
    setShowKeyModal(false);
    setError(null);
  };

  async function processImage(dataUrl: string, mimeType = "image/jpeg") {
    setStatus("loading");
    setError(null);
    setItems([]);
    setResultMeta(null);
    setImageUrl(dataUrl);

    try {
      const result = await detectWaste(dataUrl, mimeType);
      setItems(result.items);
      setResultMeta(result);
      setStatus("done");

      // Award points for AI scanning
      if (showPointsReward && result.items.length > 0) {
        addPoints(20, "Scanned waste with Gemini AI Vision");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Waste detection failed");
      setStatus("error");
    }
  }

  async function handleFile(file: File) {
    try {
      const base64 = await fileToBase64(file);
      await processImage(base64, file.type || "image/jpeg");
    } catch {
      setError("Failed to read image file");
      setStatus("error");
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setImageUrl(null);
    setItems([]);
    setStatus("idle");
    setError(null);
    setResultMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleReportWaste = (item: WasteItem) => {
    navigate("/user/complaint", {
      state: {
        prefillDescription: `Identified ${item.label} (${item.category}). ${
          item.is_contaminated ? `Contaminated with ${item.contaminant_type}. ` : ""
        }Recommended disposal: ${item.disposal_stream}.`,
        category: item.category,
        photoUrl: imageUrl,
      },
    });
  };

  const handleFindFacility = (item: WasteItem) => {
    navigate("/user/facility", {
      state: {
        category: item.category,
      },
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              AI Waste Vision Detector
            </h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Powered by <strong>Gemini 2.5 Flash Vision</strong>. Real-time multi-item bounding boxes,
            material classification, contamination verification, and bin routing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-lg border border-white/20 transition-colors"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasCustomKey ? "API Key Configured" : "Set Gemini API Key"}</span>
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Key className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-lg">Gemini API Key</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter your Google Gemini API key (<code className="text-emerald-600 dark:text-emerald-400">AIzaSy...</code>)
              for live cloud vision inferences.
            </p>
            <input
              type="password"
              placeholder="Enter Gemini API key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Box */}
      {!imageUrl && (
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl py-14 px-6 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-all text-center group shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <span className="text-slate-800 dark:text-slate-200 font-bold block text-base">
              Upload or drop a waste photo to classify
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Supports JPG, PNG, WebP — single items or complete waste piles
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            +20 CleanConnect Points on scan
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onInputChange}
            className="hidden"
          />
        </label>
      )}

      {/* Loading state */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-3">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Analyzing Waste with Gemini Vision...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Detecting objects, measuring boundaries, classifying materials, and checking contamination levels.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-red-800 dark:text-red-300 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Detection Error</p>
              <p className="font-mono bg-red-100 dark:bg-red-900/50 p-2 rounded text-[11px] break-all">
                {error}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-red-200 dark:border-red-900/60">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Update API Key</span>
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Scan Another Photo
            </button>
          </div>
        </div>
      )}

      {/* Visual Result with Bounding Boxes */}
      {imageUrl && status !== "loading" && status !== "error" && (
        <div className="space-y-4">
          {/* Status info bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Gemini 2.5 Flash Vision
              </span>
              {resultMeta?.rawLatencyMs && (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {resultMeta.rawLatencyMs}ms
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={reset}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Scan Another Image
            </button>
          </div>

          {/* Bounding Box Image Canvas */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md">
            <img
              src={imageUrl}
              alt="Uploaded waste"
              className="w-full block max-h-[500px] object-contain mx-auto"
            />
            {items.map((item, i) => {
              const box = box2dToCss(item.box_2d);
              const color = categoryColor(item.category);
              const active = hoveredIdx === i;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: box.left,
                    top: box.top,
                    width: box.width,
                    height: box.height,
                    border: `2.5px solid ${color}`,
                    background: active ? `${color}33` : "transparent",
                    transition: "all 120ms ease-out",
                    zIndex: active ? 20 : 10,
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onItemSelect?.(item)}
                  className="cursor-pointer group"
                >
                  <span
                    style={{ background: color }}
                    className="absolute -top-7 left-0 text-[11px] font-bold text-white px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1"
                  >
                    <span>{item.label}</span>
                    {item.is_contaminated && (
                      <span className="bg-amber-400 text-slate-900 text-[9px] px-1 py-0.2 rounded font-black">
                        CONTAMINATED
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Items breakdown list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Detected Waste Items ({items.length})
              </h3>
              <span className="text-xs text-slate-500">
                Hover a box or card to inspect
              </span>
            </div>

            {items.length === 0 && (
              <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No distinct waste items detected in this photo.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {items.map((item, i) => {
                const color = categoryColor(item.category);
                const active = hoveredIdx === i;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <h4 className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                          {item.label}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ background: color }}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {Math.round(item.confidence * 100)}% Match
                        </span>
                      </div>
                    </div>

                    {/* Contamination Alert */}
                    {item.is_contaminated ? (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            Contaminated ({item.contaminant_type || "Residue"}):
                          </span>{" "}
                          <span>{item.reason}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Clean material — suitable for standard segregation.</span>
                      </div>
                    )}

                    {/* Disposal stream */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Recommended Stream:{" "}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.disposal_stream}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleReportWaste(item)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFindFacility(item)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Find Facility</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
