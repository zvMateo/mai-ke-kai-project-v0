import {
  getMerchantApiUrl,
  getStandardHeaders,
  type AstroPayDepositRequest,
  type AstroPayDepositResponse,
  type AstroPayDepositStatusResponse,
} from '../astropay';

export async function createDeposit(
  request: AstroPayDepositRequest
): Promise<AstroPayDepositResponse> {
  const url = getMerchantApiUrl('/merchant/v1/deposit/init');
  
  console.log('[AstroPay] Creating deposit:', {
    url,
    headers: getStandardHeaders(),
    request: {
      ...request,
      callback_url: request.callback_url,
      redirect_url: request.redirect_url,
    },
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: getStandardHeaders(),
    body: JSON.stringify(request),
  });

  const responseText = await response.text();
  
  console.log('[AstroPay] Response status:', response.status);
  console.log('[AstroPay] Response text:', responseText.substring(0, 500));

  if (!response.ok) {
    // Intentar parsear como JSON, si falla mostrar el HTML/texto crudo
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { rawResponse: responseText.substring(0, 200) };
    }
    
    console.error('AstroPay Deposit Error:', errorData);
    throw new Error(
      errorData.message || errorData.error || errorData.description || `HTTP ${response.status}: ${responseText.substring(0, 100)}`
    );
  }

  // Parsear la respuesta exitosa
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('[AstroPay] Failed to parse success response:', parseError);
    throw new Error('Invalid JSON response from AstroPay');
  }
}

export async function getDepositStatus(
  depositExternalId: string
): Promise<AstroPayDepositStatusResponse> {
  const url = getMerchantApiUrl(
    `/merchant/v1/deposit/${depositExternalId}`
  );

  const response = await fetch(url, {
    method: 'GET',
    headers: getStandardHeaders(),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { rawResponse: responseText.substring(0, 200) };
    }
    
    console.error('AstroPay Status Error:', errorData);
    throw new Error(
      errorData.message || errorData.error || `HTTP ${response.status}`
    );
  }

  return JSON.parse(responseText);
}

export async function createDepositForBooking(booking: {
  id: string;
  total_amount: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country: string;
}): Promise<AstroPayDepositResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const merchantDepositId = `booking_${booking.id}_${Date.now()}`;

  const request: AstroPayDepositRequest = {
    amount: booking.total_amount,
    currency: 'USD',
    merchant_deposit_id: merchantDepositId,
    callback_url: `${baseUrl}/api/webhooks/astropay`,
    redirect_url: `${baseUrl}/booking/booking-confirmation`,
    user: {
      merchant_user_id: booking.id,
      email: booking.email,
      country: booking.country,
      first_name: booking.first_name,
      last_name: booking.last_name,
      phone: booking.phone,
    },
    product: {
      mcc: '7995',
      category: 'accommodation',
      description: 'Mai Ke Kai Surf House - Booking',
    },
    visual_info: {
      logo_url: `${baseUrl}/logo.png`,
      merchant_name: 'Mai Ke Kai Surf House',
    },
  };

  return createDeposit(request);
}
