import type { SupabaseClient } from "@supabase/supabase-js";
import type { User, BlogPost } from "@/types/database";

/**
 * Admin content-focused fetchers.
 *
 * After the PMS cleanup (Phase 0), Tab.Travel handles all bookings/rooms/
 * services/packages/loyalty/pricing data. The admin panel manages only
 * content (blog, newsletter, gallery, testimonials, about, settings, users).
 *
 * Phase 6.9 of the cleanup plan adds `fetchAdminContentStats` for the new
 * dashboard cards. For now we expose users + blog post fetchers since those
 * are the only ones consumed by surviving admin pages.
 */

export type BasicFilter = { isActive?: boolean };

export async function fetchUsers(
  supabase: SupabaseClient,
  filters?: { role?: User["role"] },
): Promise<User[]> {
  let query = supabase.from("users").select("*").order("full_name");

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data ?? []) as User[];
}

export async function fetchBlogPosts(
  supabase: SupabaseClient,
  filters?: { isPublished?: boolean },
): Promise<BlogPost[]> {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (typeof filters?.isPublished === "boolean") {
    query = query.eq("is_published", filters.isPublished);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }

  return (data ?? []) as BlogPost[];
}
