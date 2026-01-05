import { NextRequest, NextResponse } from "next/server";
import { createGreenPayClient } from "@/lib/greenpay/client";

const greenpayClient = createGreenPayClient();

/**
 * Tokenize a credit card with GreenPay
 * POST /api/greenpay/tokenize-card
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[GreenPay Tokenize] Request body:", body);

    const { cardNumber, cardHolder, expirationDate, cvv } = body;

    // Validate required fields
    if (!cardNumber || !cardHolder || !expirationDate || !cvv) {
      return NextResponse.json(
        { error: "Missing required card details" },
        { status: 400 }
      );
    }

    const tokenResult = await greenpayClient.tokenizeCard({
      cardNumber,
      cardHolder,
      expirationDate,
      cvv,
    });

    console.log("[GreenPay Tokenize] Result:", tokenResult);

    if (!tokenResult.success) {
      return NextResponse.json(
        { error: tokenResult.error || "Card tokenization failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: tokenResult.token,
    });
  } catch (error: any) {
    console.error("GreenPay tokenize card error:", error);
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
