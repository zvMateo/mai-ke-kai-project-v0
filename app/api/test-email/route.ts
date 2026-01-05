import { NextResponse } from "next/server"
import { sendBookingConfirmation, sendStaffBookingAlert } from "@/lib/email"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email") || "test@example.com"

  try {
    // Test guest confirmation email
    const guestResult = await sendBookingConfirmation({
      to: email,
      bookingId: "TEST-12345",
      guestName: "John Doe",
      checkIn: "Dec 20, 2025",
      checkOut: "Dec 23, 2025",
      roomNames: ["Dorm Bed", "Private Room"],
      total: 150.0,
      paymentStatus: "paid",
    })

    await delay(1000)

    // Test staff alert email
    const staffResult = await sendStaffBookingAlert({
      bookingId: "TEST-12345",
      guestName: "John Doe",
      guestEmail: email,
      checkIn: "Dec 20, 2025",
      checkOut: "Dec 23, 2025",
      roomNames: ["Dorm Bed", "Private Room"],
      total: 150.0,
      source: "Test Booking",
    })

    return NextResponse.json({
      success: true,
      guestEmail: guestResult,
      staffEmail: staffResult,
      message: "Test emails sent successfully",
      sentTo: {
        guest: email,
        staff: process.env.STAFF_EMAIL || "staff@maikekai.com",
      },
    })
  } catch (error) {
    console.error("Error sending test emails:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        envVars: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing",
          EMAIL_FROM: process.env.EMAIL_FROM || "Using default: onboarding@resend.dev",
          STAFF_EMAIL: process.env.STAFF_EMAIL || "Using default: staff@maikekai.com",
          NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "✗ Missing",
        },
      },
      { status: 500 },
    )
  }
}
