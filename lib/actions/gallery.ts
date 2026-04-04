"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { GalleryItem, GalleryCategory } from "@/types/database";

/* ──────────────────────────────────────────────
   PUBLIC
────────────────────────────────────────────── */

/** Get all active gallery items for the landing page */
export async function getGalleryItems(
  category?: GalleryCategory,
  limit?: number
): Promise<GalleryItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("gallery_items")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true });

  if (category) query = query.eq("category", category);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
  return (data as GalleryItem[]) ?? [];
}

/** Get featured items only */
export async function getFeaturedGalleryItems(limit = 9): Promise<GalleryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured gallery items:", error);
    return [];
  }
  return (data as GalleryItem[]) ?? [];
}

/* ──────────────────────────────────────────────
   ADMIN — all items regardless of active status
────────────────────────────────────────────── */

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching all gallery items:", error);
    return [];
  }
  return (data as GalleryItem[]) ?? [];
}

export async function createGalleryItem(input: {
  image_url: string;
  title?: string;
  description?: string;
  category: GalleryCategory;
  is_featured?: boolean;
  display_order?: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("gallery_items").insert({
    image_url: input.image_url,
    title: input.title || null,
    description: input.description || null,
    category: input.category,
    is_featured: input.is_featured ?? false,
    display_order: input.display_order ?? 0,
    is_active: true,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function updateGalleryItem(
  id: string,
  input: Partial<{
    title: string | null;
    description: string | null;
    category: GalleryCategory;
    is_featured: boolean;
    is_active: boolean;
    display_order: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("gallery_items")
    .update(input)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function deleteGalleryItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function toggleGalleryItemActive(
  id: string,
  is_active: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateGalleryItem(id, { is_active });
}

export async function toggleGalleryItemFeatured(
  id: string,
  is_featured: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateGalleryItem(id, { is_featured });
}
