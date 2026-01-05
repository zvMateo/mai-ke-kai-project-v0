import { NextRequest, NextResponse } from "next/server";
import { createGreenPayClient } from "@/lib/greenpay/client";

const greenpayClient = createGreenPayClient();

/**
 * Handle GreenPay webhooks
 * POST /api/greenpay/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[GreenPay Webhook] Received:", body);

    // Verify webhook signature (basic verification for now)
    const isValid = greenpayClient.verifyWebhook(body);

    if (!isValid) {
      console.log("[GreenPay Webhook] Invalid webhook payload");
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    // Process different webhook events
    const { status, order_id, transaction_id, amount, currency } = body;

    // Update booking status based on payment status
    if (status === "completed") {
      console.log(`[GreenPay Webhook] Payment completed for order ${order_id}`);

      // Here you would typically:
      // 1. Update booking status in database
      // 2. Send confirmation email
      // 3. Update analytics

      // For now, just log the successful payment
      console.log(
        `[GreenPay Webhook] Payment ${transaction_id} completed: ${amount} ${currency}`
      );
    } else if (status === "failed") {
      console.log(`[GreenPay Webhook] Payment failed for order ${order_id}`);

      // Here you would typically:
      // 1. Update booking status to failed
      // 2. Send failure notification
    } else if (status === "cancelled") {
      console.log(`[GreenPay Webhook] Payment cancelled for order ${order_id}`);

      // Handle cancelled payment
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("GreenPay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
