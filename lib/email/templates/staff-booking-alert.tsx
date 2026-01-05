interface StaffBookingAlertEmailProps {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  roomNames: string[]
  total: number
  source: string
}

export const StaffBookingAlertEmail = (props: StaffBookingAlertEmailProps) => (
  <html>
    <body style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ backgroundColor: "#5B8A9A", color: "#fff", padding: "20px", borderRadius: "8px 8px 0 0" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Nueva Reserva</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>#{props.bookingId}</p>
      </div>

      <div
        style={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", padding: "20px", borderRadius: "0 0 8px 8px" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Canal:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.source}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Huesped:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.guestName}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Email:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.guestEmail}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Check-in:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.checkIn}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Check-out:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.checkOut}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", color: "#6B7280", fontWeight: "bold" }}>Habitaciones:</td>
            <td style={{ padding: "8px 0", color: "#0E3244", textAlign: "right" }}>{props.roomNames.join(", ")}</td>
          </tr>
          <tr style={{ borderTop: "2px solid #E5E7EB" }}>
            <td style={{ padding: "12px 0", fontSize: "18px", fontWeight: "bold", color: "#0E3244" }}>Total:</td>
            <td
              style={{ padding: "12px 0", fontSize: "20px", fontWeight: "bold", color: "#5B8A9A", textAlign: "right" }}
            >
              ${props.total.toFixed(2)}
            </td>
          </tr>
        </table>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings/${props.bookingId}`}
            style={{
              display: "inline-block",
              backgroundColor: "#5B8A9A",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Ver en Admin Dashboard
          </a>
        </div>
      </div>
    </body>
  </html>
)
