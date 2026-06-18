"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const compute = () => {
      const threshold = Math.max(480, window.innerHeight * 1.25);
      setVisible(window.scrollY > threshold);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function toTop() {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label="Наверх"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={toTop}
      className={cn(
        // Mobile: lift above the sticky Buy bar (~64–72px) so the chip never
        // overlaps the primary CTA. Desktop keeps standard corner offset.
        "fixed right-4 bottom-[88px] z-40 sm:right-6 sm:bottom-6",
        // Outer layer is the "border" colour. Its clip-path follows the angular
        // shape, so the painted pixels always include the diagonal edge — no
        // gap at the cut corners (unlike a normal `border` which is clipped out).
        // `fixed` above already creates a positioning context for the inset
        // inner layer — don't add `relative`, it would override `fixed`.
        "clip-angular-sm size-11",
        "bg-[color:#373b41]",
        "shadow-[0_10px_24px_-12px_rgba(0,0,0,0.55)]",
        "transition-[opacity,transform] duration-300 ease-out will-change-transform",
        "hover:scale-105 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      {/* Inner fill layer, inset by 1.5px from every edge. Same clip-path, so
          the visible outer colour reads as a uniform 1.5px outline that stays
          present on the two cut diagonals too. */}
      <span
        aria-hidden
        className={cn(
          "clip-angular-sm absolute inset-[1.5px]",
          "bg-surface/95 backdrop-blur-md",
        )}
      />
      <span className="relative z-10 flex size-full items-center justify-center text-foreground">
        <ArrowUp className="size-4" strokeWidth={2} />
      </span>
    </button>
  );
}
