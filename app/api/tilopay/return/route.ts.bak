import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const code = searchParams.get("code");
  const orderId = searchParams.get("order");
  const transactionId = searchParams.get("tilopay-transaction");

  console.log("[Tilopay Return] params:", { code, orderId, transactionId });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const confirmationUrl = `${baseUrl}/booking/booking-confirmation?bookingId=${orderId}`;
  const errorUrl = `${baseUrl}/dashboard?error=payment_processed_but_update_failed&orderId=${orderId}`;
  const failedUrl = `${baseUrl}/booking?error=payment_failed`;

  if (code !== "1" || !orderId) {
    console.log("[Tilopay Return] Pago fallido o cancelado");
    return NextResponse.redirect(failedUrl);
  }

  const supabase = createAdminClient();

  try {
    console.log("[Tilopay Return] Actualizando booking:", orderId);

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        tilopay_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(`
        *,
        users (full_name, email),
        booking_rooms (rooms (name))
      `)
      .single();

    console.log("[Tilopay Return] Booking update result:", { booking, error });

    if (error) {
      console.error("[Tilopay Return] Supabase error:", error);
      return NextResponse.redirect(errorUrl);
    }

    if (booking) {
      console.log("[Tilopay Return] Enviando email de confirmación a:", booking.users.email);
      try {
        await sendBookingConfirmation({
          to: booking.users.email,
          bookingId: booking.id,
          guestName: booking.users.full_name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomNames: booking.booking_rooms.map((br: any) => br.rooms.name),
          total: booking.total_amount,
          paymentStatus: "paid",
        });
      } catch (emailError) {
        console.error("[Tilopay Return] Error enviando email:", emailError);
        // Continuar aunque el email falle
      }
    }

    console.log("[Tilopay Return] Redirigiendo a:", confirmationUrl);
    return NextResponse.redirect(confirmationUrl);

  } catch (err) {
    console.error("[Tilopay Return] Error:", err);
    return NextResponse.redirect(errorUrl);
  }
}
