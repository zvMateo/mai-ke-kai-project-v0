import { createAdminClient, createAdminDbClient } from "@/lib/supabase/admin";
import { sendNewUserWelcome } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, fullName, role } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
    }

    if (!["volunteer", "admin", "staff"].includes(role)) {
      return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    try {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users.find((u) => u.email === email);
      if (existingUser) {
        return NextResponse.json({ message: "El email ya está registrado" }, { status: 400 });
      }
    } catch (error) {
      console.error("Error checking existing users:", error);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      if (authError.message?.includes("already registered")) {
        return NextResponse.json({ message: "El email ya está registrado" }, { status: 400 });
      }
      return NextResponse.json({ message: "Error: " + authError.message }, { status: 500 });
    }

    const supabaseAdminDb = createAdminDbClient();
    const { error: profileError } = await supabaseAdminDb.from("users").upsert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ message: "Error al crear perfil" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}`;

    await sendNewUserWelcome({
      to: email,
      name: fullName,
      resetUrl,
      role,
    });

    return NextResponse.json({ message: "Usuario creado exitosamente", userId: authData.user.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, fullName, email, role, phone, nationality } = await request.json();

    if (!id || !fullName || !email || !role) {
      return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
    }

    const supabaseAdminDb = createAdminDbClient();

    const { error } = await supabaseAdminDb.from("users").update({
      full_name: fullName,
      email,
      role,
      phone: phone || null,
      nationality: nationality || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) {
      return NextResponse.json({ message: "Error al actualizar: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const supabaseAdminDb = createAdminDbClient();

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return NextResponse.json({ message: "Error al eliminar usuario" }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdminDb.from("users").delete().eq("id", id);

    if (dbError) {
      console.error("Error deleting user profile:", dbError);
      return NextResponse.json({ message: "Error al eliminar perfil" }, { status: 500 });
    }

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabaseAdminDb = createAdminDbClient();
    const { data, error } = await supabaseAdminDb.from("users").select("*").order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
