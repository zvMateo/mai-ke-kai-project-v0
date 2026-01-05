import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createAdminClient, createAdminDbClient } from "@/lib/supabase/admin";
import { sendNewUserWelcome } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, fullName, role } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (!["volunteer", "admin"].includes(role)) {
      return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
    }

    // Create admin client
    const supabaseAdmin = createAdminClient();

    // Check if user already exists in auth by trying to get them
    try {
      const { data: existingUsers } =
        await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users.find((u) => u.email === email);
      if (existingUser) {
        return NextResponse.json(
          { message: "El email ya está registrado en el sistema" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking existing users:", error);
      // Continue anyway
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (authError) {
      console.error("Error creating auth user:", authError);

      // Check if it's a duplicate email error
      if (authError.message?.includes("already registered")) {
        return NextResponse.json(
          { message: "El email ya está registrado en el sistema" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Error al crear usuario en auth: " + authError.message },
        { status: 500 }
      );
    }

    // Create user profile in database using admin client to bypass RLS
    const supabaseAdminDb = createAdminDbClient();
    const { data: profileData, error: profileError } = await supabaseAdminDb
      .from("users")
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        // Removed auth0_sub since we're using Supabase Auth directly
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Try to rollback auth user creation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { message: "Error al crear perfil de usuario" },
        { status: 500 }
      );
    }

    // Send welcome email with password reset link using Resend
    console.log("Sending welcome email to:", email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(
      email
    )}`;

    // For testing: send to account owner's email instead of the new user's email
    // TODO: Remove this when domain is verified in Resend
    const testEmail =
      process.env.RESEND_TEST_EMAIL || "mzavala@goodapps.com.ar";

    const emailResult = await sendNewUserWelcome({
      to: testEmail, // Temporarily send to owner's email for testing
      name: fullName,
      resetUrl: resetUrl,
      role: role,
    });

    if (!emailResult.success) {
      console.error("Error sending welcome email:", emailResult.error);
      console.warn("User created but welcome email failed");
    } else {
      console.log("Welcome email sent successfully to:", email);
    }

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: authData.user.id,
          email,
          fullName,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseAdminDb = createAdminDbClient();
    const { data, error } = await supabaseAdminDb
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { message: "Error al obtener usuarios" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
