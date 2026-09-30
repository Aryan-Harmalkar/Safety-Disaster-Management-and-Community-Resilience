import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gift,
  Award,
  Zap,
  History,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function PointsPage() {
  const navigate = useNavigate();
  const { points, tierInfo, pointHistory } = useAppContext();

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
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Eco Points &amp; Citizen Tier Progress</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Earn points by reporting waste, verifying cleanups, and segregating recyclables in Goa
          </p>
        </div>
      </div>

      {/* Main Points Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-5xl mb-2">{tierInfo.tierBadge}</div>
          <h2 className="text-5xl font-black tracking-tight">{points}</h2>
          <p className="text-emerald-100 font-bold text-sm mt-1">{tierInfo.tier} Tier Citizen</p>

          <div className="w-full max-w-md bg-black/20 rounded-2xl p-4 mt-6 backdrop-blur-sm">
            <div className="flex justify-between text-xs font-semibold mb-2 text-emerald-100">
              <span>Current: {points} pts</span>
              <span>Next Goal: {tierInfo.nextTierPoints ? `${tierInfo.nextTierPoints} pts` : 'Max Tier'}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-3 rounded-full transition-all duration-700"
                style={{ width: `${tierInfo.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-200 text-right mt-1.5">
              {tierInfo.nextTierPoints
                ? `${tierInfo.nextTierPoints - points} points to tier advancement`
                : 'Top Platinum Citizen of Goa!'}
            </p>
          </div>

          <div className="mt-6 w-full max-w-md">
            <Link
              to="/user/redeem"
              className="flex items-center justify-center gap-2 w-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all text-xs"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Browse &amp; Redeem Eco Rewards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column: Point Rules & Point History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Point Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>How to Earn Points in Goa</span>
          </h3>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">File a Complaint</span>
                <span className="text-slate-500 text-[11px]">Pinpoint dumped waste on the map</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+10</span>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">AI Photo Classification</span>
                <span className="text-slate-500 text-[11px]">Upload photo preview for automated tagging</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+15</span>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Complaint Resolved</span>
                <span className="text-slate-500 text-[11px]">When municipal truck clears the site</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+25</span>
            </li>
            <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">E-Waste Pickup Completed</span>
                <span className="text-slate-500 text-[11px]">Driver collects verified electronic scrap</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+20</span>
            </li>
          </ul>
        </div>

        {/* Recent History Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Points Ledger &amp; History</span>
          </h3>

          {pointHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No points transactions recorded yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {pointHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.reason}</p>
                    <p className="text-[11px] text-slate-500">{item.timestamp}</p>
                  </div>
                  <span
                    className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg ${
                      item.pointsAdded >= 0
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                    }`}
                  >
                    {item.pointsAdded >= 0 ? `+${item.pointsAdded}` : item.pointsAdded} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
