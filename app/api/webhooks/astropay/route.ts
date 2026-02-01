import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";
import type { AstroPayCallbackPayload } from "@/lib/astropay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AstroPayCallbackPayload;

    console.log("[AstroPay Webhook] Received:", body);

    const {
      merchant_deposit_id,
      deposit_external_id,
      status: depositStatus,
    } = body;

    if (!merchant_deposit_id || !deposit_external_id) {
      console.error("[AstroPay Webhook] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: existingWebhook } = await supabase
      .from("payment_webhooks")
      .select("id")
      .eq("transaction_id", deposit_external_id)
      .eq("status", "processed")
      .single();

    if (existingWebhook) {
      console.log("[AstroPay Webhook] Already processed:", deposit_external_id);
      return NextResponse.json({ received: true, duplicate: true });
    }

    const bookingId = merchant_deposit_id
      .replace(/^booking_/, "")
      .split("_")[0];

    const { data: booking } = await supabase
      .from("bookings")
      .select(
        `
        *,
        users (full_name, email),
        booking_rooms (rooms (name))
      `,
      )
      .eq("id", bookingId)
      .single();

    if (!booking) {
      console.error("[AstroPay Webhook] Booking not found:", bookingId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updateData: any = {
      astropay_deposit_id: deposit_external_id,
      astropay_merchant_deposit_id: merchant_deposit_id,
      updated_at: new Date().toISOString(),
    };

    let shouldSendEmail = false;

    if (depositStatus === "APPROVED" || depositStatus === "COMPLETED") {
      updateData.status = "confirmed";
      updateData.payment_status = "paid";
      updateData.paid_amount = booking.total_amount;
      shouldSendEmail = true;
      console.log(
        "[AstroPay Webhook] Payment approved for booking:",
        bookingId,
      );
    } else if (depositStatus === "CANCELLED") {
      console.log(
        "[AstroPay Webhook] Payment cancelled for booking:",
        bookingId,
      );
      if (booking.payment_status === "pending") {
        updateData.status = "cancelled";
        updateData.payment_status = "failed";
      }
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId);

    if (updateError) {
      console.error("[AstroPay Webhook] Error updating booking:", updateError);
    }

    await supabase.from("payment_webhooks").insert({
      gateway: "astropay",
      transaction_id: deposit_external_id,
      status: "processed",
      payload: body,
      booking_id: bookingId,
      created_at: new Date().toISOString(),
    });

    if (shouldSendEmail && booking.users) {
      try {
        await sendBookingConfirmation({
          to: booking.users.email,
          bookingId: booking.id,
          guestName: booking.users.full_name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomNames:
            booking.booking_rooms?.map((br: any) => br.rooms?.name) || [],
          total: booking.total_amount,
          paymentStatus: "paid",
        });
        console.log(
          "[AstroPay Webhook] Confirmation email sent to:",
          booking.users.email,
        );
      } catch (emailError) {
        console.error("[AstroPay Webhook] Error sending email:", emailError);
      }
    }

    return NextResponse.json({ received: true, status: depositStatus });
  } catch (error) {
    console.error("[AstroPay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
