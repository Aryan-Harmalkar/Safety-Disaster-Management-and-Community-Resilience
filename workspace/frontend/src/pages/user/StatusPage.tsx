import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  FileText,
  ChevronRight,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/cleanconnectApi';
import type { ComplaintStatus, PickupStatus } from '../../types/cleanconnect';

export function StatusPage() {
  const navigate = useNavigate();
  const {
    complaints,
    setComplaints,
    pickupRequests,
    setPickupRequests,
    addPoints,
    announce,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'complaints' | 'pickups'>('complaints');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdvanceComplaint = async (id: string, currentStatus: ComplaintStatus) => {
    if (currentStatus === 'Resolved') return;
    setLoadingId(id);
    try {
      const updated = await api.advanceComplaintStatus(id);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: updated.status } : c))
      );

      if (updated.status === 'Resolved') {
        addPoints(25, `Complaint #${id} resolved & verified (+25 pts)`);
        announce(`Complaint #${id} is now Resolved! 25 civic eco-points awarded.`);
      } else {
        announce(`Complaint #${id} advanced to ${updated.status}.`);
      }
    } catch (error) {
      console.error('Failed to advance complaint status:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdvancePickup = async (id: string, currentStatus: PickupStatus) => {
    if (currentStatus === 'Collected') return;
    setLoadingId(id);
    try {
      const updated = await api.advancePickupStatus(id);
      setPickupRequests((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p))
      );

      if (updated.status === 'Collected') {
        addPoints(20, `Pickup #${id} collected & recycled (+20 pts)`);
        announce(`Pickup #${id} collected! 20 civic eco-points awarded.`);
      } else {
        announce(`Pickup #${id} advanced to ${updated.status}.`);
      }
    } catch (error) {
      console.error('Failed to advance pickup status:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const complaintSteps: ComplaintStatus[] = ['Reported', 'Assigned', 'Resolved'];
  const pickupSteps: PickupStatus[] = ['Requested', 'Assigned', 'En Route', 'Collected'];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Civic Tracking &amp; Status Simulation</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real-time progress of your filed complaints and scheduled waste collections
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('complaints')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'complaints'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Complaints ({complaints.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pickups')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pickups'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pickups ({pickupRequests.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'complaints' ? (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No complaints registered yet
              </p>
              <Link
                to="/user/complaint"
                className="inline-block py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                File Your First Complaint
              </Link>
            </div>
          ) : (
            complaints.map((c) => {
              const currentIdx = complaintSteps.indexOf(c.status);
              const isResolved = c.status === 'Resolved';
              const isLoading = loadingId === c.id;

              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          #{c.id}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.category ?? 'Unclassified'}
                        </span>
                        {isResolved && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Resolved (+25 pts)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                        {c.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.lat?.toFixed(4)}, {c.lng?.toFixed(4)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isResolved || isLoading}
                      onClick={() => handleAdvanceComplaint(c.id, c.status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isResolved
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : isResolved ? (
                        <span>Resolved</span>
                      ) : (
                        <>
                          <span>Advance Status</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step Track */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
                    {complaintSteps.map((stg, i) => {
                      const isDone = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={stg} className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isCurrent
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : isDone
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {stg}
                          </span>
                          {i < complaintSteps.length - 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pickupRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <Truck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No pickup requests scheduled
              </p>
              <Link
                to="/user/facility"
                className="inline-block py-2 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Schedule Doorstep Pickup
              </Link>
            </div>
          ) : (
            pickupRequests.map((p) => {
              const currentIdx = pickupSteps.indexOf(p.status);
              const isCollected = p.status === 'Collected';
              const isLoading = loadingId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          #{p.id}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                          {p.category}
                        </span>
                        {isCollected && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Collected (+20 pts)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                        Assigned Vehicle: <strong className="text-blue-600 dark:text-blue-400">{p.team_name}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.lat?.toFixed(4)}, {p.lng?.toFixed(4)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isCollected || isLoading}
                      onClick={() => handleAdvancePickup(p.id, p.status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCollected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : isCollected ? (
                        <span>Collected</span>
                      ) : (
                        <>
                          <span>Advance Pickup</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step Track */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs flex-wrap">
                    {pickupSteps.map((stg, i) => {
                      const isDone = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={stg} className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isCurrent
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : isDone
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {stg}
                          </span>
                          {i < pickupSteps.length - 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
