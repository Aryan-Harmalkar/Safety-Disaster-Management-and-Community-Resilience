/**
 * API client — thin fetch wrapper over the local backend.
 *
 * During early development (or when backend isn't running), feature modules
 * should use the mock adapters in `./mock/` instead of calling this directly.
 *
 * Architecture:
 *   React Components → Features / Hooks → Services → api.ts → localhost:3001
 *                                                  ↘ mock/   → local JSON
 */

import type { ServiceResult } from '../types';

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
      return { success: false, error: { code: String(res.status), message: text || res.statusText } };
    }
    return { success: true, data: (await res.json()) as T };
  } catch (err) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Unknown error' },
    };
  }
}

export const api = {
  get:    <T>(endpoint: string)                  => request<T>('GET',    endpoint),
  post:   <T>(endpoint: string, body: unknown)   => request<T>('POST',   endpoint, body),
  put:    <T>(endpoint: string, body: unknown)   => request<T>('PUT',    endpoint, body),
  delete: <T>(endpoint: string)                  => request<T>('DELETE', endpoint),
};
