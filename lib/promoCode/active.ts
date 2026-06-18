import type { PromoCode, PromoDiscount } from "./types";
import { formatUah } from "@/lib/format";

export function normalizePromoCodeInput(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isPromoActive(
  promo: Pick<PromoCode, "validFrom" | "validUntil">,
  now = Date.now(),
): boolean {
  if (promo.validFrom && new Date(promo.validFrom).getTime() > now) {
    return false;
  }
  if (promo.validUntil && new Date(promo.validUntil).getTime() <= now) {
    return false;
  }
  return true;
}

export function promoInactiveMessage(
  promo: Pick<PromoCode, "validFrom" | "validUntil">,
  now = Date.now(),
): string | null {
  if (promo.validFrom && new Date(promo.validFrom).getTime() > now) {
    return "Промокод ще не активний";
  }
  if (promo.validUntil && new Date(promo.validUntil).getTime() <= now) {
    return "Промокод більше не діє";
  }
  return null;
}

export function formatPromoDiscount(discount?: PromoDiscount): string | null {
  if (!discount?.value) return null;
  return discount.kind === "fixed"
    ? `−${formatUah(discount.value)} ₴`
    : `−${discount.value}%`;
}
