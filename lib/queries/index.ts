/**
 * React Query hooks and utilities (Client-safe exports)
 *
 * This file only exports client-safe hooks and types.
 * For server-only utilities (prefetch functions), import from './index.server'
 */

// Query key factory
export { queryKeys } from "./keys";

// Booking queries (client hooks)
export { useRoomsWithPricing, useServices } from "./booking";
export type { RoomWithPricing } from "./booking";

// Admin queries (client hooks)
export {
  useRoomsList,
  useServicesList,
  usePackagesList,
  useRewardsList,
  useUsersList,
  useAdminDashboardStats,
} from "./admin";
export type { RoomWithDetails, AdminDashboardStats } from "./admin";

// Dashboard queries (client hooks)
export {
  useUserProfile,
  useUpcomingBookings,
  useUserBookings,
  useLoyaltySummary,
  useActiveRewards,
} from "./dashboard";
export type {
  UserProfile,
  UpcomingBooking,
  UserBooking,
  LoyaltySummary,
  ActiveReward,
} from "./dashboard";

// Mutations by domain
export {
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "./mutations/services";

export { useCreateRoom, useUpdateRoom, useDeleteRoom } from "./mutations/rooms";

export {
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from "./mutations/packages";

export {
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from "./mutations/rewards";

export { useCreateUser, useUpdateUser, useDeleteUser } from "./mutations/users";

export { useUploadImage } from "./mutations/images";

export { useCreatePayment } from "./mutations/payments";
