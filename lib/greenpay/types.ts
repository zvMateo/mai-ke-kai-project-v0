// GreenPay Payment Gateway Types
export interface GreenPayConfig {
  secret: string;
  publicKey: string;
  terminalId: string;
  merchantId: string;
  sandbox: boolean;
  baseUrl: string;
}

export interface GreenPayPaymentRequest {
  amount: number;
  currency: "USD" | "CRC";
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface GreenPayPaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl: string;
  status: "pending" | "completed" | "failed";
  error?: string;
}

export interface GreenPayWebhookPayload {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "completed" | "failed" | "cancelled";
  payment_method: string;
  transaction_id: string;
  timestamp: string;
  signature: string;
  metadata?: Record<string, any>;
}

// GreenPay API Response Types
export interface GreenPayApiResponse {
  status: number;
  errors?: string;
  data?: any;
  transaction_id?: string;
  approval_code?: string;
  response_code?: string;
  response_text?: string;
}

export interface GreenPayTokenRequest {
  cardNumber: string;
  cardHolder: string;
  expirationDate: string;
  cvv: string;
}

export interface GreenPayTokenResponse {
  success: boolean;
  token: string;
  error?: string;
}

export interface GreenPayRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface GreenPayRefundResponse {
  success: boolean;
  refundId: string;
  status: string;
  error?: string;
}

// Costa Rica specific payment data
export interface GreenPayCRPaymentData {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  sinpeCode?: string;
  reference: string;
  amount: number;
  currency: "CRC" | "USD";
  instructions: string;
  expiresAt: Date;
}
