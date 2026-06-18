const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""),
    "",
  );

/** Lookup a promo code by exact `code` (uppercase in Sanity). */
export const PROMO_CODE_BY_CODE = groq`
*[_type=="promoCode" && code==$code][0]{
  code,
  validFrom,
  validUntil,
  "discountPc": discountPc{kind, value},
  "discountAccessories": discountAccessories{kind, value}
}`;
