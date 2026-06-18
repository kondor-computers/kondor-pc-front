import { formatCartItemOrderTitle } from "@/lib/cart/formatItemSpecification";
import type { CartItem } from "@/lib/cartStore";

import type { MonopayBasket } from "./types";

type BasketDiscount = {
  amountUah: number;
  label: string;
};

export function buildMonopayBasket(
  items: CartItem[],
  discount?: BasketDiscount,
): MonopayBasket {
  const basket: MonopayBasket = items.map((item) => {
    const sum = item.unitPriceUah * 100;
    const total = sum * item.quantity;

    return {
      name: formatCartItemOrderTitle(item),
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

  if (discount && discount.amountUah > 0) {
    const kop = discount.amountUah * 100;
    basket.push({
      name: discount.label,
      qty: 1,
      sum: -kop,
      total: -kop,
      icon: null,
      unit: "шт.",
      code: "promo-discount",
      barcode: null,
      header: null,
      footer: null,
      tax: [],
      uktzed: null,
    });
  }

  return basket;
}
