import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Recycle,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Home,
  AlertTriangle,
  Activity,
  Trophy,
  Star,
  Gift,
  MapPin,
  Sparkles,
} from 'lucide-react';

const userLinks = [
  { to: '/user', label: 'Home', icon: Home },
  { to: '/user/scan', label: 'AI Scanner', icon: Sparkles },
  { to: '/user/complaint', label: 'File Complaint', icon: AlertTriangle },
  { to: '/user/status', label: 'Track Status', icon: Activity },
  { to: '/user/facility', label: 'Facility', icon: MapPin },
  { to: '/user/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/user/points', label: 'Points', icon: Star },
  { to: '/user/redeem', label: 'Redeem', icon: Gift },
];

const collectorLinks = [
  { to: '/collector', label: 'Dashboard', icon: Home },
];

export function Navbar() {
  const { role, logout, points, tierInfo } = useAppContext();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = role === 'collector' ? collectorLinks : userLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-xl"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to={role === 'collector' ? '/collector' : '/user'} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow">
              <Recycle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">CleanConnect</span>
              <span className="ml-1.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {role === 'collector' ? 'Collector' : 'Goa'}
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/user' || link.to === '/collector'} className={linkClass}>
                <link.icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Points badge (user only) */}
            {role === 'user' && (
              <NavLink
                to="/user/points"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs hover:border-emerald-400 transition-colors"
              >
                <span className="text-sm">{tierInfo.tierBadge}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{points}</span>
              </NavLink>
            )}

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout and return to role selection"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/user' || link.to === '/collector'}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <link.icon className="w-4 h-4" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
            {role === 'user' && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                <span>{tierInfo.tierBadge} {tierInfo.tier}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-mono font-bold text-emerald-600">{points} pts</span>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
