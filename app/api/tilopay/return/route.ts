import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const code = searchParams.get("code");
  const orderId = searchParams.get("order");
  const transactionId = searchParams.get("tilopay-transaction");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (code === "1" && orderId) {
    const supabase = createAdminClient();

    try {
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

      if (error) throw error;

      if (booking) {
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

      return redirect(`${baseUrl}/booking/booking-confirmation?bookingId=${orderId}`);

    } catch (err) {
      console.error("Error actualizando reserva Tilopay:", err);
      return redirect(`${baseUrl}/dashboard?error=payment_processed_but_update_failed`);
    }
  } else {
    return redirect(`${baseUrl}/booking?error=payment_failed`);
  }
}
