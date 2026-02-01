const ASTROPAY_MERCHANT_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://merchant-api.astropay.com'
    : 'https://merchant-api-stg.astropay.com';

export function getMerchantApiUrl(path: string): string {
  return `${ASTROPAY_MERCHANT_API_BASE_URL}${path}`;
}

export function getStandardHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Api-Key': process.env.ASTROPAY_API_KEY!,
    'Secret-Key': process.env.ASTROPAY_SECRET_KEY!,
  };
}

export interface AstroPayUser {
  merchant_user_id: string;
  email: string;
  country: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  document_id?: string;
}

export interface AstroPayProduct {
  mcc: string;
  category: string;
  description: string;
}

export interface AstroPayVisualInfo {
  logo_url?: string;
  merchant_name?: string;
}

export interface AstroPayDepositRequest {
  amount: number;
  currency: string;
  merchant_deposit_id: string;
  callback_url: string;
  redirect_url: string;
  user: AstroPayUser;
  product?: AstroPayProduct;
  visual_info?: AstroPayVisualInfo;
}

export interface AstroPayDepositResponse {
  merchant_deposit_id: string;
  deposit_external_id: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  url: string;
  type: 'default' | 'gateway';
}

export interface AstroPayDepositStatusResponse {
  merchant_deposit_id: string;
  deposit_external_id: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED';
  amount: number;
  currency: string;
}

export interface AstroPayCallbackPayload {
  deposit_external_id: string;
  merchant_deposit_id: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
  merchant_user_id?: string;
  deposit_user_id?: string;
  end_status_date?: string;
}

export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brasil', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'PE', name: 'Peru', currency: 'PEN' },
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'ES', name: 'España', currency: 'EUR' },
  { code: 'US', name: 'United States', currency: 'USD' },
] as const;

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'BRL',
  'ARS',
  'MXN',
  'CLP',
  'PEN',
  'COP',
] as const;
