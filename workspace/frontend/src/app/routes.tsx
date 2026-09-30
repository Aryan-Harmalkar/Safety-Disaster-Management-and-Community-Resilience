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
  // Add feature routes here
];
