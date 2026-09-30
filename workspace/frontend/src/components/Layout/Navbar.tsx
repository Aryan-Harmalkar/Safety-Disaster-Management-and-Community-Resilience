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
  AlertTriangle,
  Activity,
  Trophy,
  Star,
  Gift,
  MapPin,
  Truck,
  Compass,
  Bell,
} from 'lucide-react';

const userLinks = [
  { to: '/user/map', label: 'Pinpoint Map', icon: Compass },
  { to: '/user/complaint', label: 'File Complaint', icon: AlertTriangle },
  { to: '/user/status', label: 'Track Status', icon: Activity },
  { to: '/user/facility', label: 'Facility', icon: MapPin },
  { to: '/user/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/user/points', label: 'Points', icon: Star },
  { to: '/user/redeem', label: 'Redeem', icon: Gift },
];

export function Navbar() {
  const { role, logout, points, tierInfo, complaints, pickupRequests } = useAppContext();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // For collector: count active tasks
  const collectorPendingCount =
    complaints.filter((c) => c.status !== 'Resolved').length +
    pickupRequests.filter((p) => p.status !== 'Collected').length;

  const collectorLinks = [
    { to: '/collector', label: 'Driver Dashboard', icon: Truck },
  ];

  const links = role === 'collector' ? collectorLinks : userLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? role === 'collector'
          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <NavLink
            to={role === 'collector' ? '/collector' : '/user'}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                role === 'collector'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
              }`}
            >
              {role === 'collector' ? <Truck className="w-5 h-5" /> : <Recycle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  CleanConnect
                </span>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    role === 'collector'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {role === 'collector' ? 'Driver Portal' : 'Citizen Portal'}
                </span>
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/user' || link.to === '/collector'}
                className={linkClass}
              >
                <link.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Header Utilities: Points, Notifications, Theme, Logout */}
          <div className="flex items-center gap-2">
            {/* Collector: Active tasks counter */}
            {role === 'collector' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>{collectorPendingCount} Active Tasks</span>
              </div>
            )}

            {/* Citizen: Points badge */}
            {role === 'user' && (
              <NavLink
                to="/user/points"
                title="View Points & Rewards"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs hover:border-emerald-500 transition-colors"
              >
                <span className="text-sm">{tierInfo.tierBadge}</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {points} pts
                </span>
              </NavLink>
            )}

            {/* Dark/Day Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Logout / Switch Role Button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Switch role / Logout"
              title="Switch role / Logout"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileOpen && (
          <nav
            className="lg:hidden pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1"
            aria-label="Mobile navigation"
          >
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
              <div className="flex items-center justify-between px-3 py-2 mt-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {tierInfo.tierBadge} {tierInfo.tier} Tier
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {points} pts
                </span>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
