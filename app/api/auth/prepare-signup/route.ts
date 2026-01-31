import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { full_name, email } = await req.json();
    if (!full_name || !email) {
      return NextResponse.json(
        { error: "full_name and email are required" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const supabase = await createClient();

    // Check existing user in public.users
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    // Check existing pending signup
    const { data: existingPending } = await supabase
      .from("pending_signups")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser || existingPending) {
      return NextResponse.json(
        { error: "User already exists or pending signup" },
        { status: 400 }
      );
    }

    // Persist pending signup
    await supabase.from("pending_signups").insert({
      full_name,
      email,
      token,
      expires_at: expiresAt.toISOString(),
    });

    const confirmationUrl = `${siteUrl}/auth/sign-up?token=${token}`;

    // Enviar email de confirmación (plantilla en inglés)
    await sendWelcomeEmail({ to: email, name: full_name, confirmationUrl });

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("prepare-signup error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
