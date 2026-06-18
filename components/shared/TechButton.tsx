"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import {
  type TechButtonBaseProps,
  type TechButtonVariant,
} from "@/components/shared/TechButtonPrimitives";

export type { TechButtonVariant };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span aria-hidden className="tech-btn__edge" />
      <span aria-hidden className="tech-btn__fill" />
      <span className="relative">{children}</span>
    </>
  );
}

/**
 * Angular / tactical CTA. Accent color is tunable via `accent` prop or the
 * `--sku` / `--tech-accent` CSS variables in the surrounding scope.
 */
export const TechButton = forwardRef<
  HTMLButtonElement,
  TechButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function TechButton(
  {
    size = "md",
    variant = "primary",
    accent,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      data-size={size}
      data-variant={variant}
      className={cn("tech-btn font-display", className)}
      style={accent ? { ...style, ["--tech-accent" as string]: accent } : style}
      {...rest}
    >
      <Frame>{children}</Frame>
    </button>
  );
});
