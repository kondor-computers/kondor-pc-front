import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAnalyticsPaymentMethod,
  getCheckoutPaymentStatus,
  trackPurchase,
  type PurchaseEventParams,
} from "@/lib/analytics/purchase";
import type { CartItem } from "@/lib/cartStore";
import {
  buildMonopayBasket,
  sumMonopayBasketKop,
} from "@/lib/monopay/basket";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/validations/order";

const REQUIRED_PURCHASE_KEYS = [
  "event",
  "transaction_id",
  "value",
  "currency",
  "payment_method",
  "payment_status",
] as const;

function buildCheckoutAnalyticsPayload(
  method: PaymentMethod,
  orderNumber: string,
  payableTotal: number,
): PurchaseEventParams {
  return {
    transaction_id: orderNumber,
    value: payableTotal,
    currency: "UAH",
    payment_method: getAnalyticsPaymentMethod(method),
    payment_status: getCheckoutPaymentStatus(method),
  };
}

function assertCompletePurchasePayload(payload: Record<string, unknown>) {
  for (const key of REQUIRED_PURCHASE_KEYS) {
    expect(payload).toHaveProperty(key);
    expect(payload[key]).toBeDefined();
  }
  expect(payload.event).toBe("purchase");
  expect(payload.currency).toBe("UAH");
  expect(typeof payload.transaction_id).toBe("string");
  expect(typeof payload.value).toBe("number");
  expect(typeof payload.payment_method).toBe("string");
  expect(["paid", "pending", "unpaid"]).toContain(payload.payment_status);
}

const sampleBuild: CartItem = {
  itemType: "build",
  slug: "lunara",
  sku: "LUN-001",
  name: "LUNARA",
  priceUah: 50550,
  unitPriceUah: 50550,
  quantity: 1,
  spec: {
    cpu: "AMD Ryzen 5 7500F",
    gpu: "NVIDIA GeForce RTX 5060",
    gpuVram: "8 GB",
    ram: "16 GB DDR5 (1×16 GB)",
    ramSpeed: "6000",
    storage: "500 GB NVMe M.2 TLC",
  },
};

function buildTestInvoicePayload(cartTotal: number, promoDiscount = 0) {
  const payableTotal = cartTotal - promoDiscount;
  const payTotalUah = Math.round(payableTotal * 1.013);
  const commissionUah = payTotalUah - payableTotal;

  const basketOrder = buildMonopayBasket([{ ...sampleBuild, unitPriceUah: cartTotal }], {
    discount:
      promoDiscount > 0
        ? {
            amountUah: promoDiscount,
            label: "Знижка (TEST10)",
            code: "promo-discount",
          }
        : undefined,
    commissionUah,
  });

  return {
    amount: payTotalUah * 100,
    orderNumber: "UA-TEST-0001",
    orderValueUah: payableTotal,
    basketOrder,
    payTotalUah,
    commissionUah,
    payableTotal,
  };
}

describe("MonoPay basket for test order", () => {
  it("matches invoice amount with 1.3% commission", () => {
    const payload = buildTestInvoicePayload(50550);

    expect(payload.commissionUah).toBe(657);
    expect(payload.payTotalUah).toBe(51207);
    expect(sumMonopayBasketKop(payload.basketOrder)).toBe(payload.amount);
  });

  it("matches invoice amount with promo discount", () => {
    const payload = buildTestInvoicePayload(50550, 5000);

    expect(payload.payableTotal).toBe(45550);
    expect(sumMonopayBasketKop(payload.basketOrder)).toBe(payload.amount);
    expect(payload.orderValueUah).toBe(45550);
  });

  it("truncates long product names for MonoPay", () => {
    const longNameBuild: CartItem = {
      ...sampleBuild,
      name: "X".repeat(300),
    };
    const basket = buildMonopayBasket([longNameBuild], { commissionUah: 100 });
    expect(basket[0].name.length).toBeLessThanOrEqual(256);
  });
});

