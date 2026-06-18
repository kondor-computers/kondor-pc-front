import type {
  PromoApplication,
  PromoCartLine,
  PromoCode,
  PromoDiscount,
} from "./types";

function lineSubtotal(item: PromoCartLine): number {
  return item.unitPriceUah * item.quantity;
}

function categorySubtotal(
  items: PromoCartLine[],
  itemType: PromoCartLine["itemType"],
): number {
  return items
    .filter((i) => i.itemType === itemType)
    .reduce((sum, i) => sum + lineSubtotal(i), 0);
}

/** Discount for a category subtotal; capped so total never goes below zero. */
export function discountForSubtotal(
  subtotalUah: number,
  discount: PromoDiscount,
): number {
  if (subtotalUah <= 0 || !discount.value) return 0;

  const raw =
    discount.kind === "percent"
      ? Math.round((subtotalUah * discount.value) / 100)
      : Math.round(discount.value);

  return Math.min(Math.max(raw, 0), subtotalUah);
}

export function calculatePromoApplication(
  items: PromoCartLine[],
  promo: PromoCode,
): PromoApplication {
  const pcSubtotalUah = categorySubtotal(items, "build");
  const accessoriesSubtotalUah = categorySubtotal(items, "accessory");
  const subtotalUah = pcSubtotalUah + accessoriesSubtotalUah;

  const pcDiscountUah = discountForSubtotal(
    pcSubtotalUah,
    promo.discountPc,
  );
  const accessoriesDiscountUah = discountForSubtotal(
    accessoriesSubtotalUah,
    promo.discountAccessories,
  );
  const discountUah = pcDiscountUah + accessoriesDiscountUah;

  return {
    promo,
    subtotalUah,
    discountUah,
    totalUah: Math.max(subtotalUah - discountUah, 0),
    pcSubtotalUah,
    accessoriesSubtotalUah,
    pcDiscountUah,
    accessoriesDiscountUah,
  };
}
