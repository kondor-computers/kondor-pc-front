/**
 * Per-SKU accent colors — sourced from Instagram chassis RGB lighting.
 * Used as CSS custom property `--sku` at card/section scope.
 * When Sanity is wired, `build.accentColor` overrides these.
 */
export const SKU_ACCENTS = {
  vega: "var(--sku-vega)",
  hyper: "var(--sku-hyper)",
  nebula: "var(--sku-nebula)",
  orbitra: "var(--sku-orbitra)",
  nyx: "var(--sku-nyx)",
  velar: "var(--sku-velar)",
  pulsar: "var(--sku-pulsar)",
  comet: "var(--sku-comet)",
} as const;

export type SkuSlug = keyof typeof SKU_ACCENTS;

export function skuStyle(slug: SkuSlug): React.CSSProperties {
  return { ["--sku" as string]: SKU_ACCENTS[slug] };
}
