import React, { useEffect, useState } from 'react';
import {
  Recycle,
  Moon,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  points: number;
  tierBadge: string;
  tier: string;
  liveAnnouncement: string;
}

export const Header: React.FC<HeaderProps> = ({
  points,
  tierBadge,
  tier,
  liveAnnouncement,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('cleanconnect_theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cleanconnect_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cleanconnect_theme', 'light');
    }
  }, [isDark]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
    >
      {/* Skip link for keyboard and screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Screen Reader live announcement landmark */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-md">
            <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                CleanConnect
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Goa MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Civic Waste Management &amp; Community Resilience
            </p>
          </div>
        </div>

        {/* Status / Points / Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Points & Tier Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-sm" role="img" aria-label={tier}>
              {tierBadge}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {tier}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {points} pts
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
