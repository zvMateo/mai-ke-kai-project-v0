import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Mai Ke Kai <noreply@maikekaihouse.com>";

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendEmail(data: EmailData) {
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
    return { success: false, error };
  }
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
  const checkInUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://maikekai.com"
  }/check-in/${params.bookingId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #5B8A9A 0%, #7DCFB6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #5B8A9A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .details { background: #EEF4FF; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .services { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .special-requests { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Pura Vida ${params.guestName}!</h1>
      <p style="margin:10px 0 0 0;">Tu reserva está confirmada</p>
    </div>
    <div class="content">
      <div class="details">
        <p style="margin: 0 0 10px 0;"><strong>Número de Reserva:</strong> #${
          params.bookingId
        }</p>
        <p style="margin: 0 0 10px 0;"><strong>Estado de Pago:</strong> ${
          params.paymentStatus === "paid"
            ? "✓ Pagado"
            : params.paymentStatus === "partial"
            ? "Pago Parcial"
            : "Pendiente"
        }</p>
      </div>

      <p>Gracias por elegir Mai Ke Kai Surf House. Estamos emocionados de recibirte en nuestro paraíso surfero en Costa Rica.</p>

      <div style="background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0;">Detalles de tu Estadía</h3>
        <table>
          <tr>
            <td style="color: #6B7280;">Check-in:</td>
            <td style="text-align: right; font-weight: bold;">${
              params.checkIn
            }</td>
          </tr>
          <tr>
            <td style="color: #6B7280;">Check-out:</td>
            <td style="text-align: right; font-weight: bold;">${
              params.checkOut
            }</td>
          </tr>
          <tr>
            <td style="color: #6B7280;">Habitaciones:</td>
            <td style="text-align: right; font-weight: bold;">${params.roomNames.join(
              ", "
            )}</td>
          </tr>
          ${
            params.serviceNames && params.serviceNames.length > 0
              ? `<tr>
            <td style="color: #6B7280;">Servicios Adicionales:</td>
            <td style="text-align: right; font-weight: bold;">${params.serviceNames.join(
              ", "
            )}</td>
          </tr>`
              : ""
          }
          <tr style="border-top: 2px solid #E5E7EB;">
            <td style="padding: 12px 0; font-size: 18px; font-weight: bold;">Total:</td>
            <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: bold; color: #5B8A9A;">$${params.total.toFixed(
              2
            )}</td>
          </tr>
        </table>
      </div>

      ${
        params.serviceNames && params.serviceNames.length > 0
          ? `<div class="services">
        <h4 style="margin-top: 0; color: #5B8A9A;">🏄 Servicios Incluidos</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${params.serviceNames
            .map((service) => `<li>${service}</li>`)
            .join("")}
        </ul>
      </div>`
          : ""
      }

      ${
        params.specialRequests
          ? `<div class="special-requests">
        <h4 style="margin-top: 0; color: #F59E0B;">📝 Solicitudes Especiales</h4>
        <p style="margin: 0;">${params.specialRequests}</p>
      </div>`
          : ""
      }

      <div style="background: #7DCFB6; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h3 style="margin-top: 0;">Información Importante</h3>
        <ul style="line-height: 1.6;">
          <li>Check-in: 2:00 PM - 8:00 PM</li>
          <li>Check-out: 11:00 AM</li>
          <li>WiFi gratuito disponible</li>
          <li>Desayuno incluido</li>
          <li>Clases de surf y tours disponibles</li>
        </ul>
      </div>

      <div style="text-align:center; margin-top: 20px;">
        <a href="${checkInUrl}" class="button">Completar Check-in Online</a>
      </div>

      <p>Si tienes alguna pregunta, contáctanos:</p>
      <p>📧 reservas@maikekai.com<br>📱 +506 1234-5678</p>
    </div>
    <div class="footer">
      <p>Mai Ke Kai Surf House | Puerto Viejo, Costa Rica<br>
      <a href="https://maikekai.com">www.maikekai.com</a></p>
      <p style="margin-top: 10px;">Pura Vida! 🌊🏄</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Confirmación de Reserva #${params.bookingId} - Mai Ke Kai`,
    html,
  });
}

export async function sendCheckInReminder(params: {
  email: string;
  name: string;
  checkIn: string;
  checkInUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5B8A9A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #E07A5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Tu llegada se acerca!</h1>
    </div>
    <div class="content">
      <p>Hola ${params.name},</p>
      <p>Tu check-in es mañana <strong>${params.checkIn}</strong>. Para que tu llegada sea más rápida, completa tu check-in online ahora:</p>
      
      <div style="text-align:center;">
        <a href="${params.checkInUrl}" class="button">Completar Check-in Online</a>
      </div>

      <p>Nos vemos pronto!<br>El equipo de Mai Ke Kai</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.email,
    subject: "Recordatorio: Completa tu Check-in Online - Mai Ke Kai",
    html,
  });
}

