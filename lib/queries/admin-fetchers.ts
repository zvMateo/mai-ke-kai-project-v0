import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, Service, SurfPackage, User, Booking } from "@/types/database";
import type { LoyaltyReward } from "@/lib/actions/loyalty";
import {
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
} from "date-fns";

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

// ============================================================================
// NEW FETCHERS FOR DASHBOARD CHARTS AND REPORTS
// ============================================================================

export type OccupancyDataPoint = {
  date: string;
  occupancy: number;
  occupiedBeds: number;
  totalBeds: number;
};

export type RoomOccupancyData = {
  id: string;
  name: string;
  type: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
};

export type RecentBooking = {
  id: string;
  bookingReference: string | null;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: string;
  amount: number;
};

export type CalendarBooking = {
  id: string;
  guestName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  color: string;
};

export type RevenueDataPoint = {
  month: string;
  accommodation: number;
  services: number;
  total: number;
};

export type MonthlyOccupancy = {
  month: string;
  rate: number;
  target: number;
};

export type ServiceSalesData = {
  name: string;
  value: number;
  color: string;
  count: number;
};

export type ChannelData = {
  name: string;
  bookings: number;
  revenue: number;
  commission: number;
  color: string;
};

export type DashboardGrowth = {
  currentRevenue: number;
  previousRevenue: number;
  percentage: number;
  isPositive: boolean;
};

/**
 * Fetch occupancy data for the last N days
 */
export async function fetchOccupancyHistory(
  supabase: SupabaseClient,
  days: number = 14
): Promise<OccupancyDataPoint[]> {
  const today = new Date();
  const startDate = subDays(today, days - 1);

  // Get total beds count
  const { data: bedsData } = await supabase
    .from("beds")
    .select("id")
    .eq("is_active", true);
  const totalBeds = bedsData?.length || 0;

  // Get all bookings that overlap with our date range
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, guests_count, status")
    .gte("check_out", format(startDate, "yyyy-MM-dd"))
    .lte("check_in", format(today, "yyyy-MM-dd"))
    .in("status", ["confirmed", "checked_in", "checked_out"]);

  // Get room blocks
  const { data: blocks } = await supabase
    .from("room_blocks")
    .select("id, start_date, end_date")
    .gte("end_date", format(startDate, "yyyy-MM-dd"))
    .lte("start_date", format(today, "yyyy-MM-dd"));

  // Calculate occupancy for each day
  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  return dateRange.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    // Count occupied beds for this date
    let occupiedBeds = 0;
    bookings?.forEach((booking) => {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      if (
        isWithinInterval(date, { start: checkIn, end: subDays(checkOut, 1) }) ||
        format(date, "yyyy-MM-dd") === booking.check_in
      ) {
        occupiedBeds += booking.guests_count || 1;
      }
    });

    // Add blocked beds
    blocks?.forEach((block) => {
      const start = parseISO(block.start_date);
      const end = parseISO(block.end_date);
      if (isWithinInterval(date, { start, end })) {
        occupiedBeds += 1; // Each block counts as 1 bed
      }
    });

    const occupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      date: format(date, "MMM d"),
      occupancy: Math.min(occupancy, 100),
      occupiedBeds: Math.min(occupiedBeds, totalBeds),
      totalBeds,
    };
  });
}

/**
 * Fetch current room occupancy (for today)
 */
export async function fetchCurrentRoomOccupancy(
  supabase: SupabaseClient
): Promise<RoomOccupancyData[]> {
  const today = format(new Date(), "yyyy-MM-dd");

  // Get rooms with their beds
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, type, beds(id, is_active)")
    .eq("is_active", true)
    .order("type");

  // Get bookings for today
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, guests_count, booking_rooms(room_id, bed_id)")
    .lte("check_in", today)
    .gt("check_out", today)
    .in("status", ["confirmed", "checked_in"]);

  // Get blocks for today
  const { data: blocks } = await supabase
    .from("room_blocks")
    .select("room_id, bed_id")
    .lte("start_date", today)
    .gte("end_date", today);

  return (rooms || []).map((room) => {
    const activeBeds = room.beds?.filter((b: { is_active: boolean }) => b.is_active) || [];
    const totalBeds = activeBeds.length;

    // Count occupied beds in this room
    let occupiedBeds = 0;
    bookings?.forEach((booking) => {
      booking.booking_rooms?.forEach((br: { room_id: string; bed_id: string | null }) => {
        if (br.room_id === room.id) {
          occupiedBeds += br.bed_id ? 1 : totalBeds; // If bed_id is null, whole room is booked
        }
      });
    });

    // Add blocked beds
    blocks?.forEach((block) => {
      if (block.room_id === room.id) {
        occupiedBeds += block.bed_id ? 1 : totalBeds;
      }
    });

    return {
      id: room.id,
      name: room.name,
      type: room.type,
      totalBeds,
      occupiedBeds: Math.min(occupiedBeds, totalBeds),
      occupancyRate: totalBeds > 0 ? Math.round((Math.min(occupiedBeds, totalBeds) / totalBeds) * 100) : 0,
    };
  });
}

