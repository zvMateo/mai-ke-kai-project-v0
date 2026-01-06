"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Service, ServiceCategory } from "@/types/database"

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
export async function createService(data: {
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration_hours: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
}) {
  console.log("[createService] Received data:", JSON.stringify(data, null, 2))
  
  const supabase = await createClient()

  // Validar y sanitizar datos
  const sanitizedData = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    category: data.category,
    price: Number(data.price) || 0,
    duration_hours: data.duration_hours ? Number(data.duration_hours) : null,
    max_participants: data.max_participants ? Number(data.max_participants) : null,
    image_url: data.image_url?.trim() || null,
    is_active: Boolean(data.is_active),
  }

  console.log("[createService] Sanitized data:", JSON.stringify(sanitizedData, null, 2))

  const { data: service, error } = await supabase.from("services").insert(sanitizedData).select().single()

  if (error) {
    console.error("[createService] Supabase error:", error)
    throw new Error("Failed to create service: " + error.message)
  }

  revalidatePath("/admin/services")
  return service as Service
}

// Admin: Update service
export async function updateService(serviceId: string, data: Partial<{
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration_hours: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
}>) {
  const supabase = await createClient()

  // Validar y sanitizar datos
  const sanitizedData: Record<string, any> = {}

  if (data.name !== undefined) sanitizedData.name = data.name.trim()
  if (data.description !== undefined) sanitizedData.description = data.description?.trim() || null
  if (data.category !== undefined) sanitizedData.category = data.category
  if (data.price !== undefined) sanitizedData.price = Number(data.price) || 0
  if (data.duration_hours !== undefined) sanitizedData.duration_hours = data.duration_hours ? Number(data.duration_hours) : null
  if (data.max_participants !== undefined) sanitizedData.max_participants = data.max_participants ? Number(data.max_participants) : null
  if (data.image_url !== undefined) sanitizedData.image_url = data.image_url?.trim() || null
  if (data.is_active !== undefined) sanitizedData.is_active = Boolean(data.is_active)

  const { data: service, error } = await supabase.from("services").update(sanitizedData).eq("id", serviceId).select().single()

  if (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service: " + error.message)
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
