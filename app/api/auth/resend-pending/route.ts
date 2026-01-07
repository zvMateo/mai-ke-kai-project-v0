import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const now = new Date();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Check existing pending signup and resend limit
    const { data: existing } = await supabase
      .from("pending_signups")
      .select("*")
      .eq("email", email)
      .gte("last_resend_at", thirtyMinAgo.toISOString())
      .maybeSingle();

    if (existing && (existing.resend_count || 0) >= 2) {
      return NextResponse.json(
        { error: "Resend limit reached. Please wait 30 minutes." },
        { status: 429 }
      );
    }

    // Delete old tokens for this email
    await supabase.from("pending_signups").delete().eq("email", email);

    // Create new pending signup with updated resend count
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const newCount = existing ? (existing.resend_count || 0) + 1 : 1;

    await supabase.from("pending_signups").insert({
      full_name: existing?.full_name || email.split("@")[0],
      email,
      token,
      expires_at: expiresAt.toISOString(),
      resend_count: newCount,
      last_resend_at: now.toISOString(),
    });

    const confirmationUrl = `${siteUrl}/auth/sign-up?token=${token}`;
    await sendWelcomeEmail({
      to: email,
      name: existing?.full_name || email.split("@")[0],
      confirmationUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resending confirmation:", error);
    return NextResponse.json(
      { error: "Error resending confirmation" },
      { status: 500 }
    );
  }
}
