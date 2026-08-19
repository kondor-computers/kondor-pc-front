import { formatCartItemOrderTitle } from "@/lib/cart/formatItemSpecification";
import type { CartItem } from "@/lib/cartStore";

import type { MonopayBasket, MonopayBasketItem } from "./types";

/** Обмеження MonoPay / ПРРО на довжину назви позиції. */
const MAX_ITEM_NAME_LENGTH = 256;

type BasketAdjustment = {
  amountUah: number;
  label: string;
  code: string;
};

export type BuildMonopayBasketOptions = {
  discount?: BasketAdjustment;
  commissionUah?: number;
};

function truncateItemName(name: string): string {
  if (name.length <= MAX_ITEM_NAME_LENGTH) return name;
  return `${name.slice(0, MAX_ITEM_NAME_LENGTH - 1)}…`;
}

function buildAdjustmentLine(adjustment: BasketAdjustment): MonopayBasketItem {
  const kop = adjustment.amountUah * 100;
  return {
    name: truncateItemName(adjustment.label),
    qty: 1,
    sum: kop,
    total: kop,
    icon: null,
    unit: "шт.",
    code: adjustment.code,
    barcode: null,
    header: null,
    footer: null,
    tax: [],
    uktzed: null,
  };
}

export function sumMonopayBasketKop(basket: MonopayBasket): number {
  return basket.reduce((sum, item) => sum + item.total, 0);
}

export function buildMonopayBasket(
  items: CartItem[],
  options?: BuildMonopayBasketOptions,
): MonopayBasket {
  const basket: MonopayBasket = items.map((item) => {
    const sum = item.unitPriceUah * 100;
    const total = sum * item.quantity;

    return {
      name: truncateItemName(formatCartItemOrderTitle(item)),
      qty: item.quantity,
      sum,
      total,
      icon: null,
      unit: "шт.",
      code: item.slug,
      barcode: null,
      header: null,
      footer: null,
      tax: [],
      uktzed: null,
    };
  });

  const discount = options?.discount;
  if (discount && discount.amountUah > 0) {
    basket.push(
      buildAdjustmentLine({
        ...discount,
        amountUah: -discount.amountUah,
      }),
    );
  }

  const commissionUah = options?.commissionUah ?? 0;
  if (commissionUah > 0) {
    basket.push(
      buildAdjustmentLine({
        amountUah: commissionUah,
        label: "Комісія MonoPay (1,3%)",
        code: "monopay-fee",
      }),
    );
  }

  return basket;
}
