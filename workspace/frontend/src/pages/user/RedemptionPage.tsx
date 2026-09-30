import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../hooks/useCleanConnect';

const REWARDS = [
  { id: 'r1', name: 'Free Bus Pass (1 Day)', cost: 100, icon: '🚌' },
  { id: 'r2', name: 'Reusable Eco Bag', cost: 150, icon: '🛍️' },
  { id: 'r3', name: 'Local Market Voucher ₹200', cost: 250, icon: '🎫' },
  { id: 'r4', name: 'Beach Cleanup Kit', cost: 300, icon: '🧹' },
  { id: 'r5', name: 'Goa Heritage Tour Ticket', cost: 400, icon: '🏛️' },
  { id: 'r6', name: 'Plant a Mangrove Certificate', cost: 500, icon: '🌱' },
];

export function RedemptionPage() {
  const navigate = useNavigate();
  const { state, addPoints } = useAppContext();
  const { points } = state;
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  const handleRedeem = (id: string, name: string, cost: number) => {
    if (points >= cost) {
      addPoints(-cost, `Redeemed: ${name}`);
      setRedeemed([...redeemed, id]);
      
      setShowToast({ show: true, msg: `Successfully redeemed ${name}!` });
      setTimeout(() => setShowToast({ show: false, msg: '' }), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 relative">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Redeem Rewards</h1>
      </header>

      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium text-sm">{showToast.msg}</span>
        </div>
      )}

      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-emerald-600 dark:bg-emerald-800 text-white rounded-2xl p-6 flex items-center justify-between shadow-md mb-6">
          <div>
            <p className="text-emerald-100 font-medium text-sm mb-1">Available Points</p>
            <h2 className="text-4xl font-bold">{points}</h2>
          </div>
          <div className="text-4xl opacity-80">💎</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REWARDS.map(reward => {
            const canAfford = points >= reward.cost;
            const isRedeemed = redeemed.includes(reward.id);
            
            return (
              <div 
                key={reward.id} 
                className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border ${
                  isRedeemed ? 'border-emerald-500' : 'border-gray-100 dark:border-gray-700'
                } flex flex-col items-center text-center`}
              >
                <div className="text-4xl mb-3">{reward.icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-2 h-10">{reward.name}</h3>
                
                <div className="mt-auto w-full">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-3">
                    {reward.cost} pts
                  </div>
                  
                  {isRedeemed ? (
                    <button disabled className="w-full bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 font-bold py-2 rounded-lg flex justify-center items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Redeemed
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRedeem(reward.id, reward.name, reward.cost)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-bold transition-colors ${
                        canAfford 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Redeem
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            Note: These are demo rewards. Real partnerships will be available in the full CleanConnect release.
          </p>
        </div>
      </div>
    </main>
  );
}
