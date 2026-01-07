import { NextResponse } from "next/server"
import { resendConfirmationEmail } from "@/lib/actions/users"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Correo electrónico requerido" },
        { status: 400 }
      )
    }

    const result = await resendConfirmationEmail(email)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error resending confirmation:", error)
    return NextResponse.json(
      { error: "Error al reenviar email" },
      { status: 500 }
    )
  }
}
