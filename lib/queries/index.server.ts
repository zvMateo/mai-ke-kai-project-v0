/**
 * Server-only React Query utilities
 *
 * These exports use next/headers and can only be used in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * DO NOT import this file in client components.
 */

// Prefetch utilities for Server Components
export { prefetchBookingFlow } from "./booking-prefetch";

export {
  prefetchRoomsList,
  prefetchServicesList,
  prefetchPackagesList,
  prefetchRewardsList,
  prefetchUsersList,
  prefetchAdminDashboard,
} from "./admin-prefetch";

export {
  prefetchUserDashboard,
  prefetchUserBookings,
  prefetchUserLoyalty,
} from "./dashboard-prefetch";

// Server Component wrapper for hydration
export { withQueryClient } from "./with-query-client";
