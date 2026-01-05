"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateManualBookingInput {
  guestInfo: {
    email: string
    fullName: string
    phone?: string
    nationality?: string
  }
  checkIn: string
  checkOut: string
  guestsCount: number
  source: "walk_in" | "phone" | "ota"
  specialRequests?: string
  rooms: { roomId: string; bedId?: string; quantity: number; pricePerNight: number }[]
  services?: { serviceId: string; quantity: number; priceAtBooking: number }[]
  paymentStatus: "pending" | "partial" | "paid"
  paidAmount: number
}

export async function createManualBooking(input: CreateManualBookingInput) {
  const supabase = await createClient()

  // Check if user exists or create new one
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", input.guestInfo.email).single()

  let userId: string

  if (existingUser) {
    userId = existingUser.id
    // Update user info
    await supabase
      .from("users")
      .update({
        full_name: input.guestInfo.fullName,
        phone: input.guestInfo.phone,
        nationality: input.guestInfo.nationality,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  } else {
    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: input.guestInfo.email,
        full_name: input.guestInfo.fullName,
        phone: input.guestInfo.phone,
        nationality: input.guestInfo.nationality,
      })
      .select("id")
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      throw new Error("Error al crear el usuario")
    }
    userId = newUser.id
  }

  // Calculate totals
  const nights = Math.ceil(
    (new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) / (1000 * 60 * 60 * 24),
  )

  let roomsTotal = 0
  input.rooms.forEach((room) => {
    roomsTotal += room.pricePerNight * room.quantity * nights
  })

  let servicesTotal = 0
  input.services?.forEach((service) => {
    servicesTotal += service.priceAtBooking * service.quantity
  })

  const subtotal = roomsTotal + servicesTotal
  const tax = subtotal * 0.13
  const totalAmount = subtotal + tax

  // Determine booking status based on payment
  const status = input.paymentStatus === "paid" ? "confirmed" : "pending_payment"

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests_count: input.guestsCount,
      total_amount: totalAmount,
      paid_amount: input.paidAmount,
      special_requests: input.specialRequests,
      source: input.source,
      status,
      payment_status: input.paymentStatus,
    })
    .select()
    .single()

  if (bookingError) {
    console.error("Error creating booking:", bookingError)
    throw new Error("Error al crear la reserva")
  }

  // Insert booking rooms
  const bookingRoomsData = input.rooms.map((room) => ({
    booking_id: booking.id,
    room_id: room.roomId,
    bed_id: room.bedId || null,
    price_per_night: room.pricePerNight,
  }))

  const { error: roomsError } = await supabase.from("booking_rooms").insert(bookingRoomsData)

  if (roomsError) {
    console.error("Error creating booking rooms:", roomsError)
    await supabase.from("bookings").delete().eq("id", booking.id)
    throw new Error("Error al asignar habitaciones")
  }

  // Insert booking services
  if (input.services && input.services.length > 0) {
    const bookingServicesData = input.services.map((service) => ({
      booking_id: booking.id,
      service_id: service.serviceId,
      quantity: service.quantity,
      price_at_booking: service.priceAtBooking,
    }))

    await supabase.from("booking_services").insert(bookingServicesData)
  }

  // Create check-in data record
  await supabase.from("check_in_data").insert({
    booking_id: booking.id,
    terms_accepted: false,
  })

  revalidatePath("/admin/bookings")
  revalidatePath("/admin/calendar")

  return { bookingId: booking.id }
}

// Update booking details
export async function updateBookingDetails(
  bookingId: string,
  data: {
    checkIn?: string
    checkOut?: string
    guestsCount?: number
    specialRequests?: string
    status?: string
  },
) {
  const supabase = await createClient()

  const updateData: any = { updated_at: new Date().toISOString() }
  if (data.checkIn) updateData.check_in = data.checkIn
  if (data.checkOut) updateData.check_out = data.checkOut
  if (data.guestsCount) updateData.guests_count = data.guestsCount
  if (data.specialRequests !== undefined) updateData.special_requests = data.specialRequests
  if (data.status) updateData.status = data.status

  const { error } = await supabase.from("bookings").update(updateData).eq("id", bookingId)

  if (error) {
    console.error("Error updating booking:", error)
    throw new Error("Error al actualizar la reserva")
  }

  revalidatePath("/admin/bookings")
  return { success: true }
}

// Get booking details for admin
export async function getAdminBookingDetails(bookingId: string) {
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      users (*),
      booking_rooms (
        *,
        rooms (name, type),
        beds (bed_number)
      ),
      booking_services (
        *,
        services (name, category)
      ),
      check_in_data (*)
    `)
    .eq("id", bookingId)
    .single()

  if (error) {
    console.error("Error fetching booking:", error)
    throw new Error("Reserva no encontrada")
  }

  return booking
}

// Process check-in from admin
export async function adminProcessCheckIn(bookingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) {
    console.error("Error processing check-in:", error)
    throw new Error("Error al procesar check-in")
  }

  revalidatePath("/admin/bookings")
  return { success: true }
}

// Process check-out from admin
export async function adminProcessCheckOut(bookingId: string) {
  const supabase = await createClient()

  // Get booking for loyalty points
  const { data: booking } = await supabase.from("bookings").select("user_id, total_amount").eq("id", bookingId).single()

  if (!booking) throw new Error("Reserva no encontrada")

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "checked_out",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) {
    console.error("Error processing check-out:", error)
    throw new Error("Error al procesar check-out")
  }

  // Award loyalty points (1 point per dollar spent)
  const points = Math.floor(booking.total_amount)

  if (points > 0) {
    // Add transaction
    await supabase.from("loyalty_transactions").insert({
      user_id: booking.user_id,
      points,
      description: `Estancia completada - Reserva #${bookingId.slice(0, 8)}`,
      booking_id: bookingId,
    })

    // Update user points
    const { data: user } = await supabase.from("users").select("loyalty_points").eq("id", booking.user_id).single()

    if (user) {
      await supabase
        .from("users")
        .update({ loyalty_points: user.loyalty_points + points })
        .eq("id", booking.user_id)
    }
  }

  revalidatePath("/admin/bookings")
  return { success: true, pointsAwarded: points }
}

// Mark booking as no-show
export async function markAsNoShow(bookingId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "no_show",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) {
    console.error("Error marking as no-show:", error)
    throw new Error("Error al marcar como no-show")
  }

  revalidatePath("/admin/bookings")
  return { success: true }
}
