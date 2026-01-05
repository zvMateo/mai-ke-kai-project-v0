"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  guestInfo: {
    email: string;
    fullName: string;
    phone?: string;
    nationality?: string;
  };
}

interface CreateBookingResult {
  bookingId: string;
  totalAmount: number;
}

// Create booking and return booking details (GreenPay payment handled separately)
export async function createBookingWithCheckout(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  console.log("[v0] Starting createBookingWithCheckout", {
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    roomsCount: input.rooms.length,
    servicesCount: input.services?.length || 0,
    email: input.guestInfo.email,
  });

  const supabase = createAdminClient();
  const authClient = await createClient();

  // Get authenticated user if exists
  const { data: authUser } = await authClient.auth.getUser();
  let userId = authUser?.user?.id;

  console.log("[v0] Auth user:", userId || "none");

  if (!userId) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.guestInfo.email)
      .maybeSingle();

    console.log("[v0] Existing user:", existingUser?.id || "none");

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new guest user (using admin client)
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
        console.error("[v0] Error creating user:", userError);
        throw new Error("Failed to create user");
      }
      userId = newUser.id;
      console.log("[v0] Created new user:", userId);
    }
  }

  // Calculate totals
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

  const subtotal = roomsTotal + servicesTotal;
  const tax = subtotal * 0.13; // Costa Rica IVA
  const totalAmount = subtotal + tax;

  console.log("[v0] Booking totals:", {
    nights,
    roomsTotal,
    servicesTotal,
    subtotal,
    tax,
    totalAmount,
  });

  // Create booking in database (using admin client)
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests_count: input.guestsCount,
      total_amount: totalAmount,
      special_requests: input.specialRequests,
      source: "direct",
      status: "pending_payment",
      payment_status: "pending",
    })
    .select()
    .single();

  if (bookingError) {
    console.error("[v0] Error creating booking:", bookingError);
    throw new Error("Failed to create booking");
  }

  console.log("[v0] Created booking:", booking.id);

  console.log("[v0] Booking rooms data:", input.rooms);

  // Insert booking rooms
  const bookingRoomsData = input.rooms.map((room) => ({
    booking_id: booking.id,
    room_id: room.roomId,
    bed_id: room.bedId || null,
    price_per_night: room.pricePerNight,
  }));

  console.log("[v0] Inserting booking_rooms:", bookingRoomsData);

  const { error: roomsError } = await supabase
    .from("booking_rooms")
    .insert(bookingRoomsData);

  if (roomsError) {
    console.error("[v0] Error creating booking rooms:", roomsError);
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw new Error("Failed to create booking rooms");
  }

  if (input.services && input.services.length > 0) {
    console.log("[v0] Services to insert:", input.services);

    const bookingServicesData = input.services.map((service) => ({
      booking_id: booking.id,
      service_id: service.serviceId,
      quantity: service.quantity,
      price_at_booking: service.priceAtBooking,
      scheduled_date: service.scheduledDate || null,
    }));

    console.log("[v0] Inserting booking_services:", bookingServicesData);

    const { error: servicesError } = await supabase
      .from("booking_services")
      .insert(bookingServicesData);

    if (servicesError) {
      console.error("[v0] Error creating booking services:", servicesError);
      // Don't fail the entire booking if services fail, just log it
      console.warn("[v0] Booking created but services failed to attach");
    }
  }

  // Create check-in data record
  await supabase.from("check_in_data").insert({
    booking_id: booking.id,
    terms_accepted: false,
  });

  console.log("[v0] Booking created successfully:", {
    bookingId: booking.id,
    totalAmount: totalAmount,
  });

  return {
    bookingId: booking.id,
    totalAmount: totalAmount,
  };
}
