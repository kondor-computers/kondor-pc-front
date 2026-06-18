"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Download, Info } from "lucide-react";
import { TechButton } from "@/components/shared/TechButton";
import {
  AddToCartAnimation,
  FLY_DURATION_MS,
} from "@/components/cart/AddToCartAnimation";
import { useCartStore } from "@/lib/cartStore";
import { cn } from "@/lib/utils";
import { useCatalogDetail } from "./CatalogDetailProvider";

export function CatalogPurchasePanel() {
  const router = useRouter();
  const { add, openDrawer } = useCartStore();
  const {
    item,
    variants,
    variantIdx,
    setVariant,
    thumbUrl,
    activeVariant,
  } = useCatalogDetail();

  const hasDiscount =
    typeof item.priceDiscount === "number" && item.priceDiscount < item.price;
  const finalPrice = hasDiscount ? item.priceDiscount! : item.price;

  const [animationKey, setAnimationKey] = useState<number | null>(null);
  const [startPos, setStartPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  function triggerFly(e: React.MouseEvent<HTMLButtonElement>) {
    if (!thumbUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setStartPos({
      top: rect.top + rect.height / 2 - 30,
      left: rect.left + rect.width / 2 - 30,
    });
    setAnimationKey(Date.now());
  }

  function addToCart(e: React.MouseEvent<HTMLButtonElement>) {
    openDrawer();
    triggerFly(e);
    window.setTimeout(() => {
      add({
        itemType: "accessory",
        slug: item.slug,
        name: item.name,
        priceUah: item.price,
        unitPriceUah: finalPrice,
        image: thumbUrl,
        colorCode: activeVariant?.code,
        colorName: activeVariant?.color,
      });
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
    }, FLY_DURATION_MS);
  }

  function buyNow() {
    add({
      itemType: "accessory",
      slug: item.slug,
      name: item.name,
      priceUah: item.price,
      unitPriceUah: finalPrice,
      image: thumbUrl,
      colorCode: activeVariant?.code,
      colorName: activeVariant?.color,
    });
    router.push("/oformlennya");
  }

  return (
    <>
      <div className="mt-5 flex flex-col gap-5">
        {variants.length > 0 && (
          <div className="rounded-md border border-border bg-surface/60 p-4">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Колір ·{" "}
              <span className="text-foreground">{activeVariant?.color}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {variants.map((v, i) => {
                const active = i === variantIdx;
                return (
                  <button
                    key={(v.code ?? "") + i}
                    type="button"
                    onClick={() => setVariant(i)}
                    aria-label={v.color}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full border px-2 py-1 transition",
                      active
                        ? "border-foreground bg-surface-elevated"
                        : "border-border hover:border-white/25",
                    )}
                  >
                    <span
                      className="size-4 rounded-full ring-1 ring-white/20"
                      style={{ background: v.hex || "#999" }}
                    />
                    <span className="text-[11px] font-medium">{v.color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {item.preorder && (
          <div className="flex gap-2 rounded-md border border-border bg-surface/60 p-3 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 text-foreground" />
            <div>
              <span className="font-medium text-foreground">Передзамовлення</span>
              {item.preordertext ? ` · ${item.preordertext}` : null}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <TechButton
            size="lg"
            className="flex-1"
            onClick={buyNow}
            variant="inverse"
          >
            Купити зараз
          </TechButton>
          <TechButton
            size="lg"
            variant="muted"
            className="flex-1"
            onClick={addToCart}
          >
            {justAdded ? (
              <>
                <Check className="mr-1 size-4" strokeWidth={2.5} />
                Додано
              </>
            ) : (
              "Додати в кошик"
            )}
          </TechButton>
        </div>

        {(item.manual || item.driver) && (
          <div className="flex flex-wrap gap-2">
            {item.manual && (
              <a
                href={item.manual}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition hover:border-white/25 hover:text-foreground"
              >
                <FileText className="size-3.5" />
                Інструкція
              </a>
            )}
            {item.driver && (
              <a
                href={item.driver}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition hover:border-white/25 hover:text-foreground"
              >
                <Download className="size-3.5" />
                Драйвер
              </a>
            )}
          </div>
        )}
      </div>

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
