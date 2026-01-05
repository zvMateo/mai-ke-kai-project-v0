"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { SurfPackage } from "@/types/database"

// Get all active packages (for public pages)
export async function getPackages() {
  const supabase = await createClient()

  const { data: packages, error } = await supabase
    .from("surf_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) {
    console.error("Error fetching packages:", error)
    return []
  }

  return packages as SurfPackage[]
}

// Get all packages including inactive (for admin)
export async function getAllPackages() {
  const supabase = await createClient()

  const { data: packages, error } = await supabase.from("surf_packages").select("*").order("display_order")

  if (error) {
    console.error("Error fetching all packages:", error)
    return []
  }

  return packages as SurfPackage[]
}

// Get single package by ID
export async function getPackageById(id: string) {
  const supabase = await createClient()

  const { data: pkg, error } = await supabase.from("surf_packages").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching package:", error)
    return null
  }

  return pkg as SurfPackage
}

// Admin: Create package
export async function createPackage(data: Omit<SurfPackage, "id" | "created_at" | "updated_at">) {
  const supabase = createAdminClient()

  const { data: pkg, error } = await supabase
    .from("surf_packages")
    .insert({
      ...data,
      includes: JSON.stringify(data.includes),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating package:", error)
    throw new Error("Failed to create package")
  }

  revalidatePath("/admin/packages")
  revalidatePath("/packages")
  return pkg as SurfPackage
}

// Admin: Update package
export async function updatePackage(id: string, data: Partial<SurfPackage>) {
  const supabase = createAdminClient()

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  if (data.includes) {
    updateData.includes = JSON.stringify(data.includes) as any
  }

  const { data: pkg, error } = await supabase.from("surf_packages").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating package:", error)
    throw new Error("Failed to update package")
  }

  revalidatePath("/admin/packages")
  revalidatePath("/packages")
  return pkg as SurfPackage
}

// Admin: Delete package
export async function deletePackage(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("surf_packages").delete().eq("id", id)

  if (error) {
    console.error("Error deleting package:", error)
    throw new Error("Failed to delete package")
  }

  revalidatePath("/admin/packages")
  revalidatePath("/packages")
  return { success: true }
}

// Admin: Toggle package status
export async function togglePackageStatus(id: string, isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("surf_packages")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error toggling package status:", error)
    throw new Error("Failed to toggle package status")
  }

  revalidatePath("/admin/packages")
  revalidatePath("/packages")
  return { success: true }
}
