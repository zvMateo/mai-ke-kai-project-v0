"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { SeasonPricing, SeasonDate } from "@/types/database"

// Get all pricing for a specific room
export async function getRoomPricing(roomId: string) {
  const supabase = await createClient()

  const { data: pricing, error } = await supabase
    .from("season_pricing")
    .select("*")
    .eq("room_id", roomId)
    .order("season")

  if (error) {
    console.error("Error fetching room pricing:", error)
    return []
  }

  return pricing as SeasonPricing[]
}

// Get all pricing with room names
export async function getAllPricingWithRooms() {
  const supabase = await createClient()

  const { data: pricing, error } = await supabase
    .from("season_pricing")
    .select(
      `
      *,
      rooms:room_id (id, name, type, sell_unit)
    `,
    )
    .order("room_id")

  if (error) {
    console.error("Error fetching all pricing:", error)
    return []
  }

  return pricing
}

// Get all season dates
export async function getSeasonDates() {
  const supabase = await createClient()

  const { data: dates, error } = await supabase.from("season_dates").select("*").order("start_date")

  if (error) {
    console.error("Error fetching season dates:", error)
    return []
  }

  return dates as SeasonDate[]
}

// Admin: Create or update pricing for a room
export async function upsertRoomPricing(
  roomId: string,
  season: "high" | "mid" | "low",
  data: {
    base_price: number
    rack_rate: number
    competitive_rate: number
    last_minute_rate: number
  },
) {
  const supabase = createAdminClient()

  // Check if pricing exists
  const { data: existing } = await supabase
    .from("season_pricing")
    .select("id")
    .eq("room_id", roomId)
    .eq("season", season)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("season_pricing")
      .update({
        ...data,
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: "2099-12-31",
      })
      .eq("id", existing.id)

    if (error) {
      console.error("Error updating pricing:", error)
      throw new Error("Failed to update pricing")
    }
  } else {
    // Create new
    const { error } = await supabase.from("season_pricing").insert({
      room_id: roomId,
      season,
      ...data,
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: "2099-12-31",
    })

    if (error) {
      console.error("Error creating pricing:", error)
      throw new Error("Failed to create pricing")
    }
  }

  revalidatePath("/admin/pricing")
  return { success: true }
}

// Admin: Update season dates
export async function updateSeasonDates(
  season: "high" | "mid" | "low",
  data: {
    start_date: string // MM-DD format
    end_date: string // MM-DD format
  },
) {
  const supabase = createAdminClient()

  // Check if season dates exist
  const { data: existing } = await supabase.from("season_dates").select("id").eq("season", season).single()

  if (existing) {
    const { error } = await supabase
      .from("season_dates")
      .update({
        start_date: data.start_date,
        end_date: data.end_date,
      })
      .eq("id", existing.id)

    if (error) {
      console.error("Error updating season dates:", error)
      throw new Error("Failed to update season dates")
    }
  } else {
    const { error } = await supabase.from("season_dates").insert({
      season,
      start_date: data.start_date,
      end_date: data.end_date,
      year: null, // recurring every year
    })

    if (error) {
      console.error("Error creating season dates:", error)
      throw new Error("Failed to create season dates")
    }
  }

  revalidatePath("/admin/pricing")
  return { success: true }
}

// Admin: Delete pricing
export async function deletePricing(pricingId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("season_pricing").delete().eq("id", pricingId)

  if (error) {
    console.error("Error deleting pricing:", error)
    throw new Error("Failed to delete pricing")
  }

  revalidatePath("/admin/pricing")
  return { success: true }
}
