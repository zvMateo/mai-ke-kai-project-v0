import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, Service, SurfPackage, User } from "@/types/database";
import type { LoyaltyReward } from "@/lib/actions/loyalty";

export type BasicFilter = { isActive?: boolean };

export type RoomWithDetails = Room & {
  beds?: {
    id: string;
    bed_number: number;
    bed_type: string;
    is_active: boolean;
  }[];
  season_pricing?: {
    season: string;
    base_price: number;
    rack_rate: number;
    competitive_rate?: number;
  }[];
};

export type AdminDashboardStats = {
  totalBookings: number;
  activeBookings: number;
  checkInsToday: number;
  checkOutsToday: number;
  totalRevenue: number;
  totalUsers: number;
};

export async function fetchAdminDashboardStats(
  supabase: SupabaseClient
): Promise<AdminDashboardStats> {
  const today = new Date().toISOString().split("T")[0];

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");

  const { count: checkInsToday } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("check_in", today)
    .eq("status", "confirmed");

  const { count: checkOutsToday } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("check_out", today)
    .eq("status", "checked_in");

  const { data: revenueData } = await supabase
    .from("bookings")
    .select("paid_amount")
    .eq("payment_status", "paid");

  const totalRevenue =
    revenueData?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;

  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return {
    totalBookings: totalBookings ?? 0,
    activeBookings: activeBookings ?? 0,
    checkInsToday: checkInsToday ?? 0,
    checkOutsToday: checkOutsToday ?? 0,
    totalRevenue,
    totalUsers: totalUsers ?? 0,
  };
}

export async function fetchRooms(
  supabase: SupabaseClient,
  filters?: BasicFilter
): Promise<RoomWithDetails[]> {
  let query = supabase
    .from("rooms")
    .select(
      `
      *,
      beds (id, bed_number, bed_type, is_active),
      season_pricing (season, base_price, rack_rate, competitive_rate)
    `
    )
    .order("name");

  if (typeof filters?.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }

  return (data ?? []) as RoomWithDetails[];
}

export async function fetchServices(
  supabase: SupabaseClient,
  filters?: {
    category?: Service["category"];
    isActive?: boolean;
  }
): Promise<Service[]> {
  let query = supabase.from("services").select("*").order("name");

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (typeof filters?.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }

  return (data ?? []) as Service[];
}

export async function fetchPackages(
  supabase: SupabaseClient,
  filters?: BasicFilter
): Promise<SurfPackage[]> {
  let query = supabase.from("surf_packages").select("*").order("display_order");

  if (typeof filters?.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch packages: ${error.message}`);
  }

  return (data ?? []) as SurfPackage[];
}

export async function fetchRewards(
  supabase: SupabaseClient,
  filters?: BasicFilter
): Promise<LoyaltyReward[]> {
  let query = supabase
    .from("loyalty_rewards")
    .select("*")
    .order("display_order");

  if (typeof filters?.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch rewards: ${error.message}`);
  }

  return (data ?? []) as LoyaltyReward[];
}

export async function fetchUsers(
  supabase: SupabaseClient,
  filters?: { role?: User["role"] }
): Promise<User[]> {
  let query = supabase.from("users").select("*").order("full_name");

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (data ?? []) as User[];
}
