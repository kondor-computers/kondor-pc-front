import type { PromoCode } from "@/lib/promoCode/types";
import { normalizePromoCodeInput } from "@/lib/promoCode/active";
import { contentClient } from "@/lib/sanity/contentClient";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { PROMO_CODE_BY_CODE } from "@/lib/sanity/promoCodeQueries";

export async function fetchPromoCodeByCode(
  rawCode: string,
): Promise<PromoCode | null> {
  const code = normalizePromoCodeInput(rawCode);
  if (!code) return null;

  const doc = await contentClient.fetch<PromoCode | null>(
    PROMO_CODE_BY_CODE,
    { code },
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["promo-codes", `promo-code:${code}`],
      },
    },
  );

  if (
    !doc?.code ||
    !doc.discountPc?.value ||
    !doc.discountAccessories?.value ||
    !doc.validUntil
  ) {
    return null;
  }

  return doc;
}
