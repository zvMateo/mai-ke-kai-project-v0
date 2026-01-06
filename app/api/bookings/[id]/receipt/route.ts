import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { differenceInDays, format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  try {
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (full_name, email, phone, nationality),
        booking_rooms (
          rooms (name),
          price_per_night
        ),
        booking_services (
          quantity,
          price_at_booking,
          services (name)
        )
      `)
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const nights = differenceInDays(checkOut, checkIn);

    const roomsTotal = booking.booking_rooms.reduce(
      (sum: number, br: any) => sum + br.price_per_night * nights,
      0
    );

    const servicesTotal = booking.booking_services.reduce(
      (sum: number, bs: any) => sum + bs.price_at_booking * bs.quantity,
      0
    );

    const subtotal = roomsTotal + servicesTotal;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comprobante de Reserva - ${id.slice(0, 8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica', 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      padding-bottom: 20px;
      border-bottom: 3px solid #5B8A9A;
    }
    .logo { 
      font-size: 28px; 
      font-weight: bold; 
      color: #5B8A9A;
      margin-bottom: 10px;
    }
    .title { 
      font-size: 24px; 
      font-weight: bold;
      color: #22c55e;
      margin-bottom: 5px;
    }
    .booking-id { 
      color: #666; 
      font-size: 14px;
    }
    .section { 
      margin-bottom: 30px;
    }
    .section-title { 
      font-size: 16px; 
      font-weight: bold;
      color: #5B8A9A;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e5e5;
    }
    .row { 
      display: flex; 
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 500; }
    .total-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.final {
      font-size: 18px;
      font-weight: bold;
      color: #5B8A9A;
      border-top: 2px solid #5B8A9A;
      padding-top: 15px;
      margin-top: 10px;
    }
    .status {
      display: inline-block;
      background: #dcfce7;
      color: #16a34a;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      margin-top: 20px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏄 Mai Ke Kai Surf House</div>
    <div class="title">✓ Comprobante de Reserva</div>
    <div class="booking-id">#${
      booking.id.slice(0, 8).toUpperCase()
    } | ${format(new Date(booking.created_at), "d 'de' MMMM 'de' yyyy")}</div>
  </div>

  <div class="section">
    <div class="section-title">📅 Fechas de la Estadía</div>
    <div class="row">
      <span class="label">Check-in</span>
      <span class="value">${format(checkIn, "EEEE, d 'de' MMMM 'de' yyyy")}</span>
    </div>
    <div class="row">
      <span class="label">Check-out</span>
      <span class="value">${format(checkOut, "EEEE, d 'de' MMMM 'de' yyyy")}</span>
    </div>
    <div class="row">
      <span class="label">Noches</span>
      <span class="value">${nights}</span>
    </div>
    <div class="row">
      <span class="label">Huéspedes</span>
      <span class="value">${booking.guests_count}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">👤 Datos del Huésped</div>
    <div class="row">
      <span class="label">Nombre</span>
      <span class="value">${booking.users.full_name || "No especificado"}</span>
    </div>
    <div class="row">
      <span class="label">Email</span>
      <span class="value">${booking.users.email}</span>
    </div>
    <div class="row">
      <span class="label">Teléfono</span>
      <span class="value">${booking.users.phone || "No especificado"}</span>
    </div>
  </div>

  ${
    booking.booking_rooms.length > 0
      ? `
  <div class="section">
    <div class="section-title">🏠 Habitaciones</div>
    ${booking.booking_rooms
      .map(
        (br: any) => `
    <div class="row">
      <span class="label">${br.rooms.name} × ${nights} noches</span>
      <span class="value">$${(
        br.price_per_night * nights
      ).toFixed(2)}</span>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    booking.booking_services.length > 0
      ? `
  <div class="section">
    <div class="section-title">🏄 Servicios Adicionales</div>
    ${booking.booking_services
      .map(
        (bs: any) => `
    <div class="row">
      <span class="label">${bs.services.name} × ${bs.quantity}</span>
      <span class="value">$${(
        bs.price_at_booking * bs.quantity
      ).toFixed(2)}</span>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="total-section">
    <div class="total-row">
      <span class="label">Subtotal</span>
      <span class="value">$${subtotal.toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span class="label">IVA (13%)</span>
      <span class="value">$${tax.toFixed(2)}</span>
    </div>
    <div class="total-row final">
      <span>Total Pagado</span>
      <span>$${total.toFixed(2)} USD</span>
    </div>
  </div>

  <div style="text-align: center;">
    <span class="status">✓ Pago Confirmado</span>
  </div>

  <div class="section" style="margin-top: 30px;">
    <div class="section-title">📍 Ubicación</div>
    <div class="row">
      <span class="label">Establecimiento</span>
      <span class="value">Mai Ke Kai Surf House</span>
    </div>
    <div class="row">
      <span class="label">Dirección</span>
      <span class="value">Playa Tamarindo, Guanacaste, Costa Rica</span>
    </div>
    <div class="row">
      <span class="label">Check-in</span>
      <span class="value">3:00 PM</span>
    </div>
    <div class="row">
      <span class="label">Check-out</span>
      <span class="value">11:00 AM</span>
    </div>
  </div>

  <div class="footer">
    <p>🏄 Mai Ke Kai Surf House | Playa Tamarindo, Costa Rica</p>
    <p>📧 reservas@maikekai.com | 📱 +506 8888-8888</p>
    <p style="margin-top: 10px;">Pura Vida! 🌊</p>
  </div>

  <script class="no-print">
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="reserva-${id.slice(0, 8).toUpperCase()}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
