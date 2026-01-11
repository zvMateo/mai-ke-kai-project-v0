#!/usr/bin/env node
/**
 * Script to send admin invitation email
 * Run: node scripts/send-admin-invitation.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local manually
function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
    console.log("Loaded environment from .env.local\n");
  } catch (err) {
    console.warn("Could not load .env.local:", err.message);
  }
}

loadEnvFile();

const ADMIN_EMAIL = "maikekaisurfhouse@gmail.com";
const INVITED_BY = "Sistema Mai Ke Kai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maikekaihouse.com";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const resend = new Resend(resendApiKey);

async function sendAdminInvitation() {
  console.log("Starting admin invitation process...\n");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Invited by: ${INVITED_BY}`);
  console.log(`Site URL: ${siteUrl}\n`);

  // Check if invitation already exists
  const { data: existing } = await supabase
    .from("admin_invitations")
    .select("*")
    .eq("email", ADMIN_EMAIL)
    .eq("used", false)
    .single();

  if (existing) {
    console.log("Active invitation already exists. Deleting to create new one...");
    await supabase.from("admin_invitations").delete().eq("id", existing.id);
  }

  // Generate token and expiry (24 hours)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  console.log("\nCreating invitation in database...");

  // Create invitation record
  const { data: invitation, error: insertError } = await supabase
    .from("admin_invitations")
    .insert({
      email: ADMIN_EMAIL,
      token,
      invited_by: INVITED_BY,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating invitation:", insertError);
    process.exit(1);
  }

  console.log("Invitation created:", invitation.id);

  // Build invitation URL
  const invitationUrl = `${siteUrl}/auth/admin-invite?token=${token}`;
  console.log("\nInvitation URL:", invitationUrl);

  // Send email
  console.log("\nSending email via Resend...");

  const emailHtml = buildAdminInvitationHtml(invitationUrl, INVITED_BY);

  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: "Mai Ke Kai <noreply@maikekaihouse.com>",
    to: ADMIN_EMAIL,
    subject: "Invitacion para configurar cuenta Admin - Mai Ke Kai",
    html: emailHtml,
  });

  if (emailError) {
    console.error("Error sending email:", emailError);
    console.log("\nInvitation created but email failed. You can share the URL manually.");
  } else {
    console.log("Email sent successfully!", emailResult);
  }

  console.log("\n========================================");
  console.log("INVITATION SENT SUCCESSFULLY!");
  console.log("========================================");
  console.log(`\nEmail: ${ADMIN_EMAIL}`);
  console.log(`Expires: ${expiresAt.toLocaleString()}`);
  console.log(`\nURL: ${invitationUrl}`);
  console.log("\nThe recipient can click the link in the email or use the URL above.");
}

function buildAdminInvitationHtml(invitationUrl, invitedBy) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitacion Admin - Mai Ke Kai</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #E76F51 0%, #F4A261 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header img { max-width: 200px; height: auto; }
    .content {
      background: white;
      padding: 40px 30px;
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
    }
    .title {
      color: #0E3244;
      font-size: 28px;
      margin-bottom: 20px;
      text-align: center;
    }
    .greeting {
      color: #5B8A9A;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }
    .text {
      color: #444;
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .button-container { text-align: center; margin: 35px 0; }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #F4A261 0%, #E76F51 100%);
      color: white !important;
      padding: 16px 50px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(231, 111, 81, 0.3);
    }
    .info-box {
      background: linear-gradient(135deg, #7DCFB6 0%, #5B8A9A 100%);
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
    }
    .info-box h3 { color: white; margin-bottom: 15px; font-size: 18px; }
    .info-box ul { list-style: none; }
    .info-box li {
      color: white;
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
      font-size: 15px;
    }
    .info-box li::before {
      content: "\\2713";
      position: absolute;
      left: 0;
      color: white;
      font-weight: bold;
    }
    .footer {
      background: #0E3244;
      padding: 30px;
      text-align: center;
      border-radius: 0 0 8px 8px;
    }
    .footer p { color: #aaa; font-size: 14px; margin-bottom: 10px; }
    .pura-vida {
      color: #F4A261;
      font-size: 24px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/daufytlmp/image/upload/v1767749705/logo-email_ezef4r.png" alt="Mai Ke Kai" />
    </div>

    <div class="content">
      <h1 class="title">Invitacion Administrador Mai Ke Kai</h1>
      <p class="greeting">Hola,</p>

      <p class="text">
        Has sido invitado por <strong>${invitedBy}</strong> para configurar tu cuenta de administrador
        en Mai Ke Kai Surf House. Esta invitacion te permitira acceder al panel completo de administracion.
      </p>

      <div class="button-container">
        <a href="${invitationUrl}" class="button">Configurar Mi Cuenta Admin</a>
      </div>

      <div class="info-box">
        <h3>Que podras hacer como Administrador?</h3>
        <ul>
          <li>Gestionar habitaciones y precios</li>
          <li>Administrar reservas y usuarios</li>
          <li>Ver reportes y estadisticas</li>
          <li>Configurar servicios y paquetes</li>
          <li>Gestionar el calendario de disponibilidad</li>
        </ul>
      </div>

      <p class="text">
        <strong>Esta invitacion expira en 24 horas.</strong> Si no puedes acceder ahora,
        puedes solicitar una nueva invitacion mas tarde.
      </p>
    </div>

    <div class="footer">
      <p>Mai Ke Kai Surf House | Tamarindo, Costa Rica</p>
      <p><a href="https://maikekaihouse.com" style="color: #5B8A9A;">www.maikekaihouse.com</a></p>
      <p class="pura-vida">Pura Vida!</p>
    </div>
  </div>
</body>
</html>`;
}

sendAdminInvitation().catch(console.error);
