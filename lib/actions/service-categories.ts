"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { ServiceCategoryEntity } from "@/types/database";

// Get all active categories (for public/client use)
export async function getServiceCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  if (error) {
    console.error("Error fetching service categories:", error);
    return [];
  }

  return categories as ServiceCategoryEntity[];
}

// Get all categories including inactive (for admin)
export async function getAllServiceCategories() {
  // Use admin client to bypass RLS for admin panel
  const supabase = createAdminClient();

  const { data: categories, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("display_order")
    .order("name");

  if (error) {
    console.error("Error fetching all service categories:", error);
    return [];
  }

  return categories as ServiceCategoryEntity[];
}

// Get category by ID
export async function getServiceCategoryById(id: string) {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching service category:", error);
    return null;
  }

  return category as ServiceCategoryEntity;
}

// Get category by slug
export async function getServiceCategoryBySlug(slug: string) {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching service category by slug:", error);
    return null;
  }

  return category as ServiceCategoryEntity;
}

// Admin: Create service category
export async function createServiceCategory(data: {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  display_order?: number;
  is_active?: boolean;
}) {
  const supabase = createAdminClient();

  // Generate slug from name if not provided
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const { data: category, error } = await supabase
    .from("service_categories")
    .insert({
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      icon: data.icon || null,
      color: data.color || null,
      display_order: data.display_order || 0,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating service category:", error);
    throw new Error("Failed to create service category: " + error.message);
  }

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  return category as ServiceCategoryEntity;
}

// Admin: Update service category
export async function updateServiceCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    display_order: number;
    is_active: boolean;
  }>
) {
  const supabase = createAdminClient();

  const updateData: Record<string, any> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (data.name) updateData.name = data.name.trim();
  if (data.slug) updateData.slug = data.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;

  const { data: category, error } = await supabase
    .from("service_categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating service category:", error);
    throw new Error("Failed to update service category: " + error.message);
  }

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  return category as ServiceCategoryEntity;
}

// Admin: Delete service category
export async function deleteServiceCategory(id: string) {
  const supabase = createAdminClient();

  // Check if there are services using this category
  const { data: services, error: checkError } = await supabase
    .from("services")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (checkError) {
    console.error("Error checking services:", checkError);
    throw new Error("Failed to check services using this category");
  }

  if (services && services.length > 0) {
    throw new Error("Cannot delete category: there are services using it. Deactivate it instead.");
  }

  const { error } = await supabase.from("service_categories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting service category:", error);
    throw new Error("Failed to delete service category: " + error.message);
  }

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  return { success: true };
}

// Admin: Toggle category active status
export async function toggleServiceCategoryStatus(id: string, isActive: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("service_categories")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error toggling service category status:", error);
    throw new Error("Failed to toggle service category status");
  }

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  return { success: true };
}

// Get services count by category
export async function getServicesCountByCategory(categoryId: string) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error counting services:", error);
    return 0;
  }

  return count || 0;
}
