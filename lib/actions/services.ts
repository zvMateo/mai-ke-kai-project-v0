"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Service } from "@/types/database"

// Get all active services
export async function getServices() {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name")

  if (error) {
    console.error("Error fetching services:", error)
    throw new Error("Failed to fetch services")
  }

  return services as Service[]
}

// Get services by category
export async function getServicesByCategory(category: Service["category"]) {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching services by category:", error)
    throw new Error("Failed to fetch services")
  }

  return services as Service[]
}

// Admin: Get all services (including inactive)
export async function getAllServices() {
  const supabase = await createClient()

  const { data: services, error } = await supabase.from("services").select("*").order("category").order("name")

  if (error) {
    console.error("Error fetching all services:", error)
    throw new Error("Failed to fetch services")
  }

  return services as Service[]
}

// Admin: Create service
export async function createService(data: Omit<Service, "id">) {
  const supabase = await createClient()

  const { data: service, error } = await supabase.from("services").insert(data).select().single()

  if (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }

  revalidatePath("/admin/services")
  return service as Service
}

// Admin: Update service
export async function updateService(serviceId: string, data: Partial<Service>) {
  const supabase = await createClient()

  const { data: service, error } = await supabase.from("services").update(data).eq("id", serviceId).select().single()

  if (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service")
  }

  revalidatePath("/admin/services")
  return service as Service
}

// Admin: Toggle service active status
export async function toggleServiceStatus(serviceId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", serviceId)

  if (error) {
    console.error("Error toggling service status:", error)
    throw new Error("Failed to toggle service status")
  }

  revalidatePath("/admin/services")
  return { success: true }
}

// Admin: Delete service
export async function deleteService(serviceId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("services").delete().eq("id", serviceId)

  if (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }

  revalidatePath("/admin/services")
  return { success: true }
}
