import { NextResponse } from "next/server";
import { createBookingWithCheckout } from "@/lib/actions/checkout";
import { createTilopayPayment } from "@/lib/tilopay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    if (!body.bookingData) {
      return NextResponse.json(
        { error: "Datos de reserva requeridos" },
        { status: 400 }
      );
    }

    if (!body.bookingData.guestInfo) {
      return NextResponse.json(
        { error: "Información de huésped requerida" },
        { status: 400 }
      );
    }
    
    const bookingResult = await createBookingWithCheckout(body.bookingData);
    
    // Parsear fullName en firstName y lastName
    const fullName = body.bookingData.guestInfo.fullName || "";
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "User";
    
    const paymentResult = await createTilopayPayment({
      orderId: bookingResult.bookingId,
      amount: bookingResult.totalAmount,
      currency: "USD",
      client: {
        firstName,
        lastName,
        email: body.bookingData.guestInfo.email,
        phone: body.bookingData.guestInfo.phone,
      },
    });

    if (paymentResult.success && paymentResult.url) {
      return NextResponse.json({ url: paymentResult.url });
    } else {
      return NextResponse.json({ error: paymentResult.error }, { status: 500 });
    }

  } catch (error) {
    console.error("Tilopay create error:", error);
    return NextResponse.json({ error: "Error interno al procesar el pago" }, { status: 500 });
  }
}
