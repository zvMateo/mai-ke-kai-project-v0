import "server-only"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || "Mai Ke Kai <noreply@maikekaihouse.com>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maikekaihouse.com"

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(data: EmailData): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "API key not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    console.log(`[Email] Sent: ${data.subject} to ${data.to}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send" };
  }
}

export async function sendWelcomeEmail(params: { to: string; name: string; confirmationUrl: string }) {
  const html = buildWelcomeEmailHtml(params.name, params.confirmationUrl);
  const subject = "Welcome to Mai Ke Kai - Confirm Your Email"

  return sendEmail({
    to: params.to,
    subject,
    html,
  });
}

export async function sendNewUserWelcome(params: { to: string; name: string; resetUrl: string; role: string }) {
  const html = buildNewUserWelcomeHtml(params.name, params.resetUrl, params.role);
  const subject = `Welcome to Mai Ke Kai - ${params.role.charAt(0).toUpperCase() + params.role.slice(1)} Account Created`

  return sendEmail({
    to: params.to,
    subject,
    html,
  });
}

export async function sendStaffBookingAlert(params: {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  total: number;
  source: string;
}) {
  const html = buildStaffBookingAlertHtml(params);
  const subject = `🔔 New Booking #${params.bookingId} - ${params.guestName}`
  const staffEmail = process.env.STAFF_EMAIL || "staff@maikekaihouse.com"

  return sendEmail({
    to: staffEmail,
    subject,
    html,
  });
}

export async function sendBookingConfirmation(params: {
  to: string;
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  serviceNames?: string[];
  total: number;
  paymentStatus: string;
  specialRequests?: string;
}) {
  const html = buildBookingConfirmationHtml(params);
  const subject = `Booking Confirmation #${params.bookingId} - Mai Ke Kai`

  return sendEmail({
    to: params.to,
    subject,
    html,
  });
}

export async function sendCheckInReminder(params: {
  email: string;
  name: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  checkInUrl: string;
}) {
  const html = buildCheckInReminderHtml(params.name, params.bookingId, params.checkIn, params.checkOut, params.checkInUrl);
  const subject = `Check-in Reminder - Booking #${params.bookingId} - Mai Ke Kai`

  return sendEmail({
    to: params.email,
    subject,
    html,
  });
}

