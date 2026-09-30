import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';
import { STATIC_LEADERBOARD } from '../../services/mock/cleanconnectData';
import { LeaderboardEntry } from '../../types/cleanconnect';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const fullLeaderboard = useMemo(() => {
    const currentUserEntry: LeaderboardEntry & { rank?: number } = {
      id: 'current-user',
      name: 'You',
      points: state.points,
      tier: state.tier,
      tierBadge: state.tierBadge,
      ward: 'Current Ward',
      rank: 0
    };

    const combined = [...STATIC_LEADERBOARD, currentUserEntry];
    combined.sort((a, b) => b.points - a.points);
    
    // Assign ranks
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [state.points, state.tier, state.tierBadge]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <span className="text-2xl" title="1st Place">🥇</span>;
      case 2: return <span className="text-2xl" title="2nd Place">🥈</span>;
      case 3: return <span className="text-2xl" title="3rd Place">🥉</span>;
      default: return <span className="text-gray-500 font-bold px-2">{rank}</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🥉';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-emerald-600 dark:bg-emerald-800 text-white shadow-sm p-4 flex items-center relative z-10">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-900">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Leaderboard</h1>
      </header>

      {/* Decorative top section */}
      <div className="bg-emerald-600 dark:bg-emerald-800 pt-6 pb-12 px-6 rounded-b-3xl shadow-md text-center text-white relative z-0 -mt-1">
        <Trophy className="h-16 w-16 mx-auto mb-2 text-yellow-300 drop-shadow-md" />
        <h2 className="text-2xl font-bold">Top Eco-Warriors</h2>
        <p className="text-emerald-100 flex items-center justify-center gap-2 mt-1">
          <Users className="h-4 w-4" />
          {fullLeaderboard.length} Citizens Participating
        </p>
      </div>

      <div className="px-4 max-w-lg mx-auto -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold w-16 text-center">Rank</th>
                  <th className="p-4 font-semibold">Citizen</th>
                  <th className="p-4 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {fullLeaderboard.map((entry) => {
                  const isCurrentUser = entry.id === 'current-user';
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className={`transition-colors ${isCurrentUser ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                    >
                      <td className="p-4 text-center align-middle">
                        {getRankBadge(entry.rank || 0)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg" title={`${entry.tier} Tier`}>{getTierBadge(entry.tier)}</span>
                          <div>
                            <p className={`font-bold ${isCurrentUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {entry.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{entry.ward}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-bold ${isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {entry.points}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
