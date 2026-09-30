/**
 * Shared TypeScript types and contracts establishing the boundary
 * between UI components and the service/backend layer.
 *
 * All API response shapes and shared model types live here.
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Generic wrapper for service call results —
// avoids try/catch scatter across the UI layer.
export type ServiceSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};

export type ServiceFailure = {
  success: false;
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
