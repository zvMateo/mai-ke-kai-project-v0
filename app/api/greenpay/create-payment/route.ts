import { NextRequest, NextResponse } from "next/server";
import { createGreenPayClient } from "@/lib/greenpay/client";

const greenpayClient = createGreenPayClient();

/**
 * Create a payment with GreenPay
 * POST /api/greenpay/create-payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[GreenPay API] Request body:", body);

    const {
      amount,
      currency = "USD",
      orderId,
      description,
      customerEmail,
      customerName,
      metadata,
      cardDetails, // Card details for direct payment
    } = body;

    // Validate required fields
    if (!amount || !orderId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = {
      amount: parseFloat(amount),
      currency,
      orderId,
      description: description || "Hotel booking payment",
      customerEmail,
      customerName,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?order=${orderId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancelled?order=${orderId}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/greenpay/webhook`,
      metadata: {
        ...metadata,
        source: "mai-ke-kai",
      },
    };

    console.log("[GreenPay API] Payment request:", paymentRequest);

    // For now, we'll assume card details are passed in the request
    // In a real implementation, you might want to tokenize first
    if (!cardDetails) {
      return NextResponse.json(
        { error: "Card details are required for payment" },
        { status: 400 }
      );
    }

    const paymentResult = await greenpayClient.createPayment(
      paymentRequest,
      cardDetails
    );

    console.log("[GreenPay API] Payment result:", paymentResult);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || "Payment creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.paymentId,
      paymentUrl: paymentResult.paymentUrl,
      status: paymentResult.status,
    });
  } catch (error: any) {
    console.error("GreenPay create payment error:", error);
    console.error("GreenPay error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
