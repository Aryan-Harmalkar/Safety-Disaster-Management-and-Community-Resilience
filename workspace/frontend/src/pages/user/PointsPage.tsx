import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Gift, Award, CheckCircle, Info, FileImage, Trash2, MapPin } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';

export function PointsPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { points, tier, pointHistory } = state;

  const nextTierPoints = tier === 'Bronze' ? 100 : tier === 'Silver' ? 300 : tier === 'Gold' ? 500 : 1000;
  const progress = Math.min(100, Math.max(0, (points / nextTierPoints) * 100));
  const tierBadge = tier === 'Bronze' ? '🥉' : tier === 'Silver' ? '🥈' : tier === 'Gold' ? '🥇' : '💎';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Eco-Points</h1>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Main Points Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-lg p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <Award className="h-48 w-48" />
          </div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-2 flex justify-center items-center gap-3">
              <span>{tierBadge}</span>
            </div>
            <h2 className="text-5xl font-extrabold mb-1">{points}</h2>
            <p className="text-emerald-100 font-medium text-lg mb-6">{tier} Tier Citizen</p>
            
            <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Current: {points}</span>
                <span>Next Tier: {nextTierPoints}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-emerald-100 text-right">
                {tier === 'Platinum' ? 'Max Tier Reached!' : `${nextTierPoints - points} points to ${tier === 'Bronze' ? 'Silver' : tier === 'Silver' ? 'Gold' : 'Platinum'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Redeem Button */}
        <Link 
          to="/user/redemption" 
          className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-emerald-600 dark:text-emerald-400 font-bold py-4 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 transition-colors"
        >
          <Gift className="h-6 w-6" />
          <span>Redeem Rewards</span>
        </Link>

        {/* How to Earn */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-emerald-500" />
            How to Earn Points
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File Complaint</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+10</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Photo (AI Bonus)</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+15</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Complaint Resolved</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+25</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Waste Collected</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+20</span>
            </li>
          </ul>
        </div>

        {/* Tier Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Tier Thresholds</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${tier === 'Bronze' ? 'border-amber-700 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-2xl mb-1">🥉</div>
              <div className="font-bold text-gray-800 dark:text-white">Bronze</div>
              <div className="text-xs text-gray-500">0 - 99 pts</div>
            </div>
            <div className={`p-3 rounded-xl border ${tier === 'Silver' ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-2xl mb-1">🥈</div>
              <div className="font-bold text-gray-800 dark:text-white">Silver</div>
              <div className="text-xs text-gray-500">100 - 299 pts</div>
            </div>
            <div className={`p-3 rounded-xl border ${tier === 'Gold' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-2xl mb-1">🥇</div>
              <div className="font-bold text-gray-800 dark:text-white">Gold</div>
              <div className="text-xs text-gray-500">300 - 499 pts</div>
            </div>
            <div className={`p-3 rounded-xl border ${tier === 'Platinum' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-2xl mb-1">💎</div>
              <div className="font-bold text-gray-800 dark:text-white">Platinum</div>
              <div className="text-xs text-gray-500">500+ pts</div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">History</h3>
          {pointHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No points earned yet.</p>
          ) : (
            <div className="space-y-4">
              {[...pointHistory].reverse().map(event => (
                <div key={event.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.reason}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold ${event.pointsAdded > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {event.pointsAdded > 0 ? '+' : ''}{event.pointsAdded}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
