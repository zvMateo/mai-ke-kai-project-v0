const TILOPAY_BASE_URL = "https://app.tilopay.com/api/v1";

async function getTilopayToken(): Promise<string> {
  try {
    const response = await fetch(`${TILOPAY_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiuser: process.env.TILOPAY_API_USER,
        password: process.env.TILOPAY_API_PASSWORD,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.access_token) {
      console.error("Tilopay Auth Error:", data);
      throw new Error("Error obteniendo token de Tilopay");
    }

    return data.access_token;
  } catch (error) {
    console.error("Tilopay Auth Error:", error);
    throw error;
  }
}

export interface TilopayClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface TilopayPaymentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function createTilopayPayment(orderData: {
  orderId: string;
  amount: number;
  currency: string;
  client: TilopayClientInfo;
}): Promise<TilopayPaymentResult> {
  try {
    const token = await getTilopayToken();

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tilopay/return`;

    const payload = {
      key: process.env.TILOPAY_API_KEY,
      redirect: redirectUrl,
      amount: orderData.amount.toFixed(2),
      currency: orderData.currency,
      orderNumber: orderData.orderId,
      billToFirstName: orderData.client.firstName,
      billToLastName: orderData.client.lastName,
      billToAddress: "Costa Rica",
      billToAddress2: "Tamarindo",
      billToCity: "Guanacaste",
      billToState: "SJ",
      billToZipPostCode: "10000",
      billToCountry: "CR",
      billToTelephone: orderData.client.phone,
      billToEmail: orderData.client.email,
      shipToFirstName: orderData.client.firstName,
      shipToLastName: orderData.client.lastName,
      shipToAddress: "Costa Rica",
      shipToAddress2: "Tamarindo",
      shipToCity: "Guanacaste",
      shipToState: "SJ",
      shipToZipPostCode: "10000",
      shipToCountry: "CR",
      shipToTelephone: orderData.client.phone,
      capture: "1",
      subscription: "0",
      platform: "api",
    };

    const response = await fetch(`${TILOPAY_BASE_URL}/processPayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Tilopay Response Error:", data);
      throw new Error(data.response_text || "Error iniciando pago en Tilopay");
    }

    return {
      success: true,
      url: data.url,
    };

  } catch (error) {
    console.error("Tilopay Payment Error:", error);
    return { success: false, error: "No se pudo conectar con la pasarela de pago." };
  }
}
