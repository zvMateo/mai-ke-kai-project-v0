import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, confirmationUrl } = body

    if (!email || !name || !confirmationUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sendWelcomeEmail({
      to: email,
      name,
      confirmationUrl,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("[Welcome Email] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
