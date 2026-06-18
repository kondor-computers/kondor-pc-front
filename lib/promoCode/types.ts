export type PromoDiscountKind = "percent" | "fixed";

export type PromoDiscount = {
  kind: PromoDiscountKind;
  value: number;
};

/** Sanity `promoCode` document — fields used at checkout. */
export type PromoCode = {
  code: string;
  discountPc: PromoDiscount;
  discountAccessories: PromoDiscount;
  validFrom?: string;
  validUntil: string;
};

export type PromoCartLine = {
  itemType: "build" | "accessory";
  unitPriceUah: number;
  quantity: number;
};

export type PromoApplication = {
  promo: PromoCode;
  subtotalUah: number;
  discountUah: number;
  totalUah: number;
  pcSubtotalUah: number;
  accessoriesSubtotalUah: number;
  pcDiscountUah: number;
  accessoriesDiscountUah: number;
};
