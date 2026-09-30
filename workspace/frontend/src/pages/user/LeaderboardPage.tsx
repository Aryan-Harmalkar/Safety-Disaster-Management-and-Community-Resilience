import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Award } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { STATIC_LEADERBOARD } from '../../services/mock/cleanconnectData';
import type { LeaderboardEntry } from '../../types/cleanconnect';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { citizenName, points, tierInfo } = useAppContext();

  const fullLeaderboard = useMemo(() => {
    const currentUserEntry: LeaderboardEntry & { calculatedRank?: number } = {
      id: 'current-user',
      name: `${citizenName} (You)`,
      points,
      ward: 'Panaji Central (Your Ward)',
      tier: tierInfo.tier,
      tierBadge: tierInfo.tierBadge,
    };

    const combined = [...STATIC_LEADERBOARD, currentUserEntry];
    combined.sort((a, b) => b.points - a.points);

    return combined.map((entry, index) => ({
      ...entry,
      calculatedRank: index + 1,
    }));
  }, [citizenName, points, tierInfo]);

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
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Goa Community Eco Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rankings of citizens actively segregating, reporting, and recycling waste across Goa
          </p>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Official Goa Civic Rankings
            </span>
          </div>
          <span className="text-xs text-slate-500">12 Sample Citizens + You</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Goa Citizen Eco Leaderboard">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4 w-14 text-center">Rank</th>
                <th scope="col" className="py-3 px-4">Citizen</th>
                <th scope="col" className="py-3 px-4">Ward / Village</th>
                <th scope="col" className="py-3 px-4 text-center">Tier</th>
                <th scope="col" className="py-3 px-4 text-right">Eco Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fullLeaderboard.map((row) => {
                const isYou = row.id === 'current-user';
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isYou
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold border-l-4 border-l-emerald-600'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {row.calculatedRank === 1
                        ? '🥇'
                        : row.calculatedRank === 2
                        ? '🥈'
                        : row.calculatedRank === 3
                        ? '🥉'
                        : `#${row.calculatedRank}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={isYou ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {row.ward}
                    </td>
                    <td className="py-3 px-4 text-center text-sm" title={row.tier}>
                      {row.tierBadge}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
