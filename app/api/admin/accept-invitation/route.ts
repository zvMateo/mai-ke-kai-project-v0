import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Starting admin invitation acceptance ===")
    const body = await request.json()
    console.log("Received request body:", { token: body.token, password: "***", fullName: body.fullName })

    const { token, password, fullName } = body

    if (!token || !password || !fullName) {
      console.log("Missing required fields")
      return NextResponse.json(
        { message: "Token, contraseña y nombre completo requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    console.log("Supabase client created")

    // Verify invitation token
    console.log("Verifying invitation token...")
    const { data: invitation, error: invitationError } = await supabase
      .from("admin_invitations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single()

    console.log("Invitation query result:", { invitation, error: invitationError })

    if (invitationError || !invitation) {
      console.log("Invalid invitation")
      return NextResponse.json(
        { message: "Invitación inválida o expirada" },
        { status: 400 }
      )
    }

    // Check if invitation is expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    console.log("Checking expiration:", { now, expiresAt, expired: now > expiresAt })
    if (now > expiresAt) {
      console.log("Invitation expired")
      return NextResponse.json(
        { message: "La invitación ha expirado" },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log("Checking for existing auth user...")
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find((u) => u.email === invitation.email)
    console.log("Existing user check:", { existing: !!existingUser })
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { message: "Ya existe un usuario con este email" },
        { status: 400 }
      )
    }

    // Create the admin user
    console.log("Creating auth user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    console.log("Auth user creation result:", {
      success: !authError,
      error: authError,
      userId: authData?.user?.id
    })

    if (authError) {
      console.error("Error creating admin user:", authError)
      return NextResponse.json(
        { message: "Error al crear usuario: " + authError.message },
        { status: 500 }
      )
    }

    // Create user profile - handle case where user might already exist
    console.log("Creating/updating user profile...")
    const profileData = {
      id: authData.user.id,
      email: invitation.email,
      full_name: fullName,
      role: "admin",
    }
    console.log("Profile data:", profileData)

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle()

    let profileError
    if (existingProfile) {
      console.log("Profile exists, updating...")
      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: invitation.email,
          full_name: fullName,
          role: "admin",
        })
        .eq("id", authData.user.id)
      profileError = updateError
    } else {
      console.log("Profile does not exist, inserting...")
      const { error: insertError } = await supabase
        .from("users")
        .insert(profileData)
      profileError = insertError
    }

    console.log("Profile operation result:", { success: !profileError, error: profileError })

    if (profileError) {
      console.error("Error with user profile:", profileError)
      console.error("Profile error details:", JSON.stringify(profileError, null, 2))
      // Clean up the auth user if profile operation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { message: "Error al crear perfil de usuario" },
        { status: 500 }
      )
    }

    // Mark invitation as used
    console.log("Marking invitation as used...")
    const { error: updateError } = await supabase
      .from("admin_invitations")
      .update({ used: true, updated_at: new Date().toISOString() })
      .eq("id", invitation.id)

    console.log("Invitation update result:", { success: !updateError, error: updateError })
    console.log("=== Admin invitation acceptance completed successfully ===")

    return NextResponse.json({
      message: "Usuario administrador creado exitosamente",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("=== ERROR accepting admin invitation ===")
    console.error("Error details:", error)
    console.error("Error message:", (error as any)?.message)
    console.error("Error stack:", (error as any)?.stack)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}