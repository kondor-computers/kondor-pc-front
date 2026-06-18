"use client";

import dynamic from "next/dynamic";
import { CatalogPurchaseSkeleton } from "./CatalogPurchaseSkeleton";

const CatalogPurchasePanel = dynamic(
  () =>
    import("./CatalogPurchasePanel").then((m) => ({
      default: m.CatalogPurchasePanel,
    })),
  { ssr: false, loading: () => <CatalogPurchaseSkeleton /> },
);

export function LazyCatalogPurchasePanel() {
  return <CatalogPurchasePanel />;
}
