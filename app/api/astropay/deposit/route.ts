import { NextResponse } from 'next/server';
import { createBookingWithCheckout } from '@/lib/actions/checkout';
import { createDepositForBooking } from '@/lib/astropay/deposit';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.bookingData) {
      return NextResponse.json(
        { error: 'Datos de reserva requeridos' },
        { status: 400 }
      );
    }

    if (!body.bookingData.guestInfo) {
      return NextResponse.json(
        { error: 'Información de huésped requerida' },
        { status: 400 }
      );
    }

    if (!body.bookingData.guestInfo.country) {
      return NextResponse.json(
        { error: 'País es requerido para AstroPay' },
        { status: 400 }
      );
    }

    const bookingResult = await createBookingWithCheckout(body.bookingData);

    const nameParts = (
      body.bookingData.guestInfo.fullName || ''
    ).trim().split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const depositResult = await createDepositForBooking({
      id: bookingResult.bookingId,
      total_amount: bookingResult.totalAmount,
      email: body.bookingData.guestInfo.email,
      first_name: firstName,
      last_name: lastName,
      phone: body.bookingData.guestInfo.phone,
      country: body.bookingData.guestInfo.country,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    await fetch(`${baseUrl}/api/astropay/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookingResult.bookingId,
        depositId: depositResult.deposit_external_id,
        merchantDepositId: depositResult.merchant_deposit_id,
      }),
    });

    return NextResponse.json({ url: depositResult.url });
  } catch (error) {
    console.error('AstroPay deposit create error:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    );
  }
}
