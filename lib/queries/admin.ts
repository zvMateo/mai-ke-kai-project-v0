"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries/keys";
import { fetchUsers, fetchBlogPosts } from "@/lib/queries/admin-fetchers";
import type { User, BlogPost } from "@/types/database";

/**
 * Admin client-side hooks.
 *
 * Trimmed during Phase 0 cleanup. Only content-focused hooks remain:
 * users (admin auth) and blog posts. PMS hooks (rooms, services, packages,
 * rewards, dashboard occupancy/revenue) were removed because Tab.Travel
 * owns booking data.
 */

export function useUsersList(filters?: { role?: User["role"] }) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async (): Promise<User[]> => {
      const supabase = createClient();
      return fetchUsers(supabase, filters);
    },
  });
}

export function useBlogPostsList(filters?: { isPublished?: boolean }) {
  return useQuery({
    queryKey: queryKeys.blogPosts.list(filters),
    queryFn: async (): Promise<BlogPost[]> => {
      const supabase = createClient();
      return fetchBlogPosts(supabase, filters);
    },
  });
}
