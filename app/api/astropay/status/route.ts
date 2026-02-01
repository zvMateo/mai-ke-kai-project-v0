import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDepositStatus } from '@/lib/astropay/deposit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, depositId } = body;

    if (!bookingId || !depositId) {
      return NextResponse.json(
        { error: 'bookingId y depositId son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('status, payment_status')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    if (booking.payment_status === 'paid') {
      return NextResponse.json({ status: 'already_paid', message: 'Pago ya confirmado' });
    }

    const depositStatus = await getDepositStatus(depositId);

    if (depositStatus.status === 'APPROVED') {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        return NextResponse.json(
          { error: 'Error actualizando estado de reserva' },
          { status: 500 }
        );
      }

      return NextResponse.json({ status: 'confirmed', depositStatus });
    }

    return NextResponse.json({ status: depositStatus.status, depositStatus });
  } catch (error) {
    console.error('AstroPay status check error:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar estado' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json(
      { error: 'bookingId es requerido' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('astropay_deposit_id, payment_status, status')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    if (!booking.astropay_deposit_id) {
      return NextResponse.json({
        status: 'not_started',
        message: 'No hay depósito asociado a esta reserva',
      });
    }

    const depositStatus = await getDepositStatus(booking.astropay_deposit_id);

    return NextResponse.json({
      booking_status: booking.status,
      payment_status: booking.payment_status,
      deposit_status: depositStatus,
    });
  } catch (error) {
    console.error('AstroPay status GET error:', error);
    return NextResponse.json(
      { error: 'Error interno al consultar estado' },
      { status: 500 }
    );
  }
}
