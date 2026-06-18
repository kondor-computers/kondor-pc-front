"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";

/** Fly-to-cart duration, in milliseconds. Callers `setTimeout(add, FLY_DURATION_MS)` to add the item the moment the thumb lands. */
export const FLY_DURATION_MS = 700;
const FLY_DURATION_S = FLY_DURATION_MS / 1000;

interface AddToCartAnimationProps {
  /** Unique key — change it to trigger a fresh fly. */
  animationKey: number;
  /** Viewport-relative starting position (getBoundingClientRect of source button). */
  startPos: { top: number; left: number };
  /** Thumbnail to fly. */
  image: string;
  /** Duration in seconds. */
  duration?: number;
}

export function AddToCartAnimation({
  animationKey,
  startPos,
  image,
  duration = FLY_DURATION_S,
}: AddToCartAnimationProps) {
  const [endPos, setEndPos] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    const target = document.getElementById("cart-button");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setEndPos({
      top: rect.top + rect.height / 2 - 25,
      left: rect.left + rect.width / 2 - 25,
    });
  }, [animationKey]);

  if (!endPos || typeof document === "undefined") return null;

  const node = (
    <motion.div
      key={animationKey}
      className="pointer-events-none fixed z-[100]"
      style={{
        top: startPos.top,
        left: startPos.left,
        width: 60,
        height: 60,
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: 0.2,
        x: endPos.left - startPos.left,
        y: endPos.top - startPos.top,
        opacity: 0.3,
      }}
      transition={{ duration, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md ring-1 ring-white/20 shadow-lg">
        <Image
          src={image}
          alt=""
          fill
          sizes="60px"
          className="object-cover"
        />
      </div>
    </motion.div>
  );

  return createPortal(node, document.body);
}
