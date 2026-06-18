"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { TechButton } from "@/components/shared/TechButton";
import { useCartStore } from "@/lib/cartStore";
import { useProductConfiguratorOptional } from "@/components/shared/ProductConfigurator";
import {
  AddToCartAnimation,
  FLY_DURATION_MS,
} from "@/components/cart/AddToCartAnimation";
import type { SkuSlug } from "@/types/build";
import { cn } from "@/lib/utils";

export function PurchaseActions({
  slug,
  name,
  priceUah,
  size = "lg",
  className,
}: {
  slug: SkuSlug;
  name: string;
  priceUah: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const { add, openDrawer } = useCartStore();
  const config = useProductConfiguratorOptional();
  const [justAdded, setJustAdded] = useState(false);

  const [animationKey, setAnimationKey] = useState<number | null>(null);
  const [startPos, setStartPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const image = config?.build.heroImageUrl;

  const unitPriceUah = config?.resolvedPriceUah ?? priceUah;
  const options = config?.cartOptions;
  const spec = config?.resolvedSpec;
  const sku = config?.build.sku;

  function triggerFly(e: React.MouseEvent<HTMLButtonElement>) {
    if (!image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setStartPos({
      top: rect.top + rect.height / 2 - 30,
      left: rect.left + rect.width / 2 - 30,
    });
    setAnimationKey(Date.now());
  }

  /**
   * Primary add-to-cart flow:
   *   1. Open the cart drawer immediately (no perceived delay on click).
   *   2. Fly the product thumbnail toward the cart icon anchor.
   *   3. When the thumb lands, commit the item — it appears inside the
   *      already-open drawer, giving the impression of "flying into the cart".
   */
  function addAndStay(e: React.MouseEvent<HTMLButtonElement>) {
    openDrawer();
    triggerFly(e);
    window.setTimeout(() => {
      add({
        itemType: "build",
        slug,
        name,
        priceUah,
        unitPriceUah,
        options,
        spec,
        sku,
        image,
      });
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
    }, FLY_DURATION_MS);
  }

  /** Buy now: no fly (we're leaving the page). Add + navigate synchronously. */
  function buyNow() {
    add({
      itemType: "build",
      slug,
      name,
      priceUah,
      unitPriceUah,
      options,
      spec,
      sku,
      image,
    });
    router.push("/oformlennya");
  }

  return (
    <>
      <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
        <TechButton
          size={size}
          variant="inverse"
          className="flex-1 font-heading  h-[49px] tracking-normal"
          onClick={buyNow}
        >
          Купити зараз
        </TechButton>
        <TechButton
          size={size}
          className="flex-1 font-heading h-[49px] tracking-normal"
          variant="muted"
          onClick={addAndStay}
        >
          {justAdded ? (
            <>
              <Check className="mr-1 size-4" strokeWidth={2.5} />
              Додано в кошик
            </>
          ) : (
            "Додати в кошик"
          )}
        </TechButton>
      </div>
      {animationKey !== null && startPos && image && (
        <AddToCartAnimation
          animationKey={animationKey}
          startPos={startPos}
          image={image}
        />
      )}
    </>
  );
}
