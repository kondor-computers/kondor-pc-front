"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore, lineKey } from "@/lib/cartStore";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import { formatPrice } from "@/lib/format";
import { CartListItem } from "./CartListItem";
import { CartCrossSell } from "./CartCrossSell";

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.3, ease: [0.42, 0, 1, 1] as const },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function CartDrawer() {
  const { isOpen, closeDrawer, items, totalUah } = useCartStore();
  const total = totalUah();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Кошик"
            className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-border bg-background shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.7)] sm:max-w-[420px]"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4" strokeWidth={2} />
                <h2 className="font-display text-lg font-bold uppercase tracking-wider">
                  Кошик
                </h2>
                {count > 0 && (
                  <span className="tabular rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                    {count}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Закрити"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </header>

            {/* Body */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface">
                  <ShoppingBag
                    className="size-6 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <div className="font-display text-lg font-bold">
                    Кошик порожній
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Додай ПК або аксесуар — і повертайся сюди.
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <TechButtonLink href="/pk" size="sm" onClick={closeDrawer}>
                    Ігрові ПК
                  </TechButtonLink>
                  <Link
                    href="/catalog"
                    onClick={closeDrawer}
                    className="text-xs uppercase tracking-wider text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Каталог аксесуарів →
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartListItem
                      key={lineKey({
                        slug: item.slug,
                        options: item.options,
                        colorCode: item.colorCode,
                      })}
                      item={item}
                      onNavigate={closeDrawer}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {/* Cross-sell — appears when cart contains a PC build */}
            {items.length > 0 && <CartCrossSell />}

            {/* Footer */}
            {items.length > 0 && (
              <footer className="space-y-3 border-t border-border bg-surface/40 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    До сплати
                  </span>
                  <span className="tabular font-heading text-2xl font-bold">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Доставка НП · безкоштовно від 1500 ₴
                </div>
                <TechButtonLink
                  href="/oformlennya"
                  size="md"
                  className="w-full h-12"
                  onClick={closeDrawer}
                >
                  Оформити замовлення
                </TechButtonLink>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
