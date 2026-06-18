"use client";

import dynamic from "next/dynamic";

const ProductGallery = dynamic(
  () =>
    import("@/components/shared/ProductGallery").then((m) => ({
      default: m.ProductGallery,
    })),
  { ssr: false },
);

export function LazyProductGallery(
  props: React.ComponentProps<typeof ProductGallery>,
) {
  return <ProductGallery {...props} />;
}
