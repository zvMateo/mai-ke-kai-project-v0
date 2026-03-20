"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { BlogPost } from "@/types/database"

// Public: get published posts (optionally limited)
export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = await createClient()

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching published blog posts:", error)
    return []
  }

  return (data as BlogPost[]) || []
}

// Public: get a single post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) {
    return null
  }

  return data as BlogPost
}

// Admin: get all posts regardless of published status
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all blog posts:", error)
    throw new Error("Failed to fetch blog posts")
  }

  return (data as BlogPost[]) || []
}

// Admin: get a single post by id (for edit page)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return null
  }

  return data as BlogPost
}

// Admin: create a new post
export async function createBlogPost(data: {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  author_name: string
  author_avatar_url: string | null
  tags: string[]
  is_published: boolean
  published_at: string | null
}): Promise<BlogPost> {
  const supabase = createAdminClient()

  const sanitized = {
    title: data.title.trim(),
    slug: data.slug.trim().toLowerCase(),
    excerpt: data.excerpt?.trim() || null,
    content: data.content?.trim() || null,
    cover_image_url: data.cover_image_url?.trim() || null,
    author_name: data.author_name.trim() || "Mai Ke Kai Team",
    author_avatar_url: data.author_avatar_url?.trim() || null,
    tags: data.tags.filter(Boolean),
    is_published: Boolean(data.is_published),
    published_at: data.is_published ? (data.published_at || new Date().toISOString()) : null,
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert(sanitized)
    .select()
    .single()

  if (error) {
    console.error("Error creating blog post:", error)
    throw new Error("Failed to create blog post: " + error.message)
  }

  revalidatePath("/admin/blog", "layout")
  revalidatePath("/blog", "layout")

  return post as BlogPost
}

// Admin: update an existing post
export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string
    slug: string
    excerpt: string | null
    content: string | null
    cover_image_url: string | null
    author_name: string
    author_avatar_url: string | null
    tags: string[]
    is_published: boolean
    published_at: string | null
  }>
): Promise<BlogPost> {
  const supabase = createAdminClient()

  const sanitized: Record<string, unknown> = {}
  if (data.title !== undefined) sanitized.title = data.title.trim()
  if (data.slug !== undefined) sanitized.slug = data.slug.trim().toLowerCase()
  if (data.excerpt !== undefined) sanitized.excerpt = data.excerpt?.trim() || null
  if (data.content !== undefined) sanitized.content = data.content?.trim() || null
  if (data.cover_image_url !== undefined) sanitized.cover_image_url = data.cover_image_url?.trim() || null
  if (data.author_name !== undefined) sanitized.author_name = data.author_name.trim() || "Mai Ke Kai Team"
  if (data.author_avatar_url !== undefined) sanitized.author_avatar_url = data.author_avatar_url?.trim() || null
  if (data.tags !== undefined) sanitized.tags = data.tags.filter(Boolean)
  if (data.is_published !== undefined) {
    sanitized.is_published = Boolean(data.is_published)
    if (data.is_published && !data.published_at) {
      sanitized.published_at = new Date().toISOString()
    }
  }
  if (data.published_at !== undefined) sanitized.published_at = data.published_at || null

  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating blog post:", error)
    throw new Error("Failed to update blog post: " + error.message)
  }

  revalidatePath("/admin/blog", "layout")
  revalidatePath("/blog", "layout")

  return post as BlogPost
}

// Admin: delete a post
export async function deleteBlogPost(id: string): Promise<{ success: boolean }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting blog post:", error)
    throw new Error("Failed to delete blog post: " + error.message)
  }

  revalidatePath("/admin/blog", "layout")
  revalidatePath("/blog", "layout")

  return { success: true }
}
