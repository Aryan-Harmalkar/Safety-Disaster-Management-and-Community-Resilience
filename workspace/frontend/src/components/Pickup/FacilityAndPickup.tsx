import React from 'react';
import type { NearestFacilityResponse, PickupRequestItem, WasteCategory } from '../../types/cleanconnect';
import {
  Factory,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface FacilityAndPickupProps {
  nearestFacility: NearestFacilityResponse | null;
  activeCategory: WasteCategory | null;
  isRequestingPickup: boolean;
  onRequestPickup: (category?: WasteCategory) => Promise<void>;
  pickupRequests: PickupRequestItem[];
}

export const FacilityAndPickup: React.FC<FacilityAndPickupProps> = ({
  nearestFacility,
  activeCategory,
  isRequestingPickup,
  onRequestPickup,
  pickupRequests,
}) => {
  const currentCategory: WasteCategory = activeCategory ?? 'E-Waste';

  return (
    <section
      aria-labelledby="facility-pickup-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h2
              id="facility-pickup-heading"
              className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <Factory className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              3. Nearest Facility &amp; Request Pickup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct routing to certified Goa waste processing centers &amp; rapid dispatch
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            Goa Eco Grid
          </span>
        </div>

        {/* Nearest Facility Card (aria-live="polite") */}
        <div aria-live="polite" className="space-y-3">
          {nearestFacility ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      nearestFacility.type === 'E-Waste Center'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {nearestFacility.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {nearestFacility.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {nearestFacility.distance_km} <span className="text-xs font-normal">km</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">from pin</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {nearestFacility.lat.toFixed(4)}, {nearestFacility.lng.toFixed(4)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> GSPCB Certified Center
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center py-6">
              <Factory className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                No active category analyzed yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Submit a complaint or request pickup to locate nearest Goa plant
              </p>
            </div>
          )}
        </div>

        {/* Action Button: Request Pickup */}
        <div className="mt-4">
          <button
            type="button"
            disabled={isRequestingPickup}
            onClick={() => onRequestPickup(currentCategory)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRequestingPickup ? (
              <>
                <Clock className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Contacting Dispatch &amp; Assigning Team...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" aria-hidden="true" />
                <span>Request Civic Waste Pickup ({currentCategory})</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-1.5">
            Calls <code className="font-mono text-slate-600 dark:text-slate-300">POST /api/pickup-requests</code> with category &amp; lat/lng
          </p>
        </div>
      </div>

      {/* Latest Assigned Team Info if any */}
      {pickupRequests.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Active Dispatched Teams ({pickupRequests.length})
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {pickupRequests.slice(0, 2).map((pkp) => (
              <div
                key={pkp.id}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{pkp.team_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {pkp.id} • {pkp.category}
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {pkp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
