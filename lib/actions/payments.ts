"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function recordManualPayment(
  bookingId: string,
  amount: number,
  paymentMethod: string,
  notes?: string
) {
  const supabase = createAdminClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("total_amount, paid_amount")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw new Error("Booking not found");
  }

  const newPaidAmount = (booking.paid_amount || 0) + amount;
  const newPaymentStatus =
    newPaidAmount >= booking.total_amount ? "paid" : "partial";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      paid_amount: newPaidAmount,
      payment_status: newPaymentStatus,
      payment_method: paymentMethod,
      payment_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) {
    throw new Error("Failed to record payment");
  }

  return { success: true, newPaidAmount, newPaymentStatus };
}
