/**
 * Route definitions.
 * Pages and routes are registered here as features are implemented.
 *
 * Pattern:
 *   { path: '/reports', element: <ReportsPage /> }
 */

export interface RouteConfig {
  path: string;
  label: string;
}

export const routes: RouteConfig[] = [
  { path: '/', label: 'Home' },
  { path: '/user/scan', label: 'AI Scanner' },
  { path: '/user/complaint', label: 'File Complaint' },
  { path: '/user/status', label: 'Track Status' },
  { path: '/user/facility', label: 'Facilities' },
  { path: '/user/leaderboard', label: 'Leaderboard' },
  { path: '/user/points', label: 'Points' },
  { path: '/user/redeem', label: 'Redeem' },
];
