import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const code = searchParams.get("code");
  const orderId = searchParams.get("order");
  const transactionId = searchParams.get("tilopay-transaction");

  console.log("[Tilopay Return] params:", { code, orderId, transactionId });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (code === "1" && orderId) {
    const supabase = createAdminClient();

    try {
      console.log("[Tilopay Return] Buscando booking:", orderId);

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
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (booking) {
        console.log("[Tilopay Return] Enviando email de confirmación a:", booking.users.email);
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
      }

      console.log("[Tilopay Return] Redirigiendo a confirmación:", `${baseUrl}/booking/booking-confirmation?bookingId=${orderId}`);
      return redirect(`${baseUrl}/booking/booking-confirmation?bookingId=${orderId}`);

    } catch (err) {
      console.error("[Tilopay Return] Error:", err);
      return redirect(`${baseUrl}/dashboard?error=payment_processed_but_update_failed&orderId=${orderId}`);
    }
  } else {
    console.log("[Tilopay Return] Pago fallido o cancelado, redirigiendo...");
    return redirect(`${baseUrl}/booking?error=payment_failed`);
  }
}
