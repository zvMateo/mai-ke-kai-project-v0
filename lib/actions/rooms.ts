"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Room, Bed, SeasonPricing } from "@/types/database";
import { revalidatePath } from "next/cache";

// Get all active rooms with beds
export async function getRooms() {
  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      `
      *,
      beds (*)
    `
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching rooms:", error);
    throw new Error("Failed to fetch rooms");
  }

  return rooms as (Room & { beds: Bed[] })[];
}

// Get room by ID
export async function getRoomById(roomId: string) {
  const supabase = await createClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select(
      `
      *,
      beds (*),
      season_pricing (*)
    `
    )
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching room:", error);
    throw new Error("Failed to fetch room");
  }

  return room as Room & { beds: Bed[]; season_pricing: SeasonPricing[] };
}

// Get room pricing for a season
export async function getRoomPricing(roomId: string, season: string) {
  const supabase = await createClient();

  const { data: pricing, error } = await supabase
    .from("season_pricing")
    .select("*")
    .eq("room_id", roomId)
    .eq("season", season)
    .single();

  if (error) {
    console.error("Error fetching pricing:", error);
    return null;
  }

  return pricing as SeasonPricing;
}

// Get all pricing for rooms
export async function getAllRoomPricing() {
  const supabase = await createClient();

  const { data: pricing, error } = await supabase
    .from("season_pricing")
    .select("*");

  if (error) {
    console.error("Error fetching all pricing:", error);
    throw new Error("Failed to fetch pricing");
  }

  return pricing as SeasonPricing[];
}

// Admin: Create room
export async function createRoom(data: {
  name: string;
  type: string;
  capacity: number;
  sell_unit: string;
  description?: string;
  amenities?: string[];
  main_image?: string;
  images?: string[];
}) {
  const supabase = await createAdminClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      sell_unit: data.sell_unit,
      description: data.description || null,
      amenities: data.amenities || [],
      main_image: data.main_image || null,
      images: data.images || [],
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    throw new Error(error.message || "Failed to create room");
  }

  revalidatePath("/admin/rooms");
  return room as Room;
}

// Admin: Update room
export async function updateRoom(roomId: string, data: Partial<Room>) {
  const supabase = await createAdminClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", roomId)
    .select()
    .single();

  if (error) {
    console.error("Error updating room:", error);
    throw new Error(error.message || "Failed to update room");
  }

  revalidatePath("/admin/rooms");
  return room as Room;
}

// Admin: Toggle room active status
export async function toggleRoomStatus(roomId: string, isActive: boolean) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("rooms")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", roomId);

  if (error) {
    console.error("Error toggling room status:", error);
    throw new Error("Failed to toggle room status");
  }

  return { success: true };
}

// Admin: Update pricing
export async function updateRoomPricing(
  pricingId: string,
  data: Partial<SeasonPricing>
) {
  const supabase = await createAdminClient();

  const { data: pricing, error } = await supabase
    .from("season_pricing")
    .update(data)
    .eq("id", pricingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating pricing:", error);
    throw new Error(error.message || "Failed to update pricing");
  }

  return pricing as SeasonPricing;
}

// Admin: Delete room
export async function deleteRoom(roomId: string) {
  const supabase = await createAdminClient();

  const { error } = await supabase.from("rooms").delete().eq("id", roomId);

  if (error) {
    console.error("Error deleting room:", error);
    throw new Error(error.message || "Failed to delete room");
  }

  revalidatePath("/admin/rooms");
  return { success: true };
}

// Get rooms with pricing for booking dates
export async function getRoomsWithPricing(checkInDate: Date) {
  const supabase = await createClient();

  // Determine season based on check-in date
  const month = checkInDate.getMonth() + 1;
  const day = checkInDate.getDate();

  let season = "mid";
  // High season: Dec 27 - Apr 30
  if (
    (month === 12 && day >= 27) ||
    month === 1 ||
    month === 2 ||
    month === 3 ||
    (month === 4 && day <= 30)
  ) {
    season = "high";
  }
  // Low season: Sep 1 - Oct 31
  else if (month === 9 || month === 10) {
    season = "low";
  }

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      `
      *,
      beds (*),
      season_pricing!inner (
        base_price,
        rack_rate,
        competitive_rate,
        last_minute_rate,
        season
      )
    `
    )
    .eq("is_active", true)
    .eq("season_pricing.season", season)
    .order("name");

  if (error) {
    console.error("Error fetching rooms with pricing:", error);
    throw new Error("Failed to fetch rooms with pricing");
  }

  // Transform the data to include price_per_night
  const roomsWithPricing = rooms?.map((room) => {
    const pricing = Array.isArray(room.season_pricing)
      ? room.season_pricing[0]
      : room.season_pricing;
    return {
      ...room,
      price_per_night: pricing?.base_price || 0,
      pricing: pricing,
    };
  });

  return roomsWithPricing || [];
}