export async function sendStaffCheckInAlert(params: {
  guestName: string;
  checkIn: string;
  roomType: string;
  bookingId: string;
}) {
  const html = `
<h2>Nuevo Check-in Completado</h2>
<p><strong>Huésped:</strong> ${params.guestName}</p>
<p><strong>Reserva:</strong> ${params.bookingId}</p>
<p><strong>Check-in:</strong> ${params.checkIn}</p>
<p><strong>Habitación:</strong> ${params.roomType}</p>
<p>El huésped ha completado el check-in online. Revisar detalles en el admin dashboard.</p>
  `;

  return sendEmail({
    to: "staff@maikekai.com",
    subject: `Check-in Completado: ${params.guestName} - ${params.bookingId}`,
    html,
  });
}

export async function sendCancellationEmail(params: {
  email: string;
  name: string;
  bookingId: string;
  refundAmount: number;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Confirmación de Cancelación</h2>
      <p>Hola ${params.name},</p>
      <p>Tu reserva <strong>#${
        params.bookingId
      }</strong> ha sido cancelada exitosamente.</p>
      ${
        params.refundAmount > 0
          ? `<p>Recibirás un reembolso de <strong>$${params.refundAmount.toFixed(
              2
            )} USD</strong> en 5-10 días hábiles.</p>`
          : ""
      }
      <p>Esperamos verte en otra ocasión!</p>
      <p>Equipo Mai Ke Kai</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.email,
    subject: `Cancelación Confirmada #${params.bookingId} - Mai Ke Kai`,
    html,
  });
}