function buildWelcomeEmailHtml(name: string, confirmationUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mai Ke Kai</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #5B8A9A 0%, #7DCFB6 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header img { max-width: 200px; height: auto; }
    .banner {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }
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
      transition: transform 0.2s;
    }
    .button:hover { transform: translateY(-2px); }
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
      content: "✓";
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
    .social-links { margin: 15px 0; }
    .social-links a {
      color: #7DCFB6;
      margin: 0 10px;
      text-decoration: none;
      font-size: 14px;
    }
    .pura-vida {
      color: #F4A261;
      font-size: 24px;
      margin-top: 15px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #7DCFB6, transparent);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/daufytlmp/image/upload/v1767749705/logo-email_ezef4r.png" alt="Mai Ke Kai" />
    </div>

    <img
      class="banner"
      src="https://res.cloudinary.com/daufytlmp/image/upload/v1767749845/email-banner-tamarindo_cupqjb.jpg"
      alt="Tamarindo, Costa Rica"
    />

    <div class="content">
      <h1 class="title">Welcome to Mai Ke Kai! 🌊</h1>
      <p class="greeting">Hi ${name},</p>

      <p class="text">
        Your surf adventure in Tamarindo is about to begin. We're so excited to have you join our family.
        To start enjoying all our experiences, please confirm your email address first.
      </p>

      <div class="button-container">
        <a href="${confirmationUrl}" class="button">Confirm My Account</a>
      </div>

      <div class="info-box">
        <h3>What's next after confirming?</h3>
        <ul>
          <li>Sign in to your account</li>
          <li>Explore our rooms and surf packages</li>
          <li>Book your first surf experience</li>
          <li>Earn points and redeem exclusive rewards</li>
        </ul>
      </div>

      <div class="divider"></div>

      <p class="text">
        If you did not create an account at Mai Ke Kai, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      <p>Follow us on social media</p>
      <div class="social-links">
        <a href="https://instagram.com/maikekai">Instagram</a> |
        <a href="https://facebook.com/maikekai">Facebook</a> |
        <a href="https://wa.me/50612345678">WhatsApp</a>
      </div>
      <p>Mai Ke Kai Surf House | Tamarindo, Costa Rica</p>
      <p><a href="https://maikekaihouse.com" style="color: #5B8A9A;">www.maikekaihouse.com</a></p>
      <p class="pura-vida">Pura Vida! 🏄</p>
    </div>
  </div>
  </div>
</body>
</html>`;
}

function buildBookingConfirmationHtml(params: any): string {
  const { bookingId, guestName, checkIn, checkOut, roomNames, serviceNames, total, paymentStatus, specialRequests } = params

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation #${bookingId} - Mai Ke Kai</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #EEF4FF; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #E5E7EB; }
    .button { display: inline-block; background: #5B8A9A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
    .details { background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .services { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .special-requests { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
    .info { background: #7DCFB6; border-radius: 8px; padding: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Pura Vida ${guestName}!</h1>
      <p style="margin: 10px 0 0;">Your reservation is confirmed.</p>
    </div>
    <div class="content">
      <div class="details">
        <p style="margin: 0 0 10px 0;"><strong>Booking Number:</strong> #${bookingId}</p>
        <p style="margin: 0 0 10px 0;"><strong>Payment Status:</strong> ${paymentStatus === "paid" ? "✓ Paid" : paymentStatus === "partial" ? "Partial Payment" : "Pending"}</p>
      </div>

      <p>Thank you for choosing Mai Ke Kai Surf House. We're excited to receive you in our surf paradise in Puerto Viejo, Tamarindo, Costa Rica.</p>

      <div style="background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0;">Details of your Stay</h3>
        <table>
          <tr><td style="color: #6B7280;">Check-in:</td><td style="text-align: right; font-weight: bold;">${checkIn}</td></tr>
          <tr><td style="color: #6B7280;">Check-out:</td><td style="text-align: right; font-weight: bold;">${checkOut}</td></tr>
          <tr><td style="color: #6B7280;">Accommodations:</td><td style="text-align: right; font-weight: bold;">${roomNames.join(", ")}</td></tr>
          ${
            serviceNames && serviceNames.length > 0
              ? `<tr><td style="color: #6B7280;">Included Services:</td><td style="text-align: right; font-weight: bold;">${serviceNames.join(", ")}</td></tr>`
              : ""
          }
        </table>
      </div>

      ${
        serviceNames && serviceNames.length > 0
          ? `<div class="services">
              <h4 style="margin-top: 0; color: #5B8A9A;">🏄 Included Services</h4>
              <ul style="margin: 0 0; padding-left: 20px;">
                ${serviceNames.map((service: string) => `<li>${service}</li>`).join("")}
              </ul>
            </div>`
          : ""
      }

      ${
        specialRequests
          ? `<div class="special-requests">
              <h4 style="margin-top: 0; color: #F59E0B;">📝 Special Requests</h4>
              <p style="margin: 0;">${specialRequests}</p>
            </div>`
          : ""
      }

      <div style="background: #7DCFB6; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h3 style="margin-top: 0;">Important Information</h3>
        <ul style="line-height: 1.6;">
          <li>Check-in: 2:00 PM - 8:00 PM</li>
          <li>Check-out: 11:00 AM</li>
          <li>WiFi gratuito disponible</li>
          <li>Breakfast included</li>
          <li>Surf lessons and tours available</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${SITE_URL}/check-in/${bookingId}" class="button">Complete Check-in Online</a>
      </div>

      <p>If you have any questions, contact us:</p>
      <p>📧 reservations@maikekaihouse.com<br>📱 +50612345678</p>
    </div>

    <div class="footer">
      <p>Mai Ke Kai Surf House | Puerto Viejo, Tamarindo, Costa Rica</p>
      <p><a href="https://maikekaihouse.com" style="color: #5B8A9A;">www.maikekaihouse.com</a></p>
      <p style="margin-top: 10px;">Pura Vida! 🏄</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

function buildCheckInReminderHtml(name: string, bookingId: string, checkIn: string, checkOut: string, checkInUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Reminder - Mai Ke Kai</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height:1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #EEF4FF; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #E5E7EB; }
    .button { display: inline-block; background: #5B8A9A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
    .info { background: #7DCFB6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Hi ${name},</h1>
      <p style="margin: 10px 0 0;">Your check-in is tomorrow!</p>
    </div>
    <div class="content">
      <div class="info">
        <p style="margin: 0 0 10px 0;"><strong>Booking:</strong> #${bookingId}</p>
        <p style="margin: 0 0 10px 0;"><strong>Check-in:</strong> ${checkIn}</p>
        <p style="margin: 0 0 10px 0;"><strong>Check-out:</strong> ${checkOut}</p>
      </div>

      <div style="background: #7DCFB6; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin-top: 0;">Check-in Information</h3>
        <ul style="line-height: 1.6;">
          <li>Check-in: 2:00 PM - 8:00 PM</li>
          <li>Check-out: 11:00 AM</li>
          <li>WiFi disponible</li>
          <li>Breakfast included</li>
          <li>Surf lessons and tours available</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${checkInUrl}" class="button">Complete Check-in Online</a>
      </div>

      <p>Remember to bring your ID and complete check-in process online to save time upon arrival.</p>
    </div>

    <div class="footer">
      <p>Mai Ke Kai Surf House | Puerto Viejo, Tamarindo, Costa Rica</p>
      <p><a href="https://maikekaihouse.com" style="color: #5B8A9A;">www.maikekaihouse.com</a></p>
      <p style="margin-top: 10px;">Pura Vida! 🏄</p>
    </div>
  </div>
  </div>
</body>
</html>`;
}

