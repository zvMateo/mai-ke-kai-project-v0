import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { token, password, fullName } = await request.json()

    if (!token || !password || !fullName) {
      return NextResponse.json(
        { message: "Token, contraseña y nombre completo requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from("admin_invitations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { message: "Invitación inválida o expirada" },
        { status: 400 }
      )
    }

    // Check if invitation is expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (now > expiresAt) {
      return NextResponse.json(
        { message: "La invitación ha expirado" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find((u) => u.email === invitation.email)
    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe un usuario con este email" },
        { status: 400 }
      )
    }

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError) {
      console.error("Error creating admin user:", authError)
      return NextResponse.json(
        { message: "Error al crear usuario: " + authError.message },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: invitation.email,
      full_name: fullName,
      role: "admin",
    })

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { message: "Error al crear perfil de usuario" },
        { status: 500 }
      )
    }

    // Mark invitation as used
    await supabase
      .from("admin_invitations")
      .update({ used: true, updated_at: new Date().toISOString() })
      .eq("id", invitation.id)

    return NextResponse.json({
      message: "Usuario administrador creado exitosamente",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Error accepting admin invitation:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}