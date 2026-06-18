"use client";

import dynamic from "next/dynamic";

const CatalogGalleryOverlay = dynamic(
  () =>
    import("./CatalogGalleryOverlay").then((m) => ({
      default: m.CatalogGalleryOverlay,
    })),
  { ssr: false },
);

export function LazyCatalogGalleryOverlay() {
  return <CatalogGalleryOverlay />;
}