function buildNewUserWelcomeHtml(name: string, resetUrl: string, role: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mai Ke Kai</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #5B8A9A 0%, #7DCFB6 100%);
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
      transition: transform 0.2s;
    }
    .button:hover { transform: translateY(-2px); }
    .role-badge {
      background: #7DCFB6;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      margin: 15px 0;
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
      <h1 class="title">Welcome to Mai Ke Kai! 🌊</h1>
      <p class="greeting">Hi ${name},</p>

      <div class="role-badge">Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</div>

      <p class="text">
        Your ${role} account has been created at Mai Ke Kai. Welcome to our team!
        To get started, please set your password by clicking the button below.
      </p>

      <div class="button-container">
        <a href="${resetUrl}" class="button">Set My Password</a>
      </div>

      <p class="text">
        Once you've set your password, you'll be able to sign in and access your dashboard.
        If you have any questions, feel free to reach out to our team.
      </p>
    </div>

    <div class="footer">
      <p>Mai Ke Kai Surf House | Tamarindo, Costa Rica</p>
      <p><a href="https://maikekaihouse.com" style="color: #5B8A9A;">www.maikekaihouse.com</a></p>
      <p class="pura-vida">Pura Vida! 🏄</p>
    </div>
  </div>
</body>
</html>`;
}

function buildStaffBookingAlertHtml(params: {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  total: number;
  source: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking #${params.bookingId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #E76F51 0%, #F4A261 100%);
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 { color: white; font-size: 24px; margin: 0; }
    .content {
      background: white;
      padding: 30px;
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
    }
    .alert-box {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .details {
      background: #F3F4F6;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .details p {
      margin: 8px 0;
      color: #444;
    }
    .details strong {
      color: #0E3244;
    }
    .total {
      background: #7DCFB6;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-top: 20px;
    }
    .footer {
      background: #0E3244;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
    }
    .footer p { color: #aaa; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Booking Alert</h1>
    </div>

    <div class="content">
      <div class="alert-box">
        <strong>Guest:</strong> ${params.guestName}<br>
        <strong>Email:</strong> ${params.guestEmail}<br>
        <strong>Source:</strong> ${params.source}
      </div>

      <div class="details">
        <p><strong>Booking ID:</strong> #${params.bookingId}</p>
        <p><strong>Check-in:</strong> ${params.checkIn}</p>
        <p><strong>Check-out:</strong> ${params.checkOut}</p>
        <p><strong>Rooms:</strong> ${params.roomNames.join(", ")}</p>
      </div>

      <div class="total">
        Total: $${params.total.toFixed(2)}
      </div>
    </div>

    <div class="footer">
      <p>Mai Ke Kai Booking System</p>
      <p>${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}
