"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildCatalogPhotoUrls } from "@/lib/catalog/photoUrls";
import type { CatalogPhotoSet } from "@/lib/catalog/photoUrls";
import type { CatalogProductDetail, ColorVariant } from "@/types/catalog";

type CatalogDetailContextValue = {
  item: CatalogProductDetail;
  variants: ColorVariant[];
  variantIdx: number;
  photoIdx: number;
  setPhotoIdx: (idx: number) => void;
  setVariant: (idx: number) => void;
  photoUrls: (CatalogPhotoSet | null)[];
  activePhoto: CatalogPhotoSet | null | undefined;
  thumbUrl: string | undefined;
  finalPrice: number;
  hasDiscount: boolean;
  discountPct: number;
  badgeAccent: string | undefined;
  activeVariant: ColorVariant | undefined;
};

const CatalogDetailContext = createContext<CatalogDetailContextValue | null>(
  null,
);

function UrlColorSync({
  variants,
  onSync,
}: {
  variants: ColorVariant[];
  onSync: (idx: number) => void;
}) {
  const searchParams = useSearchParams();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    const color = searchParams.get("color");
    if (!color) return;
    const idx = variants.findIndex(
      (v) => v.color.toLowerCase() === color.toLowerCase(),
    );
    if (idx >= 0) onSync(idx);
  }, [variants, searchParams, onSync]);

  return null;
}

export function CatalogDetailProvider({
  item,
  children,
}: {
  item: CatalogProductDetail;
  children: ReactNode;
}) {
  const router = useRouter();
  const variants = item.coloropts || [];
  const [variantIdx, setVariantIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  const syncColorFromUrl = useCallback((idx: number) => {
    setVariantIdx(idx);
    setPhotoIdx(0);
  }, []);

  const activeVariant = variants[variantIdx];
  const photos = useMemo(
    () => activeVariant?.photos ?? [],
    [activeVariant],
  );

  const photoUrls = useMemo(
    () => buildCatalogPhotoUrls(photos),
    [photos],
  );

  const hasDiscount =
    typeof item.priceDiscount === "number" && item.priceDiscount < item.price;
  const finalPrice = hasDiscount ? item.priceDiscount! : item.price;
  const discountPct = hasDiscount
    ? Math.round(((item.price - item.priceDiscount!) / item.price) * 100)
    : 0;

  const thumbUrl = photoUrls[photoIdx]?.thumb;
  const activePhoto = photoUrls[photoIdx];
  const badgeAccent = item.badge?.hex || activeVariant?.hex || undefined;

  const setVariant = useCallback(
    (idx: number) => {
      setVariantIdx(idx);
      setPhotoIdx(0);
      const color = variants[idx]?.color;
      const url = new URL(window.location.href);
      if (color) url.searchParams.set("color", color);
      else url.searchParams.delete("color");
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router, variants],
  );

  const value = useMemo<CatalogDetailContextValue>(
    () => ({
      item,
      variants,
      variantIdx,
      photoIdx,
      setPhotoIdx,
      setVariant,
      photoUrls,
      activePhoto,
      thumbUrl,
      finalPrice,
      hasDiscount,
      discountPct,
      badgeAccent,
      activeVariant,
    }),
    [
      item,
      variants,
      variantIdx,
      photoIdx,
      setVariant,
      photoUrls,
      activePhoto,
      thumbUrl,
      finalPrice,
      hasDiscount,
      discountPct,
      badgeAccent,
      activeVariant,
    ],
  );

  return (
    <CatalogDetailContext.Provider value={value}>
      <Suspense fallback={null}>
        <UrlColorSync variants={variants} onSync={syncColorFromUrl} />
      </Suspense>
      {children}
    </CatalogDetailContext.Provider>
  );
}

export function useCatalogDetail(): CatalogDetailContextValue {
  const ctx = useContext(CatalogDetailContext);
  if (!ctx) {
    throw new Error(
      "useCatalogDetail must be used within <CatalogDetailProvider>",
    );
  }
  return ctx;
}