export async function sendStaffBookingAlert(params: {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNationality?: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  serviceNames?: string[];
  total: number;
  source: string;
  specialRequests?: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5B8A9A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    .label { color: #6B7280; font-weight: bold; }
    .value { text-align: right; }
    .total-row { border-top: 2px solid #E5E7EB; padding-top: 12px; }
    .services { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .special-requests { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
    .guest-info { background: #EEF4FF; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Nueva Reserva</h1>
      <p style="margin:5px 0 0 0;">#${params.bookingId}</p>
    </div>
    <div class="content">
      <table>
        <tr>
          <td class="label">Canal:</td>
          <td class="value">${params.source}</td>
        </tr>
        <tr>
          <td class="label">Huésped:</td>
          <td class="value">${params.guestName}</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="value">${params.guestEmail}</td>
        </tr>
        ${
          params.guestPhone
            ? `<tr>
          <td class="label">Teléfono:</td>
          <td class="value">${params.guestPhone}</td>
        </tr>`
            : ""
        }
        ${
          params.guestNationality
            ? `<tr>
          <td class="label">Nacionalidad:</td>
          <td class="value">${params.guestNationality}</td>
        </tr>`
            : ""
        }
        <tr>
          <td class="label">Check-in:</td>
          <td class="value">${params.checkIn}</td>
        </tr>
        <tr>
          <td class="label">Check-out:</td>
          <td class="value">${params.checkOut}</td>
        </tr>
        <tr>
          <td class="label">Habitaciones:</td>
          <td class="value">${params.roomNames.join(", ")}</td>
        </tr>
        ${
          params.serviceNames && params.serviceNames.length > 0
            ? `<tr>
          <td class="label">Servicios Adicionales:</td>
          <td class="value">${params.serviceNames.join(", ")}</td>
        </tr>`
            : ""
        }
        <tr class="total-row">
          <td class="label" style="font-size: 18px;">Total:</td>
          <td class="value" style="font-size: 20px; color: #5B8A9A; font-weight: bold;">$${params.total.toFixed(
            2
          )}</td>
        </tr>
      </table>

      ${
        params.serviceNames && params.serviceNames.length > 0
          ? `<div class="services">
        <h4 style="margin-top: 0; color: #5B8A9A;">🏄 Servicios Reservados</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${params.serviceNames
            .map((service) => `<li>${service}</li>`)
            .join("")}
        </ul>
      </div>`
          : ""
      }

      ${
        params.specialRequests
          ? `<div class="special-requests">
        <h4 style="margin-top: 0; color: #F59E0B;">📝 Solicitudes Especiales</h4>
        <p style="margin: 0;">${params.specialRequests}</p>
      </div>`
          : ""
      }

      <div style="margin-top: 20px; text-align: center;">
        <a href="${
          process.env.NEXT_PUBLIC_BASE_URL || "https://maikekai.com"
        }/admin/bookings/${params.bookingId}"
           style="display: inline-block; background: #5B8A9A; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; font-weight: bold;">
          Ver en Admin Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: process.env.STAFF_EMAIL || "staff@maikekai.com",
    subject: `Nueva Reserva: ${params.guestName} - #${params.bookingId}`,
    html,
  });
}

export async function sendNewUserWelcome(params: {
  to: string;
  name: string;
  resetUrl: string;
  role: string;
}) {
  const roleDisplay =
    params.role === "volunteer"
      ? "Voluntario"
      : params.role === "admin"
      ? "Administrador"
      : "Usuario";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #0E3244; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #5B8A9A 0%, #7DCFB6 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #5B8A9A; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .role-badge { background: #EEF4FF; color: #5B8A9A; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 28px;">Pura Vida ${params.name}!</h1>
      <p style="margin:10px 0 0 0; font-size: 16px;">Bienvenido al equipo de Mai Ke Kai</p>
    </div>
    <div class="content">
      <p>Tu cuenta ha sido creada exitosamente en el sistema de Mai Ke Kai Surf House.</p>

      <div class="role-badge">${roleDisplay}</div>

      <p>Para comenzar, necesitas crear tu contraseña haciendo clic en el botón:</p>

      <div style="text-align: center;">
        <a href="${params.resetUrl}" class="button">Crear mi Contraseña</a>
      </div>

      <div style="background: #EEF4FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Información importante:</h3>
        <ul style="line-height: 1.6;">
          <li>Este enlace expirará en 24 horas</li>
          <li>Una vez creada tu contraseña, podrás acceder al panel administrativo</li>
          <li>Si eres voluntario, tendrás acceso limitado a ciertas funciones</li>
          <li>Si eres administrador, tendrás acceso completo al sistema</li>
        </ul>
      </div>

      <p>Si tienes alguna pregunta, contacta al administrador del sistema.</p>
    </div>
    <div class="footer">
      <p>Mai Ke Kai Surf House | Puerto Viejo, Costa Rica<br>
      <a href="https://maikekai.com" style="color: #5B8A9A;">www.maikekai.com</a></p>
      <p style="margin-top: 10px;">Pura Vida! 🌊🏄</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Bienvenido a Mai Ke Kai - ${roleDisplay}`,
    html,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  confirmationUrl: string;
}) {
  const html = `<!DOCTYPE html>
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
      background: linear-gradient(135deg, #5B8A9A 0%, #2C5F6E 100%);
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
      <p class="greeting">Hi ${params.name},</p>

      <p class="text">
        Your surf adventure in Tamarindo is about to begin. We're so excited to have you join our family.
        To start enjoying all our experiences, please confirm your email address first.
      </p>

      <div class="button-container">
        <a href="${params.confirmationUrl}" class="button">Confirm My Account</a>
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
        If you didn't create an account at Mai Ke Kai, you can safely ignore this email.
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
</body>
</html>`;

  return sendEmail({
    to: params.to,
    subject: `Welcome to Mai Ke Kai - Confirm Your Email`,
    html,
  });
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
      <h1 class="title">¡Bienvenido a Mai Ke Kai! 🌊</h1>
      <p class="greeting">Hola ${params.name},</p>
      
      <p class="text">
        Tu aventura de surf en Tamarindo está por comenzar. Nos emociona mucho que te unas a nuestra familia.
        Para comenzar a disfrutar de todas nuestras experiencias, primero confirma tu correo electrónico.
      </p>
      
      <div class="button-container">
        <a href="${params.confirmationUrl}" class="button">Confirmar Mi Cuenta</a>
      </div>
      
      <div class="info-box">
        <h3>¿Qué sigue después de confirmar?</h3>
        <ul>
          <li>Inicia sesión en tu cuenta</li>
          <li>Explora nuestras habitaciones y paquetes de surf</li>
          <li>Reserva tu primera experiencia de surf</li>
          <li>Acumula puntos y canjea recompensas exclusivas</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p class="text">
        Si no creaste una cuenta en Mai Ke Kai, puedes ignorar este email sin problemas.
      </p>
    </div>
    
    <div class="footer">
      <p>Síguenos en redes sociales</p>
      <div class="social-links">
        <a href="https://instagram.com/maikekai">Instagram</a> |
        <a href="https://facebook.com/maikekai">Facebook</a> |
        <a href="https://wa.me/50612345678">WhatsApp</a>
      </div>
      <p>Mai Ke Kai Surf House | Tamarindo, Costa Rica</p>
      <p><a href="https://maikekai.com" style="color: #5B8A9A;">www.maikekai.com</a></p>
      <p class="pura-vida">¡Pura Vida! 🏄</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: params.to,
    subject: `Bienvenido a Mai Ke Kai - Confirma tu correo electrónico`,
    html,
  });
}
