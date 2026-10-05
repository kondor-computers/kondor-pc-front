"use client";

import { useEffect } from "react";

import { trackViewItem, type AnalyticsSource } from "@/lib/analytics/ecommerce";

export function ViewItemTracker({ item }: { item: AnalyticsSource }) {
  const { slug, sku, name, unitPriceUah, priceUah, colorCode } = item;

  useEffect(() => {
    trackViewItem({ slug, sku, name, unitPriceUah, priceUah, colorCode });
  }, [slug, sku, name, unitPriceUah, priceUah, colorCode]);

  return null;
}
