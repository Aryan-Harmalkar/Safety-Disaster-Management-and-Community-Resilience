import type { ReactNode } from 'react';
import { useAppContext } from '../../context/AppContext';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { liveAnnouncement } = useAppContext();

  return (
    <>
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          CleanConnect Goa — Civic Waste Management &amp; Community Resilience
        </p>
        <p className="text-[11px] mt-0.5">
          React 19 • Tailwind CSS • Leaflet + OpenStreetMap
        </p>
      </footer>
    </>
  );
}
