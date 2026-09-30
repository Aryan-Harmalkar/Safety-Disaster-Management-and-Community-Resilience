import type { ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  label?: string;
}

/**
 * Application route definitions skeleton.
 * Feature routes will be registered here by the frontend developer.
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: null,
    label: 'Home',
  },
];
