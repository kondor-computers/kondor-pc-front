export interface MonopayBasketItem {
  name: string;
  qty: number;
  sum: number;
  total: number;
  icon: string | null;
  unit: string;
  code: string;
  barcode: string | null;
  header: string | null;
  footer: string | null;
  tax: unknown[];
  uktzed: string | null;
}

export type MonopayBasket = MonopayBasketItem[];

export interface MonopayInvoiceRequest {
  amount: number;
  orderNumber: string;
  basketOrder: MonopayBasket;
  /** Сума замовлення в грн (без комісії) — для redirect URL та аналітики. */
  orderValueUah?: number;
}

export interface MonopayInvoiceResponse {
  pageUrl?: string;
  invoiceId?: string;
  error?: unknown;
}
