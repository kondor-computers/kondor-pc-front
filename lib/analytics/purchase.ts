import type { PaymentMethod } from "@/lib/validations/order";

export type PaymentStatus = "paid" | "pending" | "unpaid";

export type PurchaseEventParams = {
  transaction_id: string;
  value: number;
  currency: "UAH";
  payment_method: string;
  payment_status: PaymentStatus;
};

const PAYMENT_METHOD_ANALYTICS: Record<PaymentMethod, string> = {
  monopay: "card",
  cod: "cash_on_delivery",
  installment: "installment",
  monobank_parts: "installment_monobank",
  privat_parts: "installment_privat",
  pumb_parts: "installment_pumb",
  iban_individual: "iban",
  iban_business: "iban_business",
  crypto: "crypto",
};

export function getAnalyticsPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_ANALYTICS[method] ?? method;
}

/** Статус оплати на момент оформлення (до підтвердження платежу). */
export function getCheckoutPaymentStatus(
  method: PaymentMethod,
): Exclude<PaymentStatus, "paid"> {
  if (method === "monopay") return "pending";
  return "unpaid";
}

function dedupeKey(params: PurchaseEventParams): string {
  return `purchase:${params.transaction_id}:${params.payment_status}`;
}

export function trackPurchase(params: PurchaseEventParams): void {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(dedupeKey(params))) return;
    sessionStorage.setItem(dedupeKey(params), "1");
  } catch {
    // sessionStorage недоступний — все одно відправляємо подію
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "purchase",
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency,
    payment_method: params.payment_method,
    payment_status: params.payment_status,
  });
}

export const MONOPAY_CHECKOUT_STORAGE_KEY = "kondor_monopay_checkout";

export type MonopayCheckoutStorage = {
  invoiceId: string;
  transaction_id: string;
  value: number;
  payment_method: string;
};

export function saveMonopayCheckoutSession(data: MonopayCheckoutStorage): void {
  try {
    sessionStorage.setItem(MONOPAY_CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function readMonopayCheckoutSession(): MonopayCheckoutStorage | null {
  try {
    const raw = sessionStorage.getItem(MONOPAY_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MonopayCheckoutStorage;
  } catch {
    return null;
  }
}

export function clearMonopayCheckoutSession(): void {
  try {
    sessionStorage.removeItem(MONOPAY_CHECKOUT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
