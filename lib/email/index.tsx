import "server-only"
import { Resend } from "resend"
import { BookingConfirmationEmail } from "./templates/booking-confirmation"
import { CheckInReminderEmail } from "./templates/check-in-reminder"
import { StaffBookingAlertEmail } from "./templates/staff-booking-alert"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || "Mai Ke Kai <reservas@maikekai.com>"

export async function sendBookingConfirmation(params: {
  to: string
  bookingId: string
  guestName: string
  checkIn: string
  checkOut: string
  roomNames: string[]
  total: number
  paymentStatus: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping booking confirmation")
    return { success: false, reason: "not_configured" }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Confirmacion de Reserva #${params.bookingId} - Mai Ke Kai Surf House`,
      react: BookingConfirmationEmail(params),
    })
    return { success: true }
  } catch (error) {
    console.error("[Email] Failed to send booking confirmation:", error)
    return { success: false, error }
  }
}

export async function sendCheckInReminder(params: {
  to: string
  guestName: string
  bookingId: string
  checkIn: string
  roomNames: string[]
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping check-in reminder")
    return { success: false, reason: "not_configured" }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Check-in Online Disponible - Reserva #${params.bookingId}`,
      react: CheckInReminderEmail(params),
    })
    return { success: true }
  } catch (error) {
    console.error("[Email] Failed to send check-in reminder:", error)
    return { success: false, error }
  }
}

export async function sendStaffBookingAlert(params: {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  roomNames: string[]
  total: number
  source: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping staff alert")
    return { success: false, reason: "not_configured" }
  }

  const staffEmail = process.env.STAFF_EMAIL || "staff@maikekai.com"

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: staffEmail,
      subject: `Nueva Reserva #${params.bookingId} - ${params.source}`,
      react: StaffBookingAlertEmail(params),
    })
    return { success: true }
  } catch (error) {
    console.error("[Email] Failed to send staff alert:", error)
    return { success: false, error }
  }
}

export async function sendCancellationEmail(params: {
  to: string
  guestName: string
  bookingId: string
  refundAmount?: number
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping cancellation email")
    return { success: false, reason: "not_configured" }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Cancelacion de Reserva #${params.bookingId} - Mai Ke Kai`,
      html: `
        <h2>Hola ${params.guestName},</h2>
        <p>Tu reserva #${params.bookingId} ha sido cancelada exitosamente.</p>
        ${params.refundAmount ? `<p>Se ha procesado un reembolso de $${params.refundAmount.toFixed(2)}.</p>` : ""}
        <p>Esperamos verte pronto en Mai Ke Kai!</p>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error("[Email] Failed to send cancellation email:", error)
    return { success: false, error }
  }
}
