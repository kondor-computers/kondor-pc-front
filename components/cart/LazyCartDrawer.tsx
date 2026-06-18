"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cartStore";

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);

/**
 * Defers framer-motion + cart drawer UI until the user opens the cart or
 * hovers/focuses the cart button — keeps initial JS off the critical path.
 */
export function LazyCartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldLoad(true);
  }, [isOpen]);

  useEffect(() => {
    const el = document.getElementById("cart-button");
    if (!el) return;

    const preload = () => setShouldLoad(true);
    el.addEventListener("mouseenter", preload, { once: true });
    el.addEventListener("focusin", preload, { once: true });

    return () => {
      el.removeEventListener("mouseenter", preload);
      el.removeEventListener("focusin", preload);
    };
  }, []);

  if (!shouldLoad) return null;
  return <CartDrawer />;
}
