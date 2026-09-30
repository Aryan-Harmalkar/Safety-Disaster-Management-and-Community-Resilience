/**
 * API client — thin fetch wrapper over the local backend.
 *
 * During early development, the backend may not exist yet.
 * In that case, swap `fetch` calls for mock data in the feature services.
 *
 * Architecture:
 *   React Components → Features / Hooks → Services (here) → Local backend or Mock
 */

import type { ServiceResult } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<ServiceResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        error: { code: String(res.status), message: text || res.statusText },
      };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: { code: 'NETWORK_ERROR', message } };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>('GET', endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body: unknown) => request<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string) => request<T>('DELETE', endpoint),
};
