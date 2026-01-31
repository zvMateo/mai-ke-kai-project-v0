interface CheckInReminderEmailProps {
  guestName: string
  bookingId: string
  checkIn: string
  roomNames: string[]
}

export const CheckInReminderEmail = (props: CheckInReminderEmailProps) => (
  <html>
    <body style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#5B8A9A", fontSize: "28px", margin: 0 }}>Mai Ke Kai Surf House</h1>
      </div>

      <p style={{ fontSize: "16px", color: "#0E3244" }}>Hola {props.guestName},</p>
      <p style={{ fontSize: "16px", color: "#0E3244" }}>
        Tu check-in se acerca! Puedes completar el proceso de check-in online ahora para agilizar tu llegada.
      </p>

      <div style={{ backgroundColor: "#EEF4FF", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
        <p style={{ fontSize: "16px", color: "#0E3244", margin: "0 0 10px 0" }}>
          <strong>Reserva:</strong> #{props.bookingId}
        </p>
        <p style={{ fontSize: "16px", color: "#0E3244", margin: "0 0 10px 0" }}>
          <strong>Check-in:</strong> {props.checkIn}
        </p>
        <p style={{ fontSize: "16px", color: "#0E3244", margin: 0 }}>
          <strong>Habitacion:</strong> {props.roomNames.join(", ")}
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdL5eZD8ZYn6KStj0BvZThe4j_h5EkWGUMYL-lSP1TsOA6-IQ/viewform"
          style={{
            display: "inline-block",
            backgroundColor: "#5B8A9A",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Completar Check-in Online
        </a>
      </div>

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#7DCFB6", borderRadius: "8px" }}>
        <p style={{ color: "#0E3244", fontSize: "14px", margin: 0 }}>
          El check-in online solo toma 2 minutos y te permitira ir directo a tu habitacion al llegar!
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px", padding: "20px", borderTop: "1px solid #E5E7EB" }}>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>Nos vemos pronto! 🌊</p>
      </div>
    </body>
  </html>
)
