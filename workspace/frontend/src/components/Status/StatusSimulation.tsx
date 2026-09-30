import React, { useState } from 'react';
import type { ComplaintItem, PickupRequestItem, ComplaintStatus, PickupStatus } from '../../types/cleanconnect';
import {
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Truck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface StatusSimulationProps {
  complaints: ComplaintItem[];
  pickupRequests: PickupRequestItem[];
  onAdvanceComplaint: (id: string) => Promise<void>;
  onAdvancePickup: (id: string) => Promise<void>;
  actionLoadingId: string | null;
}

const COMPLAINT_STAGES: ComplaintStatus[] = ['Reported', 'Assigned', 'Resolved'];
const PICKUP_STAGES: PickupStatus[] = ['Requested', 'Assigned', 'En Route', 'Collected'];

export const StatusSimulation: React.FC<StatusSimulationProps> = ({
  complaints,
  pickupRequests,
  onAdvanceComplaint,
  onAdvancePickup,
  actionLoadingId,
}) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'pickups'>('complaints');

  return (
    <section
      aria-labelledby="status-simulation-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5"
    >
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <div>
          <h2
            id="status-simulation-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            4. Live Status Simulation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Advance state of active reports &amp; municipal pickup requests
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Simulation categories"
          className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'complaints'}
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'complaints'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Complaints ({complaints.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pickups'}
            onClick={() => setActiveTab('pickups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'pickups'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Pickups ({pickupRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Content for Complaints */}
      {activeTab === 'complaints' && (
        <div aria-live="polite" className="space-y-3">
          {complaints.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">
              No complaints filed yet. File a complaint in Section 2 to test status advance.
            </p>
          ) : (
            complaints.map((comp) => {
              const stageIndex = COMPLAINT_STAGES.indexOf(comp.status);
              const isResolved = comp.status === 'Resolved';
              const isLoading = actionLoadingId === comp.id;

              return (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{comp.id}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {comp.category ?? 'Unclassified'}
                      </span>
                      {isResolved && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved (+25 pts)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                      {comp.description}
                    </p>

                    {/* Stage visual track */}
                    <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                      {COMPLAINT_STAGES.map((stg, i) => {
                        const passed = i <= stageIndex;
                        const isCurrent = i === stageIndex;
                        return (
                          <React.Fragment key={stg}>
                            <span
                              className={`px-2 py-0.5 rounded font-medium ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : passed
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                              }`}
                            >
                              {stg}
                            </span>
                            {i < COMPLAINT_STAGES.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advance Button */}
                  <div className="sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isResolved || isLoading}
                      onClick={() => onAdvanceComplaint(comp.id)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isResolved
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 shadow-sm'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : isResolved ? (
                        <span>Max Stage Reached</span>
                      ) : (
                        <>
                          <span>Advance Status</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    {!isResolved && (
                      <span className="block text-[10px] text-slate-400 text-center mt-1">
                        PATCH /api/complaints/{'{id}'}/advance
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Content for Pickups */}
      {activeTab === 'pickups' && (
        <div aria-live="polite" className="space-y-3">
          {pickupRequests.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">
              No pickup requests submitted yet. Click "Request Pickup" in Section 3 to create one.
            </p>
          ) : (
            pickupRequests.map((pkp) => {
              const stageIndex = PICKUP_STAGES.indexOf(pkp.status);
              const isCollected = pkp.status === 'Collected';
              const isLoading = actionLoadingId === pkp.id;

              return (
                <div
                  key={pkp.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{pkp.id}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                        {pkp.team_name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {pkp.category}
                      </span>
                      {isCollected && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Collected (+20 pts)
                        </span>
                      )}
                    </div>

                    {/* Pickup Step Track */}
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] flex-wrap">
                      {PICKUP_STAGES.map((stg, i) => {
                        const passed = i <= stageIndex;
                        const isCurrent = i === stageIndex;
                        return (
                          <React.Fragment key={stg}>
                            <span
                              className={`px-2 py-0.5 rounded font-medium ${
                                isCurrent
                                  ? 'bg-blue-600 text-white font-bold'
                                  : passed
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                              }`}
                            >
                              {stg}
                            </span>
                            {i < PICKUP_STAGES.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advance Button */}
                  <div className="sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isCollected || isLoading}
                      onClick={() => onAdvancePickup(pkp.id)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCollected
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : isCollected ? (
                        <span>Pickup Complete</span>
                      ) : (
                        <>
                          <span>Advance Pickup</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    {!isCollected && (
                      <span className="block text-[10px] text-slate-400 text-center mt-1">
                        PATCH /api/pickup-requests/{'{id}'}/advance
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
