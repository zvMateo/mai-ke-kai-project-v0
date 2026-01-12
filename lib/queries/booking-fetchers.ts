import type { SupabaseClient } from "@supabase/supabase-js";
import type { Service } from "@/types/database";

export interface RoomWithPricing {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_night: number;
  description: string | null;
  amenities: string[] | null;
  image_url: string | null;
  main_image: string | null;
  is_active: boolean;
  pricing: {
    base_price: number;
    rack_rate: number;
    competitive_rate: number;
    last_minute_rate: number;
    season: string;
  } | null;
}

function getSeason(checkInDate: Date): string {
  const month = checkInDate.getMonth() + 1;
  const day = checkInDate.getDate();

  if (
    (month === 12 && day >= 27) ||
    month === 1 ||
    month === 2 ||
    month === 3 ||
    (month === 4 && day <= 30)
  ) {
    return "high";
  }

  if (month === 9 || month === 10) {
    return "low";
  }

  return "mid";
}

export async function fetchRoomsWithPricingServer(
  supabase: SupabaseClient,
  checkInDate: Date
): Promise<RoomWithPricing[]> {
  const season = getSeason(checkInDate);

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
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }

  return (rooms || []).map((room) => {
    const pricing = Array.isArray(room.season_pricing)
      ? room.season_pricing[0]
      : room.season_pricing;

    return {
      id: room.id,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      description: room.description,
      amenities: room.amenities,
      image_url: room.image_url,
      main_image: room.main_image,
      is_active: room.is_active,
      price_per_night: pricing?.base_price || 0,
      pricing: pricing || null,
    };
  });
}

export async function fetchServicesServer(
  supabase: SupabaseClient,
  category?: string
): Promise<Service[]> {
  let query = supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data: services, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }

  return services || [];
}
