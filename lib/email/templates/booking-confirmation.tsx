interface BookingConfirmationEmailProps {
  bookingId: string
  guestName: string
  
  checkIn: string
  checkOut: string
  roomNames: string[]
  total: number
  paymentStatus: string
}

export const BookingConfirmationEmail = (props: BookingConfirmationEmailProps) => (
  <html>
    <body style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#5B8A9A", fontSize: "28px", margin: 0 }}>Mai Ke Kai Surf House</h1>
        <p style={{ color: "#0E3244", fontSize: "14px" }}>Puerto Viejo, Costa Rica</p>
      </div>

      <div style={{ backgroundColor: "#EEF4FF", padding: "30px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2 style={{ color: "#0E3244", margin: "0 0 10px 0" }}>Confirmacion de Reserva</h2>
        <p style={{ color: "#0E3244", fontSize: "16px", margin: "5px 0" }}>
          <strong>ID:</strong> #{props.bookingId}
        </p>
        <p style={{ color: "#0E3244", fontSize: "16px", margin: "5px 0" }}>
          <strong>Estado:</strong>{" "}
          {props.paymentStatus === "paid"
            ? "✓ Pagado"
            : props.paymentStatus === "partial"
              ? "Pago Parcial"
              : "Pendiente"}
        </p>
      </div>

      <p style={{ fontSize: "16px", color: "#0E3244" }}>Hola {props.guestName},</p>
      <p style={{ fontSize: "16px", color: "#0E3244" }}>
        Tu reserva en Mai Ke Kai Surf House ha sido confirmada! Estamos emocionados de recibirte.
      </p>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #E5E7EB",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h3 style={{ color: "#0E3244", marginTop: 0 }}>Detalles de tu Estadia</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280" }}>Check-in:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", fontWeight: "bold", textAlign: "right" }}>
              {props.checkIn}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280" }}>Check-out:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", fontWeight: "bold", textAlign: "right" }}>
              {props.checkOut}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280" }}>Habitaciones:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", fontWeight: "bold", textAlign: "right" }}>
              {props.roomNames.join(", ")}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid #E5E7EB" }}>
            <td style={{ padding: "12px 0", color: "#0E3244", fontSize: "18px", fontWeight: "bold" }}>Total:</td>
            <td
              style={{ padding: "12px 0", color: "#5B8A9A", fontSize: "20px", fontWeight: "bold", textAlign: "right" }}
            >
              ${props.total.toFixed(2)}
            </td>
          </tr>
        </table>
      </div>

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#7DCFB6", borderRadius: "8px" }}>
        <h3 style={{ color: "#0E3244", marginTop: 0 }}>Informacion Importante</h3>
        <ul style={{ color: "#0E3244", lineHeight: "1.6" }}>
          <li>Check-in: 2:00 PM - 8:00 PM</li>
          <li>Check-out: 11:00 AM</li>
          <li>WiFi gratuito disponible</li>
          <li>Desayuno incluido</li>
          <li>Clases de surf y tours disponibles</li>
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", padding: "20px", borderTop: "1px solid #E5E7EB" }}>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>Si tienes alguna pregunta, contactanos:</p>
        <p style={{ color: "#5B8A9A", fontSize: "16px", fontWeight: "bold" }}>
          WhatsApp: +506 1234 5678 | Email: info@maikekai.com
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ color: "#6B7280", fontSize: "12px" }}>Pura Vida! 🌊🏄</p>
      </div>
    </body>
  </html>
)
