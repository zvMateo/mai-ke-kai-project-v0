"use server"

import { createClient } from "@/lib/supabase/server"

interface RevenueReport {
  totalRevenue: number
  roomRevenue: number
  serviceRevenue: number
  bookingsCount: number
  averageBookingValue: number
  occupancyRate: number
  dailyRevenue: { date: string; amount: number }[]
}

interface OccupancyReport {
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
  byRoom: { roomName: string; occupied: number; total: number; rate: number }[]
  dailyOccupancy: { date: string; rate: number }[]
}

// Get revenue report for date range
export async function getRevenueReport(startDate: string, endDate: string): Promise<RevenueReport> {
  const supabase = await createClient()

  // Get bookings in date range
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      total_amount,
      paid_amount,
      check_in,
      check_out,
      booking_rooms (price_per_night),
      booking_services (price_at_booking, quantity)
    `)
    .gte("check_in", startDate)
    .lte("check_in", endDate)
    .in("status", ["confirmed", "checked_in", "checked_out"])

  if (!bookings || bookings.length === 0) {
    return {
      totalRevenue: 0,
      roomRevenue: 0,
      serviceRevenue: 0,
      bookingsCount: 0,
      averageBookingValue: 0,
      occupancyRate: 0,
      dailyRevenue: [],
    }
  }

  let totalRevenue = 0
  let roomRevenue = 0
  let serviceRevenue = 0
  const dailyRevenueMap: Record<string, number> = {}

  bookings.forEach((booking) => {
    totalRevenue += booking.paid_amount || 0

    // Calculate room revenue
    const nights = Math.ceil(
      (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24),
    )
    booking.booking_rooms?.forEach((br: any) => {
      roomRevenue += br.price_per_night * nights
    })

    // Calculate service revenue
    booking.booking_services?.forEach((bs: any) => {
      serviceRevenue += bs.price_at_booking * bs.quantity
    })

    // Daily revenue
    const dateKey = booking.check_in
    dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + (booking.paid_amount || 0)
  })

  // Get total beds for occupancy
  const { data: rooms } = await supabase.from("rooms").select("beds(id)").eq("is_active", true)

  const totalBeds = rooms?.reduce((sum, room) => sum + (room.beds?.length || 0), 0) || 18

  // Calculate occupancy (simplified)
  const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalBedNights = totalBeds * totalDays
  const occupiedBedNights = bookings.reduce((sum, b) => {
    const nights = Math.ceil((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / (1000 * 60 * 60 * 24))
    return sum + (b.booking_rooms?.length || 1) * nights
  }, 0)

  const occupancyRate = totalBedNights > 0 ? (occupiedBedNights / totalBedNights) * 100 : 0

  return {
    totalRevenue,
    roomRevenue,
    serviceRevenue,
    bookingsCount: bookings.length,
    averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    occupancyRate,
    dailyRevenue: Object.entries(dailyRevenueMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

// Get occupancy report
export async function getOccupancyReport(startDate: string, endDate: string): Promise<OccupancyReport> {
  const supabase = await createClient()

  // Get rooms with beds
  const { data: rooms } = await supabase
    .from("rooms")
    .select(`
      id,
      name,
      beds (id)
    `)
    .eq("is_active", true)

  if (!rooms) {
    return {
      totalBeds: 0,
      occupiedBeds: 0,
      occupancyRate: 0,
      byRoom: [],
      dailyOccupancy: [],
    }
  }

  const totalBeds = rooms.reduce((sum, room) => sum + (room.beds?.length || 0), 0)

  // Get bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      check_in,
      check_out,
      booking_rooms (room_id, bed_id)
    `)
    .not("status", "in", '("cancelled","no_show")')
    .or(`and(check_in.lte.${endDate},check_out.gte.${startDate})`)

  // Calculate per-room occupancy
  const roomOccupancy: Record<string, { occupied: Set<string>; total: number }> = {}
  rooms.forEach((room) => {
    roomOccupancy[room.id] = {
      occupied: new Set(),
      total: room.beds?.length || 0,
    }
  })

  // Track occupied beds per day
  const dailyOccupancyMap: Record<string, number> = {}
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyOccupancyMap[d.toISOString().split("T")[0]] = 0
  }

  bookings?.forEach((booking) => {
    booking.booking_rooms?.forEach((br: any) => {
      if (br.bed_id) {
        roomOccupancy[br.room_id]?.occupied.add(br.bed_id)
      }
    })

    // Update daily occupancy
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)

    for (
      let d = new Date(Math.max(checkIn.getTime(), start.getTime()));
      d < checkOut && d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0]
      if (dailyOccupancyMap[dateStr] !== undefined) {
        dailyOccupancyMap[dateStr] += booking.booking_rooms?.length || 1
      }
    }
  })

  const occupiedBeds = Object.values(roomOccupancy).reduce((sum, room) => sum + room.occupied.size, 0)

  const byRoom = rooms.map((room) => ({
    roomName: room.name,
    occupied: roomOccupancy[room.id]?.occupied.size || 0,
    total: roomOccupancy[room.id]?.total || 0,
    rate:
      roomOccupancy[room.id]?.total > 0
        ? (roomOccupancy[room.id].occupied.size / roomOccupancy[room.id].total) * 100
        : 0,
  }))

  const dailyOccupancy = Object.entries(dailyOccupancyMap).map(([date, occupied]) => ({
    date,
    rate: totalBeds > 0 ? (occupied / totalBeds) * 100 : 0,
  }))

  return {
    totalBeds,
    occupiedBeds,
    occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    byRoom,
    dailyOccupancy,
  }
}

