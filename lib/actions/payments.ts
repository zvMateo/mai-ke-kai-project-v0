"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { sendBookingConfirmation } from "@/lib/email"
import { revalidatePath } from "next/cache"

/**
 * Record a manual payment (partial or full).
 * Used by admin to record cash, transfer, or other manual payments.
 */
export async function recordManualPayment(
  bookingId: string,
  amount: number,
  paymentMethod: string,
  notes?: string
) {
  const supabase = createAdminClient()

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("total_amount, paid_amount")
    .eq("id", bookingId)
    .single()

  if (fetchError) {
    throw new Error("Booking not found")
  }

  const newPaidAmount = (booking.paid_amount || 0) + amount
  const newPaymentStatus =
    newPaidAmount >= booking.total_amount ? "paid" : "partial"

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      paid_amount: newPaidAmount,
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (updateError) {
    throw new Error("Failed to record payment")
  }

  revalidatePath("/admin/bookings")

  return { success: true, newPaidAmount, newPaymentStatus }
}

/**
 * Confirm Tab.travel payment - ONE CLICK action for admin.
 * Records full payment + sets status to confirmed + sends email to guest.
 */
export async function confirmTabPayment(bookingId: string) {
  const supabase = createAdminClient()

  // Fetch full booking with user and room details
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(`
      *,
      users (id, email, full_name, phone),
      booking_rooms (
        id, price_per_night,
        rooms (id, name)
      ),
      booking_services (
        id, quantity, price_at_booking,
        services (id, name)
      )
    `)
    .eq("id", bookingId)
    .single()

  if (fetchError || !booking) {
    throw new Error("Booking not found")
  }

  if (booking.status === "confirmed" && booking.payment_status === "paid") {
    return { success: true, alreadyConfirmed: true }
  }

  // Update booking: mark as paid + confirmed in one shot
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      paid_amount: booking.total_amount,
      payment_status: "paid",
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (updateError) {
    throw new Error("Failed to confirm payment")
  }

  // Send confirmation email to guest
  const roomNames = booking.booking_rooms?.map(
    (br: { rooms: { name: string } | null }) => br.rooms?.name || "Room"
  ) || []

  const serviceNames = booking.booking_services?.map(
    (bs: { services: { name: string } | null }) => bs.services?.name || "Service"
  ) || []

  const guestEmail = booking.users?.email
  const guestName = booking.users?.full_name || "Guest"

  if (guestEmail) {
    try {
      await sendBookingConfirmation({
        to: guestEmail,
        bookingId: booking.booking_reference || bookingId.slice(0, 8).toUpperCase(),
        guestName,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        roomNames,
        serviceNames: serviceNames.length > 0 ? serviceNames : undefined,
        total: booking.total_amount,
        paymentStatus: "paid",
        specialRequests: booking.special_requests || undefined,
      })
    } catch {
      // Email failure shouldn't break the confirmation
    }
  }

  revalidatePath("/admin/bookings")
  revalidatePath(`/admin/bookings/${bookingId}`)

  return { success: true, alreadyConfirmed: false }
}
