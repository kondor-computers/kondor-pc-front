"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades + slides children in when they enter the viewport.
 * Uses native IntersectionObserver — no animation library.
 * Automatically respects `prefers-reduced-motion` via CSS.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag
      // @ts-expect-error polymorphic ref — React allows this
      ref={ref}
      className={cn("reveal-init", visible && "reveal-show", className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
