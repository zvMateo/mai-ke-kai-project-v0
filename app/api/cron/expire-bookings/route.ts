import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Cron endpoint to expire pending_payment bookings older than 24 hours.
 * Configure in vercel.json:
 * { "crons": [{ "path": "/api/cron/expire-bookings", "schedule": "0 * * * *" }] }
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Find and expire pending bookings older than 24 hours
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: expiredBookings, error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "pending_payment")
      .lt("created_at", cutoffDate)
      .select("id, booking_reference")

    if (error) {
      return NextResponse.json(
        { error: "Failed to expire bookings" },
        { status: 500 }
      )
    }

    const expiredCount = expiredBookings?.length || 0

    return NextResponse.json({
      success: true,
      expiredCount,
      expiredBookings: expiredBookings?.map((b) => b.booking_reference) || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
