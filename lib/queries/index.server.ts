/**
 * Server-only React Query utilities
 *
 * These exports use next/headers and can only be used in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * DO NOT import this file in client components.
 *
 * Trimmed during Phase 0 cleanup — only content prefetchers remain.
 */

export {
  prefetchUsersList,
  prefetchBlogPostsList,
  prefetchAdminDashboard,
} from "./admin-prefetch";

// Server Component wrapper for hydration
export { withQueryClient } from "./with-query-client";
