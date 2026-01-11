import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCheckInReminder } from "@/lib/email";

// Use admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cron secret to prevent unauthorized access (REQUIRED for external cron services)
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verify cron secret - REQUIRED for security
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");

  // Accept secret via header OR query param (for easier cron service setup)
  const providedSecret = authHeader?.replace("Bearer ", "") || secretParam;

  if (!CRON_SECRET) {
    console.error("[Cron] CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }

  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find bookings with check-in tomorrow that are confirmed
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        check_in,
        check_out,
        users (
          id,
          email,
          full_name
        ),
        check_in_data (
          completed_at
        )
      `
      )
      .eq("check_in", tomorrowStr)
      .eq("status", "confirmed");

    if (error) {
      console.error("[Cron] Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      console.log("[Cron] No check-ins for tomorrow");
      return NextResponse.json({
        success: true,
        message: "No check-ins for tomorrow",
        sent: 0,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maikekai.com";
    let sentCount = 0;
    const errors: string[] = [];

    for (const booking of bookings) {
      // Skip if check-in already completed
      const checkInData = booking.check_in_data?.[0];
      if (checkInData?.completed_at) {
        console.log(
          `[Cron] Skipping booking ${booking.id} - check-in already completed`
        );
        continue;
      }

      const user = booking.users as any;
      if (!user?.email) {
        console.log(`[Cron] Skipping booking ${booking.id} - no user email`);
        continue;
      }

      try {
        const formattedCheckIn = new Date(booking.check_in).toLocaleDateString(
          "es-ES",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        const formattedCheckOut = booking.check_out
          ? new Date(booking.check_out).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";

        await sendCheckInReminder({
          email: user.email,
          name: user.full_name || "Huésped",
          bookingId: booking.id,
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
          checkInUrl: `${baseUrl}/check-in/${booking.id}`,
        });

        sentCount++;
        console.log(
          `[Cron] Sent reminder to ${user.email} for booking ${booking.id}`
        );
      } catch (emailError) {
        console.error(
          `[Cron] Failed to send reminder for booking ${booking.id}:`,
          emailError
        );
        errors.push(`Booking ${booking.id}: ${emailError}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} check-in reminders`,
      sent: sentCount,
      total: bookings.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[Cron] Check-in reminder cron failed:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
