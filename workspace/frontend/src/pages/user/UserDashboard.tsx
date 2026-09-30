import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Trophy,
  Activity,
  Star,
  Gift,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function UserDashboard() {
  const {
    citizenName,
    setCitizenName,
    points,
    tierInfo,
    pointHistory,
    complaints,
    pickupRequests,
    selectedLocation,
  } = useAppContext();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(citizenName);

  const handleNameSave = () => {
    if (tempName.trim()) {
      setCitizenName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Profile Hero Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Sparkles className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-3xl shadow">
              {tierInfo.tierBadge}
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/50 border border-emerald-300/30 text-emerald-100">
                Goa Citizen Portal
              </span>

              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-emerald-800 text-white font-bold text-xl px-2 py-0.5 rounded border border-emerald-300 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleNameSave}
                    className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h1
                  onClick={() => {
                    setTempName(citizenName);
                    setIsEditingName(true);
                  }}
                  className="text-2xl sm:text-3xl font-black tracking-tight cursor-pointer hover:text-emerald-100 flex items-center gap-2 mt-1"
                  title="Click to edit your name"
                >
                  {citizenName}
                  <span className="text-xs font-normal text-emerald-200 underline">edit</span>
                </h1>
              )}

              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                <span>Active Location: {selectedLocation.label}</span>
                <Link to="/user/map" className="underline font-semibold ml-1 text-white hover:text-emerald-200">
                  (Change on Map)
                </Link>
              </p>
            </div>
          </div>

          {/* Points Highlight */}
          <Link
            to="/user/points"
            className="flex items-center gap-3 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/25 px-5 py-3 rounded-2xl transition-all shadow-sm"
          >
            <div>
              <div className="text-xs text-emerald-100 font-medium">Eco Balance</div>
              <div className="text-2xl font-black text-white">{points} pts</div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-200" />
          </Link>
        </div>

        {/* Tier Progress Bar */}
        {tierInfo.nextTierPoints && (
          <div className="mt-6 pt-4 border-t border-emerald-500/40">
            <div className="flex justify-between text-xs text-emerald-100 font-medium mb-1.5">
              <span>{tierInfo.tier} Citizen Tier</span>
              <span>
                {points} / {tierInfo.nextTierPoints} pts to next tier ({tierInfo.progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-emerald-900/40 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${tierInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid (Includes Pinpoint Location on Map) */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Quick Civic Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Pinpoint Location on Map (Explicitly requested by user) */}
          <Link
            to="/user/map"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500 dark:border-slate-800 dark:hover:border-emerald-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Pinpoint Map</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Pick GPS Spot</span>
            </div>
          </Link>

          {/* 2. File Complaint */}
          <Link
            to="/user/complaint"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-rose-500/20 hover:border-rose-500 dark:border-slate-800 dark:hover:border-rose-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">File Complaint</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">AI Photo + Report</span>
            </div>
          </Link>

          {/* 3. Track Status */}
          <Link
            to="/user/status"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-amber-500/20 hover:border-amber-500 dark:border-slate-800 dark:hover:border-amber-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Track Status</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Live Simulation</span>
            </div>
          </Link>

          {/* 4. Find Facility */}
          <Link
            to="/user/facility"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-blue-500/20 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Nearest Facility</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Request Pickup</span>
            </div>
          </Link>

          {/* 5. Leaderboard */}
          <Link
            to="/user/leaderboard"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-purple-500/20 hover:border-purple-500 dark:border-slate-800 dark:hover:border-purple-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Leaderboard</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Goa Rankings</span>
            </div>
          </Link>

          {/* 6. Redeem Rewards */}
          <Link
            to="/user/redeem"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-teal-500/20 hover:border-teal-500 dark:border-slate-800 dark:hover:border-teal-500 shadow-sm flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Redeem Points</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Eco Rewards</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Section: Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Recent Eco Points Activity</span>
            </h3>
            <Link to="/user/points" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              View all &rarr;
            </Link>
          </div>

          {pointHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No activity recorded yet. Start by reporting waste or recycling!
            </p>
          ) : (
            <div className="space-y-2.5">
              {pointHistory.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{event.reason}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{event.timestamp}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                    +{event.pointsAdded} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Counter Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Civic Impact</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {complaints.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                  Complaints
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {pickupRequests.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                  Pickups
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/user/complaint"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Report Waste Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