// Get services report
export async function getServicesReport(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data: bookingServices } = await supabase
    .from("booking_services")
    .select(`
      quantity,
      price_at_booking,
      services (name, category)
    `)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)

  const serviceStats: Record<string, { name: string; category: string; count: number; revenue: number }> = {}

  bookingServices?.forEach((bs) => {
    const key = (bs.services as any)?.name || "Unknown"
    if (!serviceStats[key]) {
      serviceStats[key] = {
        name: key,
        category: (bs.services as any)?.category || "other",
        count: 0,
        revenue: 0,
      }
    }
    serviceStats[key].count += bs.quantity
    serviceStats[key].revenue += bs.price_at_booking * bs.quantity
  })

  return Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue)
}

// Get dashboard stats
export async function getDashboardStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  // Today's check-ins/outs
  const { data: todayCheckIns } = await supabase
    .from("bookings")
    .select("id")
    .eq("check_in", today)
    .in("status", ["confirmed", "pending_payment"])

  const { data: todayCheckOuts } = await supabase
    .from("bookings")
    .select("id")
    .eq("check_out", today)
    .eq("status", "checked_in")

  // Current occupancy
  const { data: currentGuests } = await supabase.from("bookings").select("booking_rooms(id)").eq("status", "checked_in")

  const { data: rooms } = await supabase.from("rooms").select("beds(id)").eq("is_active", true)

  const totalBeds = rooms?.reduce((sum, r) => sum + (r.beds?.length || 0), 0) || 18
  const occupiedBeds = currentGuests?.reduce((sum, b) => sum + (b.booking_rooms?.length || 0), 0) || 0

  // Monthly revenue
  const { data: monthlyBookings } = await supabase
    .from("bookings")
    .select("paid_amount")
    .gte("check_in", monthStart)
    .in("status", ["confirmed", "checked_in", "checked_out"])

  const monthlyRevenue = monthlyBookings?.reduce((sum, b) => sum + (b.paid_amount || 0), 0) || 0

  // Pending bookings
  const { data: pendingBookings } = await supabase.from("bookings").select("id").eq("status", "pending_payment")

  return {
    todayCheckIns: todayCheckIns?.length || 0,
    todayCheckOuts: todayCheckOuts?.length || 0,
    currentOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    occupiedBeds,
    totalBeds,
    monthlyRevenue,
    pendingBookings: pendingBookings?.length || 0,
  }
}
