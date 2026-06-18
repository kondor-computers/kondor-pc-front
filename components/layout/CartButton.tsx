"use client";

import CartIcon from "@/components/icons/CartIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";

/**
 * The wrapping <span> owns the id="cart-button" anchor (used by the fly-to-cart
 * animation) AND the badge. Positioning the badge on the wrapper keeps it
 * outside the Button's `clip-angular-xs` clip-path — otherwise the corner of
 * the badge gets sliced off.
 */
export function CartButton() {
  const { openDrawer, items, hydrated } = useCartStore();
  const count = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <span
      id="cart-button"
      className="relative inline-flex shrink-0 items-center justify-center"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={count > 0 ? `Кошик — ${count}` : "Кошик"}
        onClick={openDrawer}
        className={cn(
          "transition-transform duration-200 ease-out hover:scale-110 active:scale-95",
        )}
      >
        <CartIcon className="size-5 lg:size-[27px]" />
      </Button>
      {count > 0 && (
        <span
          aria-hidden
          className={cn(
            "tabular pointer-events-none absolute -right-1.5 -top-1.5 z-10",
            "flex h-4 min-w-4 items-center justify-center rounded-full px-1",
            "bg-foreground text-[10px] font-bold leading-none text-background",
            "ring-2 ring-background",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