describe("purchase analytics", () => {
  beforeEach(() => {
    vi.stubGlobal("dataLayer", []);
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
    vi.stubGlobal("window", { dataLayer: [] as Record<string, unknown>[] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pending only for card (monopay)", () => {
    expect(getCheckoutPaymentStatus("monopay")).toBe("pending");
    expect(getCheckoutPaymentStatus("cod")).toBe("unpaid");
    expect(getCheckoutPaymentStatus("installment")).toBe("unpaid");
    expect(getCheckoutPaymentStatus("iban_individual")).toBe("unpaid");
    expect(getCheckoutPaymentStatus("crypto")).toBe("unpaid");
  });

  it("maps payment methods for analytics", () => {
    expect(getAnalyticsPaymentMethod("monopay")).toBe("card");
    expect(getAnalyticsPaymentMethod("cod")).toBe("cash_on_delivery");
    expect(getAnalyticsPaymentMethod("installment")).toBe("installment");
  });

  it("pushes purchase event to dataLayer", () => {
    trackPurchase({
      transaction_id: "UA-TEST-0001",
      value: 50550,
      currency: "UAH",
      payment_method: "card",
      payment_status: "pending",
    });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0]).toMatchObject({
      event: "purchase",
      transaction_id: "UA-TEST-0001",
      value: 50550,
      currency: "UAH",
      payment_method: "card",
      payment_status: "pending",
    });
  });

  it("dedupes same transaction_id + payment_status", () => {
    const params = {
      transaction_id: "UA-TEST-0001",
      value: 0,
      currency: "UAH" as const,
      payment_method: "card",
      payment_status: "pending" as const,
    };

    trackPurchase(params);
    trackPurchase(params);

    expect(window.dataLayer).toHaveLength(1);
  });

  it("allows pending and paid for same order", () => {
    const base = {
      transaction_id: "UA-TEST-0001",
      value: 50550,
      currency: "UAH" as const,
      payment_method: "card",
    };

    trackPurchase({ ...base, payment_status: "pending" });
    trackPurchase({ ...base, payment_status: "paid" });

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer![0]).toMatchObject({ payment_status: "pending" });
    expect(window.dataLayer![1]).toMatchObject({ payment_status: "paid" });
  });

  it("sends all required fields for every payment method at checkout", () => {
    const payableTotal = 103000;

    PAYMENT_METHODS.forEach((method, index) => {
      const orderNumber = `UA-250819-${1000 + index}`;
      const params = buildCheckoutAnalyticsPayload(
        method,
        orderNumber,
        payableTotal,
      );

      trackPurchase(params);
      const pushed = window.dataLayer!.at(-1)!;
      assertCompletePurchasePayload(pushed);

      if (method === "monopay") {
        expect(pushed.payment_method).toBe("card");
        expect(pushed.payment_status).toBe("pending");
      } else {
        expect(pushed.payment_status).toBe("unpaid");
      }
    });

    expect(window.dataLayer).toHaveLength(PAYMENT_METHODS.length);
  });

  it("sends value 0 when order total is zero", () => {
    trackPurchase({
      transaction_id: "UA-ZERO-0001",
      value: 0,
      currency: "UAH",
      payment_method: "card",
      payment_status: "pending",
    });

    expect(window.dataLayer![0]).toMatchObject({
      event: "purchase",
      value: 0,
      payment_status: "pending",
    });
  });

  it("matches expected payloads for key checkout scenarios", () => {
    const payableTotal = 50550;

    const scenarios: Array<{
      method: PaymentMethod;
      orderNumber: string;
      expected: Record<string, unknown>;
    }> = [
      {
        method: "monopay",
        orderNumber: "UA-250819-1001",
        expected: {
          event: "purchase",
          transaction_id: "UA-250819-1001",
          value: payableTotal,
          currency: "UAH",
          payment_method: "card",
          payment_status: "pending",
        },
      },
      {
        method: "cod",
        orderNumber: "UA-250819-1002",
        expected: {
          event: "purchase",
          transaction_id: "UA-250819-1002",
          value: payableTotal,
          currency: "UAH",
          payment_method: "cash_on_delivery",
          payment_status: "unpaid",
        },
      },
      {
        method: "installment",
        orderNumber: "UA-250819-1003",
        expected: {
          event: "purchase",
          transaction_id: "UA-250819-1003",
          value: payableTotal,
          currency: "UAH",
          payment_method: "installment",
          payment_status: "unpaid",
        },
      },
      {
        method: "iban_individual",
        orderNumber: "UA-250819-1004",
        expected: {
          event: "purchase",
          transaction_id: "UA-250819-1004",
          value: payableTotal,
          currency: "UAH",
          payment_method: "iban",
          payment_status: "unpaid",
        },
      },
    ];

    for (const { method, orderNumber, expected } of scenarios) {
      trackPurchase(
        buildCheckoutAnalyticsPayload(method, orderNumber, payableTotal),
      );
      expect(window.dataLayer!.at(-1)).toEqual(expected);
    }
  });

  it("sends paid event after successful monopay status check", () => {
    trackPurchase({
      transaction_id: "UA-250819-5678",
      value: 50550,
      currency: "UAH",
      payment_method: "card",
      payment_status: "paid",
    });

    expect(window.dataLayer![0]).toEqual({
      event: "purchase",
      transaction_id: "UA-250819-5678",
      value: 50550,
      currency: "UAH",
      payment_method: "card",
      payment_status: "paid",
    });
  });
});
