/**
 * Pure utility functions (e.g., formatting, string manipulation, class merging).
 */

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
