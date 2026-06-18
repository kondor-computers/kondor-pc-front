"use client";

import dynamic from "next/dynamic";
import type { SkuSlug } from "@/lib/sku-accents";

const StickyMobileBuyBar = dynamic(
  () =>
    import("@/components/shared/StickyMobileBuyBar").then((m) => ({
      default: m.StickyMobileBuyBar,
    })),
  { ssr: false },
);

export function LazyStickyBuyBar(props: {
  name: string;
  slug: SkuSlug;
  priceUah: number;
  image?: string;
}) {
  return <StickyMobileBuyBar {...props} />;
}
