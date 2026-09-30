/**
 * Shared domain types for the Waste Management application.
 *
 * Keep types minimal until requirements are finalized.
 * Do NOT invent fields that haven't been decided yet.
 */

// ─── Generic service result wrapper ────────────────────────────────────────

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// ─── Pagination ─────────────────────────────────────────────────────────────

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

// ─── Base entity ─────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Waste Management domain types (stubs — fill in once requirements are set) ──

/**
 * Placeholder for a waste report/item.
 * Extend once the team finalises what fields are needed.
 */
export interface WasteItem extends BaseEntity {
  // e.g. category, location, status, reportedBy, ...
  [key: string]: unknown;
}

export * from './cleanconnect';
