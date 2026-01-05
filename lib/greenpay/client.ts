import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  GreenPayConfig,
  GreenPayPaymentRequest,
  GreenPayPaymentResponse,
  GreenPayWebhookPayload,
  GreenPayTokenRequest,
  GreenPayTokenResponse,
  GreenPayApiResponse,
} from "./types";

export class GreenPayClient {
  private config: GreenPayConfig;
  private httpClient: AxiosInstance;

  constructor(config: GreenPayConfig) {
    this.config = config;

    // Create axios instance for GreenPay API
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Create a payment request using GreenPay API
   * This will tokenize the card and process payment in one step
   */
  async createPayment(
    request: GreenPayPaymentRequest,
    cardDetails: GreenPayTokenRequest
  ): Promise<GreenPayPaymentResponse> {
    try {
      // First, get session token
      const sessionToken = await this.getSessionToken();

      // Then, tokenize the card and make payment
      const payload = {
        terminal_id: this.config.terminalId,
        merchant_id: this.config.merchantId,
        amount: request.amount.toFixed(2),
        currency: request.currency,
        order_id: request.orderId,
        description: request.description,
        card_number: cardDetails.cardNumber,
        card_holder: cardDetails.cardHolder,
        expiration_date: cardDetails.expirationDate,
        cvv: cardDetails.cvv,
        session_token: sessionToken,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: request.webhookUrl,
        metadata: request.metadata || {},
      };

      const response: AxiosResponse = await this.httpClient.post(
        "/api/v1/payment/process",
        payload
      );

      // Handle the response structure from GreenPay API
      if (
        response.data.status === 200 ||
        response.data.response_code === "00"
      ) {
        return {
          success: true,
          paymentId:
            response.data.transaction_id ||
            response.data.data?.transaction_id ||
            request.orderId,
          paymentUrl: response.data.payment_url || "", // GreenPay may return a payment URL
          status: "completed", // GreenPay processes immediately
        };
      } else {
        return {
          success: false,
          paymentId: "",
          paymentUrl: "",
          status: "failed",
          error:
            response.data.response_text ||
            response.data.errors ||
            "Payment creation failed",
        };
      }
    } catch (error: any) {
      console.error("GreenPay payment creation error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.response_text ||
        error.message ||
        "Payment creation failed";

      return {
        success: false,
        paymentId: "",
        paymentUrl: "",
        status: "failed",
        error: errorMessage,
      };
    }
  }

  /**
   * Get session token for GreenPay API
   */
  async getSessionToken(): Promise<string> {
    try {
      const response: AxiosResponse = await this.httpClient.post(
        "/api/v1/auth/session",
        {
          merchant_id: this.config.merchantId,
          terminal_id: this.config.terminalId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.secret}`,
          },
        }
      );

      return response.data.session_token || response.data.token;
    } catch (error: any) {
      console.error("GreenPay session token error:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Tokenize a credit card for future use
   */
  async tokenizeCard(
    cardDetails: GreenPayTokenRequest
  ): Promise<GreenPayTokenResponse> {
    try {
      const sessionToken = await this.getSessionToken();

      const payload = {
        terminal_id: this.config.terminalId,
        merchant_id: this.config.merchantId,
        card_number: cardDetails.cardNumber,
        card_holder: cardDetails.cardHolder,
        expiration_date: cardDetails.expirationDate,
        cvv: cardDetails.cvv,
        session_token: sessionToken,
      };

      const response: AxiosResponse = await this.httpClient.post(
        "/api/v1/card/tokenize",
        payload
      );

      if (
        response.data.status === 200 ||
        response.data.response_code === "00"
      ) {
        return {
          success: true,
          token: response.data.token || response.data.data?.token,
        };
      } else {
        return {
          success: false,
          token: "",
          error:
            response.data.response_text ||
            response.data.errors ||
            "Card tokenization failed",
        };
      }
    } catch (error: any) {
      console.error("GreenPay card tokenization error:", error);
      return {
        success: false,
        token: "",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Make payment using a tokenized card
   */
  async makePaymentWithToken(
    request: GreenPayPaymentRequest,
    cardToken: string
  ): Promise<GreenPayPaymentResponse> {
    try {
      const sessionToken = await this.getSessionToken();

      const payload = {
        terminal_id: this.config.terminalId,
        merchant_id: this.config.merchantId,
        amount: request.amount.toFixed(2),
        currency: request.currency,
        order_id: request.orderId,
        description: request.description,
        card_token: cardToken,
        session_token: sessionToken,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: request.webhookUrl,
        metadata: request.metadata || {},
      };

      const response: AxiosResponse = await this.httpClient.post(
        "/api/v1/payment/process",
        payload
      );

      if (
        response.data.status === 200 ||
        response.data.response_code === "00"
      ) {
        return {
          success: true,
          paymentId:
            response.data.transaction_id ||
            response.data.data?.transaction_id ||
            request.orderId,
          paymentUrl: response.data.payment_url || "",
          status: "completed",
        };
      } else {
        return {
          success: false,
          paymentId: "",
          paymentUrl: "",
          status: "failed",
          error:
            response.data.response_text ||
            response.data.errors ||
            "Payment failed",
        };
      }
    } catch (error: any) {
      console.error("GreenPay token payment error:", error);
      return {
        success: false,
        paymentId: "",
        paymentUrl: "",
        status: "failed",
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.httpClient.get(
        `/api/v1/payment/status/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.secret}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("GreenPay status check error:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: GreenPayWebhookPayload): boolean {
    // For now, just check if webhook has required fields
    // We can implement signature verification later if GreenPay supports it
    return !!(payload.id && payload.order_id && payload.status);
  }
}

// Factory function to create GreenPay client
export function createGreenPayClient(): GreenPayClient {
  const config: GreenPayConfig = {
    secret: process.env.GREENPAY_SECRET!,
    publicKey: process.env.GREENPAY_PUBLIC_KEY!,
    terminalId: process.env.GREENPAY_TERMINAL_ID!,
    merchantId: process.env.GREENPAY_MERCHANT_ID!,
    sandbox: process.env.GREENPAY_SANDBOX === "true",
    baseUrl: "https://greenpay.me", // Correct base URL - greenpay.me is reachable
  };

  return new GreenPayClient(config);
}
