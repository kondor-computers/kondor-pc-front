import { describe, expect, it } from "vitest";

import type { CartItem } from "@/lib/cartStore";
import {
  buildMonopayBasket,
  sumMonopayBasketKop,
} from "@/lib/monopay/basket";

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
