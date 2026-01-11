import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendAdminInvitationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, invitedBy } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email requerido" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if invitation already exists and is not used
    const { data: existingInvitation } = await supabase
      .from("admin_invitations")
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { message: "Ya existe una invitación activa para este email" },
        { status: 400 }
      )
    }

    // Generate token and expiry (24 hours)
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create invitation
    const { data: invitation, error: insertError } = await supabase
      .from("admin_invitations")
      .insert({
        email,
        token,
        invited_by: invitedBy || "System",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating invitation:", insertError)
      return NextResponse.json(
        { message: "Error al crear invitación" },
        { status: 500 }
      )
    }

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://maikekaihouse.com"}/auth/admin-invite?token=${token}`

    const emailResult = await sendAdminInvitationEmail({
      to: email,
      invitationUrl,
      invitedBy: invitedBy || "Sistema Mai Ke Kai",
    })

    if (!emailResult.success) {
      console.error("Error sending invitation email:", emailResult.error)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: "Invitación enviada exitosamente",
      invitationId: invitation.id,
    })
  } catch (error) {
    console.error("Error sending admin invitation:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}