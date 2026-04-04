"use server";

/**
 * Public blog queries — ONLY imports @supabase/ssr (edge-compatible).
 * DO NOT import createAdminClient or revalidatePath here.
 * Admin functions stay in lib/actions/blog.ts
 */

import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";

/** Get published posts for the public blog listing / landing section */
export async function getPublishedPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error("getPublishedPosts error:", error.message);
      return [];
    }

    return (data as BlogPost[]) ?? [];
  } catch (err) {
    console.error("getPublishedPosts unexpected error:", err);
    return [];
  }
}

/** Get a single published post by slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) return null;
    return data as BlogPost;
  } catch (err) {
    console.error("getPostBySlug unexpected error:", err);
    return null;
  }
}
