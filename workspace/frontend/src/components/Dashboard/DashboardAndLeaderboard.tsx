import React, { useState } from 'react';
import type { CitizenTier, LeaderboardEntry } from '../../types/cleanconnect';
import { STATIC_LEADERBOARD } from '../../services/mock/cleanconnectData';
import type { PointEvent } from '../../hooks/useCleanConnect';
import {
  Trophy,
  Award,
  Zap,
  History,
  MapPin,
} from 'lucide-react';

interface DashboardAndLeaderboardProps {
  citizenName: string;
  setCitizenName: (name: string) => void;
  points: number;
  tierInfo: {
    tier: CitizenTier;
    tierBadge: string;
    nextTierPoints: number | null;
    progressPercent: number;
  };
  pointHistory: PointEvent[];
}

export const DashboardAndLeaderboard: React.FC<DashboardAndLeaderboardProps> = ({
  citizenName,
  setCitizenName,
  points,
  tierInfo,
  pointHistory,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(citizenName);

  const handleNameSave = () => {
    if (tempName.trim()) {
      setCitizenName(tempName.trim());
    }
    setIsEditingName(false);
  };

  // Combine static leaderboard with the current user
  const currentUserEntry: LeaderboardEntry = {
    id: 'current-user-id',
    name: `${citizenName} (You)`,
    points,
    ward: 'Panaji Central (Your Ward)',
    tier: tierInfo.tier,
    tierBadge: tierInfo.tierBadge,
  };

  // Sorted list including current user
  const combinedLeaderboard = [...STATIC_LEADERBOARD, currentUserEntry]
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({
      ...item,
      calculatedRank: index + 1,
    }));

  return (
    <section
      aria-labelledby="dashboard-leaderboard-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
        <div>
          <h2
            id="dashboard-leaderboard-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
            5. Citizen Dashboard &amp; Goa Leaderboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client-side points calculation, tiers, and community eco rankings
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 font-semibold">
          <span>{tierInfo.tierBadge}</span>
          <span>{tierInfo.tier} Citizen</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Citizen Profile & Points Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Profile Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Citizen Profile (No Auth Gate)
              </span>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    setTempName(citizenName);
                    setIsEditingName(true);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Edit Name
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600/10 dark:bg-emerald-400/10 border-2 border-emerald-500 flex items-center justify-center text-xl shrink-0">
                {tierInfo.tierBadge}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="text-sm font-semibold px-2 py-1 border rounded bg-white dark:bg-slate-800 border-emerald-500 focus:outline-none w-full"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleNameSave}
                      className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {citizenName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Panaji Ward 4, Goa
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Points & Tier Meter */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Points</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {points}{' '}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      pts
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Current Tier</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1">
                    <span>{tierInfo.tierBadge}</span>
                    <span>{tierInfo.tier}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar to next tier */}
              {tierInfo.nextTierPoints && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress to next tier</span>
                    <span>
                      {points} / {tierInfo.nextTierPoints} pts ({tierInfo.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${tierInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Points Rules Box */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Client-Side Fixed Point Rules
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between">
                <span>• File a Complaint</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+10 pts</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• Complaint Resolved</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+25 pts</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• AI-Classify a Photo</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+15 pts</span>
              </li>
              <li className="flex items-center justify-between">
                <span>• E-Waste Pickup Completed</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+20 pts</span>
              </li>
            </ul>

            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">Tier Thresholds:</div>
              <div className="grid grid-cols-2 gap-1">
                <span>🥉 Bronze: &lt; 100</span>
                <span>🥈 Silver: 100–299</span>
                <span>🥇 Gold: 300–499</span>
                <span>💎 Platinum: 500+</span>
              </div>
            </div>
          </div>

          {/* Recent Point Activity Feed */}
          {pointHistory.length > 0 && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Point Activity</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {pointHistory.slice(0, 4).map((item) => {
                  const isPositive = item.pointsAdded >= 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        {item.reason}
                      </span>
                      <span
                        className={`font-mono font-semibold shrink-0 ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${item.pointsAdded}` : `-${Math.abs(item.pointsAdded)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Static Leaderboard Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Goa Community Leaderboard (Top Citizens)
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                12 Sample Citizens + You
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs" aria-label="Goa Citizen Eco Leaderboard">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th scope="col" className="py-2.5 px-3">Citizen</th>
                    <th scope="col" className="py-2.5 px-3">Ward / Village</th>
                    <th scope="col" className="py-2.5 px-3 text-center">Tier</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {combinedLeaderboard.slice(0, 10).map((row) => {
                    const isYou = row.id === 'current-user-id';
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isYou
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold border-l-4 border-l-emerald-600'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2 px-3 text-center font-mono font-semibold">
                          {row.calculatedRank === 1 ? '🥇' : row.calculatedRank === 2 ? '🥈' : row.calculatedRank === 3 ? '🥉' : `#${row.calculatedRank}`}
                        </td>
                        <td className="py-2 px-3">
                          <span className={isYou ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}>
                            {row.name}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {row.ward}
                        </td>
                        <td className="py-2 px-3 text-center text-sm" title={row.tier}>
                          {row.tierBadge}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Static mock leaderboard stored client-side for rapid demo evaluation.
          </div>
        </div>
      </div>
    </section>
  );
};
