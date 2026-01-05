import { NextResponse } from "next/server";
import { createBookingWithCheckout } from "@/lib/actions/checkout";
import { createTilopayPayment } from "@/lib/tilopay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const bookingResult = await createBookingWithCheckout(body.bookingData);
    
    const paymentResult = await createTilopayPayment({
      orderId: bookingResult.bookingId,
      amount: bookingResult.totalAmount,
      currency: "USD",
      client: {
        firstName: body.bookingData.guestInfo.firstName,
        lastName: body.bookingData.guestInfo.lastName,
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
