/**
 * Pure utility functions — no React, no side effects.
 *
 * Examples:
 *   cn(...classes)           — class name merging
 *   formatDate(iso)          — date formatting
 *   truncate(str, maxLen)    — string truncation
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
