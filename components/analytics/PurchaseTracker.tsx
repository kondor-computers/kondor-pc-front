"use client";

import { useEffect } from "react";

import {
  clearMonopayCheckoutSession,
  getAnalyticsPaymentMethod,
  getCheckoutPaymentStatus,
  readMonopayCheckoutSession,
  trackPurchase,
} from "@/lib/analytics/purchase";
import type { PaymentMethod } from "@/lib/validations/order";

type PurchaseTrackerProps = {
  orderNumber: string;
  paymentMethod?: PaymentMethod;
  valueUah?: number;
};

export function PurchaseTracker({
  orderNumber,
  paymentMethod,
  valueUah,
}: PurchaseTrackerProps) {
  useEffect(() => {
    if (!orderNumber || orderNumber === "UA-XXXXXX-XXXX") return;

    if (paymentMethod !== "monopay") return;

    const session = readMonopayCheckoutSession();
    if (!session || session.transaction_id !== orderNumber) return;

    const value = valueUah ?? session.value;

    (async () => {
      try {
        const res = await fetch(
          `/api/monopay/status?invoiceId=${encodeURIComponent(session.invoiceId)}`,
        );
        if (!res.ok) return;

        const data = (await res.json()) as { status?: string };
        if (data.status !== "success") return;

        trackPurchase({
          transaction_id: orderNumber,
          value,
          currency: "UAH",
          payment_method: session.payment_method,
          payment_status: "paid",
        });
        clearMonopayCheckoutSession();
      } catch {
        // Не блокуємо сторінку успіху
      }
    })();
  }, [orderNumber, paymentMethod, valueUah]);

  return null;
}

/** Для не-monopay: резервне відстеження з URL, якщо checkout не встиг відправити подію. */
export function PurchaseTrackerFallback({
  orderNumber,
  paymentMethod,
  valueUah,
  paymentStatus,
}: {
  orderNumber: string;
  paymentMethod: PaymentMethod;
  valueUah: number;
  paymentStatus: "pending" | "unpaid";
}) {
  useEffect(() => {
    if (!orderNumber || paymentMethod === "monopay") return;

    trackPurchase({
      transaction_id: orderNumber,
      value: valueUah,
      currency: "UAH",
      payment_method: getAnalyticsPaymentMethod(paymentMethod),
      payment_status: paymentStatus,
    });
  }, [orderNumber, paymentMethod, valueUah, paymentStatus]);

  return null;
}
