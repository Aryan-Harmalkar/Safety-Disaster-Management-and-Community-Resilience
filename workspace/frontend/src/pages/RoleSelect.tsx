import { useNavigate } from 'react-router-dom';
import { Recycle, User, Truck, Sun, Moon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useAppContext();
  const { isDark, toggleTheme } = useTheme();

  const handleRoleSelect = (selectedRole: 'user' | 'collector') => {
    setRole(selectedRole);
    navigate(selectedRole === 'collector' ? '/collector' : '/user', { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 transition-colors">
      {/* Top Bar with Brand & Theme Toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Recycle className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
            CleanConnect
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Goa Smart City
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Main Hero Selection Box */}
      <div className="w-full max-w-4xl py-8 my-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Goa Waste Management &amp; Community Resilience Demo</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight max-w-2xl">
          Clean Communities Start With Rapid Coordination
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
          Select your portal to continue. Citizens report and earn rewards; municipal collectors receive live GPS routing and clear tasks.
        </p>

        {/* The Two Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          {/* 1. Citizen Portal */}
          <button
            type="button"
            onClick={() => handleRoleSelect('user')}
            className="group relative flex flex-col text-left p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 dark:border-slate-800 dark:hover:border-emerald-500 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-emerald-400/30 outline-none cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Login as Citizen
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Report roadside dumping, snap photos with AI classification, find recycling depots, and earn redeemable eco-points.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Enter Citizen Dashboard</span>
              <span>&rarr;</span>
            </div>
          </button>

          {/* 2. Garbage Collector / Driver Portal */}
          <button
            type="button"
            onClick={() => handleRoleSelect('collector')}
            className="group relative flex flex-col text-left p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-blue-500/30 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:ring-4 focus:ring-blue-400/30 outline-none cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Truck className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Login as Garbage Collector
              </h2>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Driver portal with live route navigation, instant dispatch notifications, pinpointed waste locations, and one-tap collection logs.
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Enter Driver Dispatch Portal</span>
              <span>&rarr;</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>GSPCB &amp; Goa State Urban Development Agency Demo</span>
        </div>
        <span>No password required • Instant role switching</span>
      </footer>
    </main>
  );
}

