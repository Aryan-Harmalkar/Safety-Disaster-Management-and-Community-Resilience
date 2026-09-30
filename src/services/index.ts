/**
 * Services index.
 *
 * All service modules are re-exported from here so feature modules
 * import from a single stable location: `@/services`.
 *
 * Architecture:
 *   React Components
 *       ↓
 *   Features / Hooks
 *       ↓
 *   Services  ← you are here
 *       ↓
 *   Local backend API  or  Mock data
 */

export { api } from './api';
