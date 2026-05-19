import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import { fetchUsers, fetchBlogPosts } from "@/lib/queries/admin-fetchers";
import { queryKeys } from "@/lib/queries/keys";

/**
 * Server-side prefetchers for admin content.
 *
 * Trimmed during Phase 0 cleanup to only the routes that survive: users
 * and blog posts. The admin dashboard prefetch is now a no-op because
 * the placeholder dashboard renders synchronously without query data.
 * Phase 6.9 of the plan will restore prefetch for the new content stats.
 */

export async function prefetchUsersList(
  queryClient: QueryClient,
  filters?: { role?: User["role"] },
): Promise<void> {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsers(supabase, filters),
  });
}

export async function prefetchBlogPostsList(
  queryClient: QueryClient,
  filters?: { isPublished?: boolean },
): Promise<void> {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.blogPosts.list(filters),
    queryFn: () => fetchBlogPosts(supabase, filters),
  });
}

/**
 * No-op until Phase 6.9 restores content-stats prefetching.
 * Kept as a stable export so `app/admin/page.tsx` keeps compiling.
 */
export async function prefetchAdminDashboard(
  _queryClient: QueryClient,
): Promise<void> {
  // Intentionally empty.
}
