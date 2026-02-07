"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Booking } from "@/types/database";

interface CreateBookingInput {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  rooms: { roomId: string; bedId?: string; pricePerNight: number }[];
  services?: {
    serviceId: string;
    quantity: number;
    priceAtBooking: number;
    scheduledDate?: string;
  }[];
  specialRequests?: string;
  source?: "direct" | "walk_in" | "phone" | "ota";
  guestInfo: {
    email: string;
    fullName: string;
    phone?: string;
    nationality?: string;
  };
}

// Create a new booking
export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient();

  // Get or create user
  const { data: authUser } = await supabase.auth.getUser();
  let userId = authUser?.user?.id;

  if (!userId) {
    // Create guest user for walk-in or phone bookings
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.guestInfo.email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          email: input.guestInfo.email,
          full_name: input.guestInfo.fullName,
          phone: input.guestInfo.phone,
          nationality: input.guestInfo.nationality,
        })
        .select("id")
        .single();

      if (userError) {
        console.error("Error creating user:", userError);
        throw new Error("Failed to create user");
      }
      userId = newUser.id;
    }
  }

  // Calculate total amount
  const nights = Math.ceil(
    (new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  let roomsTotal = 0;
  input.rooms.forEach((room) => {
    roomsTotal += room.pricePerNight * nights;
  });

  let servicesTotal = 0;
  input.services?.forEach((service) => {
    servicesTotal += service.priceAtBooking * service.quantity;
  });

  const totalAmount = roomsTotal + servicesTotal;

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests_count: input.guestsCount,
      total_amount: totalAmount,
      special_requests: input.specialRequests,
      source: input.source || "direct",
      status: "pending_payment",
      payment_status: "pending",
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Error creating booking:", bookingError);
    throw new Error("Failed to create booking");
  }

  // Insert booking rooms
  const bookingRoomsData = input.rooms.map((room) => ({
    booking_id: booking.id,
    room_id: room.roomId,
    bed_id: room.bedId || null,
    price_per_night: room.pricePerNight,
  }));

  const { error: roomsError } = await supabase
    .from("booking_rooms")
    .insert(bookingRoomsData);

  if (roomsError) {
    console.error("Error creating booking rooms:", roomsError);
    // Rollback booking
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw new Error("Failed to create booking rooms");
  }

  // Insert booking services if any
  if (input.services && input.services.length > 0) {
    const bookingServicesData = input.services.map((service) => ({
      booking_id: booking.id,
      service_id: service.serviceId,
      quantity: service.quantity,
      price_at_booking: service.priceAtBooking,
      scheduled_date: service.scheduledDate || null,
    }));

    const { error: servicesError } = await supabase
      .from("booking_services")
      .insert(bookingServicesData);

    if (servicesError) {
      console.error("Error creating booking services:", servicesError);
    }
  }

  // Create check-in data record
  await supabase.from("check_in_data").insert({
    booking_id: booking.id,
    terms_accepted: false,
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");

  return booking as Booking;
}

// Get booking by ID
export async function getBookingById(bookingId: string) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users (*),
      booking_rooms (
        *,
        rooms (*),
        beds (*)
      ),
      booking_services (
        *,
        services (*)
      ),
      check_in_data (*)
    `
    )
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    throw new Error("Failed to fetch booking");
  }

  return booking;
}

// Get booking by ID (Public/Admin - Bypasses RLS for confirmation page)
export async function getBookingByIdPublic(bookingId: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    throw new Error("Server configuration error: Missing service role key");
  }

  const supabase = createAdminDbClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users (full_name, email, phone, nationality),
      booking_rooms (
        rooms (id, name),
        bed_id,
        price_per_night
      ),
      booking_services (
        service_id,
        quantity,
        price_at_booking,
        scheduled_date,
        services (name)
      )
    `
    )
    .eq("id", bookingId)
    .single();

  if (error) {
    console.error(`[getBookingByIdPublic] Error fetching booking ${bookingId}:`, error);
    // Return null explicitly if not found to allow retries
    if (error.code === 'PGRST116') {
      console.log(`[getBookingByIdPublic] Booking ${bookingId} not found (PGRST116)`);
      return null;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  console.log(`[getBookingByIdPublic] Successfully found booking ${bookingId}:`, {
    id: booking?.id,
    checkIn: booking?.check_in,
    status: booking?.status
  });

  return booking;
}

// Get user bookings
export async function getUserBookings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      booking_rooms (
        *,
        rooms (name, type)
      )
    `
    )
    .eq("user_id", user.id)
    .order("check_in", { ascending: false });

  if (error) {
    console.error("Error fetching user bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  return bookings;
}

// Admin: Get all bookings
export async function getAllBookings(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      `
      *,
      users (full_name, email),
      booking_rooms (
        *,
        rooms (name, type)
      )
    `
    )
    .order("check_in", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.startDate) {
    query = query.gte("check_in", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("check_out", filters.endDate);
  }

  const { data: bookings, error } = await query;

  if (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error("Failed to fetch bookings");
  }

  return bookings;
}

// Update booking status
export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"]
) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }

  // NOTE: Loyalty points are awarded in completeCheckOut() from check-in.ts
  // to avoid duplicate point awards and ensure proper point calculation

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");

  return booking as Booking;
}

// Cancellation policy: Refunds only if cancelled 5+ days before check-in
const CANCELLATION_DAYS_THRESHOLD = 5;

export interface CancellationResult {
  booking: Booking;
  refundEligible: boolean;
  refundProcessed: boolean;
  daysUntilCheckIn: number;
  message: string;
}

// Cancel booking with refund policy enforcement
export async function cancelBooking(
  bookingId: string
): Promise<CancellationResult> {
  const supabase = await createClient();

  // First, get the booking to check check-in date
  const { data: existingBooking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !existingBooking) {
    console.error("Error fetching booking:", fetchError);
    throw new Error("Booking not found");
  }

  // Calculate days until check-in
  const checkInDate = new Date(existingBooking.check_in);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkInDate.setHours(0, 0, 0, 0);

  const diffTime = checkInDate.getTime() - today.getTime();
  const daysUntilCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine if refund is eligible (5+ days before check-in)
  const refundEligible = daysUntilCheckIn >= CANCELLATION_DAYS_THRESHOLD;

  // Update booking status to cancelled
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error cancelling booking:", error);
    throw new Error("Failed to cancel booking");
  }

  let refundProcessed = false;
  let message = "";

  // Process refund handling (manual process - Tab.travel payments)
  if (refundEligible && booking.paid_amount > 0) {
    // Refunds are handled manually by admin
    await supabase
      .from("bookings")
      .update({
        payment_status: "refunded",
        special_requests:
          (booking.special_requests || "") +
          "\n[REFUND REQUIRED] Manual refund needed - contact guest directly",
      })
      .eq("id", bookingId)

    refundProcessed = true
    message = `Booking cancelled. Manual refund required (${daysUntilCheckIn} days before check-in). Process refund directly with the guest.`
  } else if (!refundEligible && booking.paid_amount > 0) {
    message = `Booking cancelled WITHOUT refund. Policy: cancellations less than ${CANCELLATION_DAYS_THRESHOLD} days before check-in are non-refundable (${daysUntilCheckIn} days before check-in).`
  } else {
    message = "Booking cancelled."
  }

  revalidatePath("/admin/bookings");

  return {
    booking: booking as Booking,
    refundEligible,
    refundProcessed,
    daysUntilCheckIn,
    message,
  };
}

// Check if a booking can be cancelled with refund
export async function canCancelWithRefund(checkInDate: string | Date): Promise<{
  eligible: boolean;
  daysUntilCheckIn: number;
}> {
  const checkIn = new Date(checkInDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkIn.setHours(0, 0, 0, 0);

  const diffTime = checkIn.getTime() - today.getTime();
  const daysUntilCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    eligible: daysUntilCheckIn >= CANCELLATION_DAYS_THRESHOLD,
    daysUntilCheckIn,
  };
}

// Admin: Get today's check-ins and check-outs
export async function getTodayMovements() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: checkIns } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users (full_name, email),
      booking_rooms (rooms (name))
    `
    )
    .eq("check_in", today)
    .in("status", ["confirmed", "pending_payment"]);

  const { data: checkOuts } = await supabase
    .from("bookings")
    .select(
      `
      *,
      users (full_name, email),
      booking_rooms (rooms (name))
    `
    )
    .eq("check_out", today)
    .eq("status", "checked_in");

  return {
    checkIns: checkIns || [],
    checkOuts: checkOuts || [],
  };
}
