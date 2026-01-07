import { NextResponse } from "next/server"
import { generateConfirmationToken } from "@/lib/actions/users"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { userId, email, name } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single()

    if (userError && !userData) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const userName = name || userData?.full_name || email.split("@")[0]

    const token = await generateConfirmationToken(userId, email)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const confirmationUrl = `${siteUrl}/auth/confirm?token=${token}`

    const { sendWelcomeEmail } = await import("@/lib/email")
    await sendWelcomeEmail({
      to: email,
      name: userName,
      confirmationUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    return NextResponse.json(
      { error: "Error al enviar email de confirmación" },
      { status: 500 }
    )
  }
}