/**
 * Fetch recent bookings for dashboard
 */
export async function fetchRecentBookings(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<RecentBooking[]> {
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      check_in,
      check_out,
      status,
      total_amount,
      users (full_name, email),
      booking_rooms (
        rooms (name, type)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (bookings || []).map((booking) => {
    const user = booking.users as unknown as { full_name: string | null; email: string } | null;
    const rooms = booking.booking_rooms as unknown as Array<{ rooms: { name: string; type: string } | null }> | null;
    const roomInfo = rooms?.[0]?.rooms;

    return {
      id: booking.id,
      bookingReference: booking.booking_reference || null,
      guestName: user?.full_name || "Guest",
      email: user?.email || "",
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      roomType: roomInfo?.name || roomInfo?.type || "Room",
      status: booking.status,
      amount: Number(booking.total_amount) || 0,
    };
  });
}

/**
 * Fetch bookings for calendar view
 */
export async function fetchCalendarBookings(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<CalendarBooking[]> {
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in,
      check_out,
      status,
      users (full_name),
      booking_rooms (
        room_id,
        rooms (id, name, type)
      )
    `)
    .gte("check_out", startDate)
    .lte("check_in", endDate)
    .not("status", "eq", "cancelled");

  const colorMap: Record<string, string> = {
    dorm: "bg-seafoam",
    private: "bg-primary",
    family: "bg-coral",
    female: "bg-amber-500",
  };

  return (bookings || []).flatMap((booking) => {
    const user = booking.users as { full_name: string | null } | null;
    const rooms = booking.booking_rooms || [];

    return rooms.map((br: any) => {
      const roomType = br.rooms?.type?.toLowerCase() || "dorm";
      return {
        id: booking.id,
        guestName: user?.full_name?.split(" ")[0] || "Guest",
        roomId: br.room_id,
        roomName: br.rooms?.name || "Room",
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        status: booking.status,
        color: colorMap[roomType] || "bg-primary",
      };
    });
  });
}

/**
 * Fetch rooms for calendar filter
 */
export async function fetchCalendarRooms(
  supabase: SupabaseClient
): Promise<{ id: string; name: string; type: string }[]> {
  const { data } = await supabase
    .from("rooms")
    .select("id, name, type")
    .eq("is_active", true)
    .order("type");

  return data || [];
}

/**
 * Fetch revenue data for charts (last 12 months)
 */
export async function fetchRevenueHistory(
  supabase: SupabaseClient
): Promise<RevenueDataPoint[]> {
  const now = new Date();
  const months: RevenueDataPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthLabel = format(monthDate, "MMM");

    // Get accommodation revenue
    const { data: bookings } = await supabase
      .from("bookings")
      .select("paid_amount")
      .gte("created_at", format(monthStart, "yyyy-MM-dd"))
      .lte("created_at", format(monthEnd, "yyyy-MM-dd"))
      .eq("payment_status", "paid");

    const accommodation = bookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;

    // Get services revenue
    const { data: services } = await supabase
      .from("booking_services")
      .select("price_at_booking, quantity")
      .gte("scheduled_date", format(monthStart, "yyyy-MM-dd"))
      .lte("scheduled_date", format(monthEnd, "yyyy-MM-dd"));

    const servicesRevenue = services?.reduce(
      (sum, s) => sum + Number(s.price_at_booking) * (s.quantity || 1),
      0
    ) || 0;

    months.push({
      month: monthLabel,
      accommodation,
      services: servicesRevenue,
      total: accommodation + servicesRevenue,
    });
  }

  return months;
}

/**
 * Fetch monthly occupancy for reports (last 12 months)
 */
export async function fetchMonthlyOccupancy(
  supabase: SupabaseClient
): Promise<MonthlyOccupancy[]> {
  const { data: bedsData } = await supabase
    .from("beds")
    .select("id")
    .eq("is_active", true);
  const totalBeds = bedsData?.length || 1;

  const now = new Date();
  const months: MonthlyOccupancy[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
    const monthLabel = format(monthDate, "MMM");

    // Get bookings for this month
    const { data: bookings } = await supabase
      .from("bookings")
      .select("check_in, check_out, guests_count")
      .lte("check_in", format(monthEnd, "yyyy-MM-dd"))
      .gte("check_out", format(monthStart, "yyyy-MM-dd"))
      .in("status", ["confirmed", "checked_in", "checked_out"]);

    // Calculate total bed-nights booked
    let totalBedNights = 0;
    bookings?.forEach((booking) => {
      const checkIn = parseISO(booking.check_in);
      const checkOut = parseISO(booking.check_out);
      const stayStart = checkIn < monthStart ? monthStart : checkIn;
      const stayEnd = checkOut > monthEnd ? monthEnd : subDays(checkOut, 1);

      if (stayStart <= stayEnd) {
        const nights = eachDayOfInterval({ start: stayStart, end: stayEnd }).length;
        totalBedNights += nights * (booking.guests_count || 1);
      }
    });

    const maxBedNights = totalBeds * daysInMonth;
    const rate = Math.round((totalBedNights / maxBedNights) * 100);

    months.push({
      month: monthLabel,
      rate: Math.min(rate, 100),
      target: 70,
    });
  }

  return months;
}

/**
 * Fetch services sales data for reports
 */
export async function fetchServicesSales(
  supabase: SupabaseClient
): Promise<{ categories: ServiceSalesData[]; topServices: Array<{ name: string; category: string; sold: number; revenue: number }> }> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get service bookings with service details
  const { data: bookingServices } = await supabase
    .from("booking_services")
    .select(`
      quantity,
      price_at_booking,
      services (id, name, category)
    `)
    .gte("scheduled_date", format(monthStart, "yyyy-MM-dd"))
    .lte("scheduled_date", format(monthEnd, "yyyy-MM-dd"));

  const categoryColors: Record<string, string> = {
    surf: "#5B8A9A",
    tour: "#E07A5F",
    transport: "#7DCFB6",
    other: "#0E3244",
  };

  const categoryMap: Record<string, { value: number; count: number }> = {};
  const serviceMap: Record<string, { name: string; category: string; sold: number; revenue: number }> = {};

  bookingServices?.forEach((bs) => {
    const service = bs.services as { id: string; name: string; category: string } | null;
    if (!service) return;

    const quantity = bs.quantity || 1;
    const revenue = Number(bs.price_at_booking) * quantity;

    // Category aggregation
    if (!categoryMap[service.category]) {
      categoryMap[service.category] = { value: 0, count: 0 };
    }
    categoryMap[service.category].value += revenue;
    categoryMap[service.category].count += quantity;

    // Service aggregation
    if (!serviceMap[service.id]) {
      serviceMap[service.id] = { name: service.name, category: service.category, sold: 0, revenue: 0 };
    }
    serviceMap[service.id].sold += quantity;
    serviceMap[service.id].revenue += revenue;
  });

  const categories: ServiceSalesData[] = Object.entries(categoryMap).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.value,
    count: data.count,
    color: categoryColors[name] || "#0E3244",
  }));

  const topServices = Object.values(serviceMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return { categories, topServices };
}

/**
 * Fetch channel distribution data
 */
export async function fetchChannelData(
  supabase: SupabaseClient
): Promise<ChannelData[]> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("source, total_amount, paid_amount")
    .gte("created_at", format(monthStart, "yyyy-MM-dd"))
    .lte("created_at", format(monthEnd, "yyyy-MM-dd"))
    .eq("payment_status", "paid");

  const sourceColors: Record<string, string> = {
    direct: "#7DCFB6",
    walk_in: "#5B8A9A",
    phone: "#E07A5F",
    ota: "#FF5A5F",
  };

  const sourceLabels: Record<string, string> = {
    direct: "Direct (Website)",
    walk_in: "Walk-in",
    phone: "Phone",
    ota: "OTA (Booking.com, etc)",
  };

  // Commission rates (only OTAs charge commission)
  const commissionRates: Record<string, number> = {
    direct: 0,
    walk_in: 0,
    phone: 0,
    ota: 0.15, // 15% average OTA commission
  };

  const channelMap: Record<string, { bookings: number; revenue: number }> = {};

  bookings?.forEach((booking) => {
    const source = booking.source || "direct";
    if (!channelMap[source]) {
      channelMap[source] = { bookings: 0, revenue: 0 };
    }
    channelMap[source].bookings += 1;
    channelMap[source].revenue += Number(booking.paid_amount) || 0;
  });

  return Object.entries(channelMap).map(([source, data]) => ({
    name: sourceLabels[source] || source,
    bookings: data.bookings,
    revenue: data.revenue,
    commission: Math.round(data.revenue * (commissionRates[source] || 0)),
    color: sourceColors[source] || "#0E3244",
  }));
}

/**
 * Fetch dashboard growth data (current vs previous month)
 */
export async function fetchDashboardGrowth(
  supabase: SupabaseClient
): Promise<DashboardGrowth> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Current month revenue
  const { data: currentBookings } = await supabase
    .from("bookings")
    .select("paid_amount")
    .gte("created_at", format(currentMonthStart, "yyyy-MM-dd"))
    .lte("created_at", format(currentMonthEnd, "yyyy-MM-dd"))
    .eq("payment_status", "paid");

  const currentRevenue = currentBookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;

  // Previous month revenue
  const { data: previousBookings } = await supabase
    .from("bookings")
    .select("paid_amount")
    .gte("created_at", format(previousMonthStart, "yyyy-MM-dd"))
    .lte("created_at", format(previousMonthEnd, "yyyy-MM-dd"))
    .eq("payment_status", "paid");

  const previousRevenue = previousBookings?.reduce((sum, b) => sum + Number(b.paid_amount), 0) || 0;

  const growthValue = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  const percentage = Math.round(Math.abs(growthValue) * 10) / 10;
  const isPositive = growthValue >= 0;

  return {
    currentRevenue,
    previousRevenue,
    percentage,
    isPositive,
  };
}

/**
 * Fetch total beds count
 */
export async function fetchTotalBeds(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from("beds")
    .select("id")
    .eq("is_active", true);

  return data?.length || 0;
}
