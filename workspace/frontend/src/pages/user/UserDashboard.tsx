import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Trophy, Activity, User } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';

export function UserDashboard() {
  const { state } = useAppContext();
  const [userName, setUserName] = useState('Goa Citizen');
  const [isEditingName, setIsEditingName] = useState(false);

  const { points, tier, pointHistory, complaints, pickupRequests } = state;

  const nextTierPoints = tier === 'Bronze' ? 100 : tier === 'Silver' ? 300 : tier === 'Gold' ? 500 : 1000;
  const progress = Math.min(100, Math.max(0, (points / nextTierPoints) * 100));
  const tierBadge = tier === 'Bronze' ? '🥉' : tier === 'Silver' ? '🥈' : tier === 'Gold' ? '🥇' : '💎';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white p-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-emerald-100">Welcome back,</h1>
            {isEditingName ? (
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="bg-emerald-700 text-white text-2xl font-bold px-2 py-1 rounded outline-none"
              />
            ) : (
              <h2
                className="text-2xl font-bold cursor-pointer hover:text-emerald-100"
                onClick={() => setIsEditingName(true)}
              >
                {userName}
              </h2>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8">
        <Link to="/user/points" className="block">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{tierBadge}</span>
              <span className="text-4xl font-bold text-gray-800 dark:text-white">{points}</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium pt-2">pts</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tier} Tier Citizen</p>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-1">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 self-end">{points} / {nextTierPoints} to next tier</p>
          </div>
        </Link>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/user/complaint" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File Complaint</span>
          </Link>

          <Link to="/user/status" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full text-amber-600 dark:text-amber-400">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Track Status</span>
          </Link>

          <Link to="/user/facility" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
              <MapPin className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Find Facility</span>
          </Link>

          <Link to="/user/leaderboard" className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
              <Trophy className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leaderboard</span>
          </Link>
        </div>

        <div className="flex justify-between items-end mb-3 px-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
          <Link to="/user/points" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">View all</Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          {pointHistory.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No activity yet. Start by filing a complaint!</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {pointHistory.slice(0, 3).map((event) => (
                <li key={event.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.reason}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-sm">
                    +{event.pointsAdded}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{complaints.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Complaints</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{pickupRequests.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pickups</p>
          </div>
        </div>
      </div>
    </main>
  );
}
