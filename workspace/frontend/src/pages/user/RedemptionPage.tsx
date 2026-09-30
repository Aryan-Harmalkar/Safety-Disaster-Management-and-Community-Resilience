import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Gift } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const REWARDS = [
  { id: 'r1', name: 'Goa Kadamba Bus 1-Day Eco Pass', cost: 100, icon: '🚌', desc: 'Valid across Panaji & North Goa electric bus routes.' },
  { id: 'r2', name: 'Goa Green Reusable Canvas Tote', cost: 150, icon: '🛍️', desc: 'Durable organic cotton bag manufactured by local SHGs.' },
  { id: 'r3', name: 'Mapusa / Panaji Market Voucher ₹200', cost: 250, icon: '🎫', desc: 'Redeemable at participating municipal farmers markets.' },
  { id: 'r4', name: 'Citizen Beach Cleanup Safety Kit', cost: 300, icon: '🧹', desc: 'Includes heavy-duty gloves, waste pickers, and bio bags.' },
  { id: 'r5', name: 'Old Goa Heritage Walk Ticket', cost: 400, icon: '🏛️', desc: 'Guided eco-historical walk across UNESCO heritage churches.' },
  { id: 'r6', name: 'Plant a Mandovi Mangrove Certificate', cost: 500, icon: '🌱', desc: 'One mangrove sapling planted along the Mandovi estuary.' },
];

export function RedemptionPage() {
  const navigate = useNavigate();
  const { points, addPoints, announce } = useAppContext();
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRedeem = (id: string, name: string, cost: number) => {
    if (points >= cost) {
      addPoints(-cost, `Redeemed: ${name}`);
      setRedeemed((prev) => [...prev, id]);
      const msg = `Successfully redeemed ${name} for ${cost} points!`;
      setToastMessage(msg);
      announce(msg);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

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
            <Gift className="w-5 h-5 text-teal-600" />
            <span>Redeem Civic Eco-Rewards</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convert your waste segregation points into local Goa transport, goods, and eco-initiatives
          </p>
        </div>
      </div>

      {toastMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Available Points Balance Card */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs text-teal-100 font-semibold uppercase tracking-wider block">
            Your Redeemable Balance
          </span>
          <div className="text-3xl sm:text-4xl font-black mt-0.5">
            {points} <span className="text-sm font-normal text-teal-100">pts</span>
          </div>
        </div>
        <div className="text-right">
          <Link
            to="/user/points"
            className="text-xs font-bold bg-white text-teal-800 px-4 py-2 rounded-xl shadow hover:bg-teal-50 transition"
          >
            Earn More Points &rarr;
          </Link>
        </div>
      </div>

      {/* Rewards Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REWARDS.map((r) => {
          const canAfford = points >= r.cost;
          const isRedeemed = redeemed.includes(r.id);

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 w-12 h-12 flex items-center justify-center">
                    {r.icon}
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {r.cost} pts
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                  {r.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {r.desc}
                </p>
              </div>

              <div>
                {isRedeemed ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Redeemed (Coupon Active)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(r.id, r.name, r.cost)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                      canAfford
                        ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{canAfford ? 'Redeem Voucher' : `Needs ${r.cost - points} more pts`}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Demo rewards catalogue • Points automatically sync across your Goa citizen profile.
      </div>
    </div>
  );
}
