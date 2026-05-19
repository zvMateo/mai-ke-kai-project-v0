/**
 * React Query hooks and utilities (Client-safe exports)
 *
 * This file only exports client-safe hooks and types.
 * For server-only utilities (prefetch functions), import from './index.server'.
 *
 * Trimmed during Phase 0 cleanup. Bookings, dashboard, loyalty, and PMS
 * inventory hooks were removed because Tab.Travel owns booking data and
 * the public site no longer needs guest accounts.
 */

// Query key factory
export { queryKeys } from "./keys";

// Admin queries (client hooks)
export { useUsersList, useBlogPostsList } from "./admin";

// Mutations by domain — content-focused only
export { useCreateUser, useUpdateUser, useDeleteUser } from "./mutations/users";
export { useUploadImage } from "./mutations/images";
export {
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
} from "./mutations/blog";
