"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TechButton } from "@/components/shared/TechButton";
import {
  AddToCartAnimation,
  FLY_DURATION_MS,
} from "@/components/cart/AddToCartAnimation";
import { useCartStore } from "@/lib/cartStore";
import type { CatalogProductListItem } from "@/types/catalog";

/**
 * Small client "island" for the otherwise server-rendered `CatalogCardStatic`.
 * Keeps the listing mostly JS-free while still letting "Купити" add the
 * item straight to the cart (single variant — no swatch picking here).
 */
export function CatalogCardBuyButton({
  variant,
  finalPrice,
  thumbUrl,
  className,
}: {
  variant: CatalogProductListItem;
  finalPrice: number;
  thumbUrl?: string;
  className?: string;
}) {
  const { add, openDrawer } = useCartStore();
  const [animationKey, setAnimationKey] = useState<number | null>(null);
  const [startPos, setStartPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    openDrawer();

    if (thumbUrl) {
      const rect = e.currentTarget.getBoundingClientRect();
      setStartPos({
        top: rect.top + rect.height / 2 - 30,
        left: rect.left + rect.width / 2 - 30,
      });
      setAnimationKey(Date.now());
    }
    window.setTimeout(() => {
      add({
        itemType: "accessory",
        slug: variant.slug,
        name: variant.name,
        priceUah: variant.price,
        unitPriceUah: finalPrice,
        image: thumbUrl,
      });
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
    }, FLY_DURATION_MS);
  }

  return (
    <>
      <TechButton
        size="sm"
        variant="inverse"
        className={className}
        onClick={handleAdd}
        disabled={justAdded}
      >
        {justAdded ? (
          <>
            <Check className="mr-1 size-3.5" strokeWidth={2.5} />
            Додано
          </>
        ) : variant.preorder ? (
          "Передзамовити"
        ) : (
          "Купити"
        )}
      </TechButton>

      {animationKey !== null && startPos && thumbUrl && (
        <AddToCartAnimation
          animationKey={animationKey}
          startPos={startPos}
          image={thumbUrl}
        />
      )}
    </>
  );
}
