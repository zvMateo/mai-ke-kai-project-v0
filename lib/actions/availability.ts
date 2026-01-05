"use server"

import { createClient } from "@/lib/supabase/server"
import type { Room, Bed } from "@/types/database"

interface AvailabilityResult {
  room: Room & { beds: Bed[] }
  availableBeds: Bed[]
  totalBeds: number
  bookedBeds: number
  isFullyBooked: boolean
  isBlocked: boolean
}

// Check availability for date range
export async function checkAvailability(checkIn: string, checkOut: string): Promise<AvailabilityResult[]> {
  const supabase = await createClient()

  // Get all active rooms with beds
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select(`
      *,
      beds (*)
    `)
    .eq("is_active", true)

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError)
    throw new Error("Failed to fetch rooms")
  }

  // Get bookings that overlap with the requested dates
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_rooms (
        room_id,
        bed_id
      )
    `)
    .not("status", "in", '("cancelled","no_show")')
    .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`)

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError)
    throw new Error("Failed to fetch bookings")
  }

  // Get room blocks that overlap
  const { data: blocks, error: blocksError } = await supabase
    .from("room_blocks")
    .select("*")
    .or(`and(start_date.lte.${checkOut},end_date.gte.${checkIn})`)

  if (blocksError) {
    console.error("Error fetching blocks:", blocksError)
    throw new Error("Failed to fetch blocks")
  }

  // Build set of booked bed IDs and blocked room/bed IDs
  const bookedBedIds = new Set<string>()
  const bookedRoomIds = new Set<string>()
  const blockedRoomIds = new Set<string>()
  const blockedBedIds = new Set<string>()

  bookings?.forEach((booking) => {
    booking.booking_rooms?.forEach((br: { room_id: string; bed_id: string | null }) => {
      if (br.bed_id) {
        bookedBedIds.add(br.bed_id)
      } else {
        // Whole room is booked
        bookedRoomIds.add(br.room_id)
      }
    })
  })

  blocks?.forEach((block) => {
    if (block.bed_id) {
      blockedBedIds.add(block.bed_id)
    } else {
      blockedRoomIds.add(block.room_id)
    }
  })

  // Calculate availability for each room
  const availability: AvailabilityResult[] = (rooms as (Room & { beds: Bed[] })[]).map((room) => {
    const isRoomBlocked = blockedRoomIds.has(room.id)
    const isRoomBooked = bookedRoomIds.has(room.id)

    if (isRoomBlocked || isRoomBooked) {
      return {
        room,
        availableBeds: [],
        totalBeds: room.beds.length,
        bookedBeds: room.beds.length,
        isFullyBooked: true,
        isBlocked: isRoomBlocked,
      }
    }

    const availableBeds = room.beds.filter(
      (bed) => bed.is_active && !bookedBedIds.has(bed.id) && !blockedBedIds.has(bed.id),
    )

    return {
      room,
      availableBeds,
      totalBeds: room.beds.filter((b) => b.is_active).length,
      bookedBeds: room.beds.filter((b) => b.is_active).length - availableBeds.length,
      isFullyBooked: availableBeds.length === 0,
      isBlocked: false,
    }
  })

  return availability
}

// Get calendar availability for a month
export async function getCalendarAvailability(year: number, month: number) {
  const supabase = await createClient()

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const startStr = startDate.toISOString().split("T")[0]
  const endStr = endDate.toISOString().split("T")[0]

  // Get all bookings for the month
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in,
      check_out,
      status,
      guests_count,
      booking_rooms (
        room_id,
        bed_id
      )
    `)
    .not("status", "in", '("cancelled","no_show")')
    .or(`and(check_in.lte.${endStr},check_out.gte.${startStr})`)

  if (error) {
    console.error("Error fetching calendar bookings:", error)
    throw new Error("Failed to fetch calendar data")
  }

  // Get rooms for total bed count
  const { data: rooms } = await supabase.from("rooms").select("id, beds(id)").eq("is_active", true)

  const totalBeds = rooms?.reduce((sum, room) => sum + (room.beds?.length || 0), 0) || 0

  // Build daily occupancy map
  const dailyOccupancy: Record<string, { booked: number; total: number }> = {}

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    dailyOccupancy[dateStr] = { booked: 0, total: totalBeds }
  }

  bookings?.forEach((booking) => {
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)

    for (
      let d = new Date(Math.max(checkIn.getTime(), startDate.getTime()));
      d < checkOut && d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0]
      if (dailyOccupancy[dateStr]) {
        dailyOccupancy[dateStr].booked += booking.booking_rooms?.length || 1
      }
    }
  })

  return dailyOccupancy
}
