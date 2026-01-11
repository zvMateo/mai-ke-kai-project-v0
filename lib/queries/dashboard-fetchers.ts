import type { SupabaseClient } from "@supabase/supabase-js";

export type UserProfile = {
  full_name: string | null;
  loyalty_points: number | null;
};

export type BookingRoom = {
  rooms: {
    name: string | null;
    type?: string | null;
  } | null;
};

export type UpcomingBooking = {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
  booking_rooms?: BookingRoom[] | null;
};

export type UserBooking = UpcomingBooking & {
  total_amount?: number | null;
};

export type LoyaltyTransaction = {
  id: string;
  description: string | null;
  points: number;
  created_at: string;
};

export type LoyaltySummary = {
  points: number;
  transactions: LoyaltyTransaction[];
};

export type ActiveReward = {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  category: string;
  icon: string;
  is_active: boolean;
  quantity_available: number | null;
  times_redeemed: number;
  display_order: number;
};

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("full_name, loyalty_points")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to load user profile: ${error.message}`);
  }

  return data ?? null;
}

export async function fetchUpcomingBookings(
  supabase: SupabaseClient,
  userId: string,
  limit = 3
): Promise<UpcomingBooking[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      check_in,
      check_out,
      status,
      booking_rooms (
        rooms (
          name,
          type
        )
      )
    `
    )
    .eq("user_id", userId)
    .gte("check_out", today)
    .in("status", ["confirmed", "checked_in", "pending_payment"])
    .order("check_in", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load upcoming bookings: ${error.message}`);
  }

  return (data ?? []).map((booking) => ({
    id: booking.id,
    check_in: booking.check_in,
    check_out: booking.check_out,
    status: booking.status,
    booking_rooms: normalizeBookingRooms(booking.booking_rooms),
  }));
}

export async function fetchUserBookings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      check_in,
      check_out,
      status,
      total_amount,
      booking_rooms (
        rooms (name, type)
      )
    `
    )
    .eq("user_id", userId)
    .order("check_in", { ascending: false });

  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  return (data ?? []).map((booking) => ({
    id: booking.id,
    check_in: booking.check_in,
    check_out: booking.check_out,
    status: booking.status,
    total_amount: booking.total_amount,
    booking_rooms: normalizeBookingRooms(booking.booking_rooms),
  }));
}

function normalizeBookingRooms(
  bookingRooms:
    | {
        rooms:
          | { name: string | null; type?: string | null }
          | { name: string | null; type?: string | null }[]
          | null;
      }[]
    | null
    | undefined
): BookingRoom[] {
  if (!bookingRooms) {
    return [];
  }

  return bookingRooms.map((entry) => {
    const roomData = Array.isArray(entry.rooms) ? entry.rooms[0] : entry.rooms;

    return {
      rooms: roomData
        ? {
            name: roomData.name ?? null,
            type: roomData.type ?? null,
          }
        : null,
    };
  });
}

export async function fetchLoyaltySummary(
  supabase: SupabaseClient,
  userId: string
): Promise<LoyaltySummary> {
  const [userResult, transactionsResult] = await Promise.all([
    supabase.from("users").select("loyalty_points").eq("id", userId).single(),
    supabase
      .from("loyalty_transactions")
      .select("id, description, points, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (userResult.error) {
    throw new Error(
      `Failed to load loyalty points: ${userResult.error.message}`
    );
  }
  if (transactionsResult.error) {
    throw new Error(
      `Failed to load loyalty transactions: ${transactionsResult.error.message}`
    );
  }

  return {
    points: userResult.data?.loyalty_points ?? 0,
    transactions: (transactionsResult.data ?? []) as LoyaltyTransaction[],
  };
}

export async function fetchActiveRewards(
  supabase: SupabaseClient
): Promise<ActiveReward[]> {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) {
    throw new Error(`Failed to load rewards: ${error.message}`);
  }

  return (data ?? []) as ActiveReward[];
}
