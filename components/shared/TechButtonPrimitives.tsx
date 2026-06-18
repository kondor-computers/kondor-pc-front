import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

/** primary — cyan fill / black text → hover black fill / cyan text (border stays cyan) */
/** inverse — default and hover swapped vs primary */
/** swap — black fill / cyan text → hover cyan fill / black text (edge swaps too) */
/** white — white fill / black text → hover black fill / white text (border stays white) */
/** muted — black fill / semi-transparent white text & border → hover white fill / black text */
export type TechButtonVariant =
  | "primary"
  | "inverse"
  | "swap"
  | "white"
  | "muted";

export interface TechButtonBaseProps {
  size?: Size;
  variant?: TechButtonVariant;
  /** CSS color for the edge (border). Defaults to brand-primary per variant. */
  accent?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <>
      <span aria-hidden className="tech-btn__edge" />
      <span aria-hidden className="tech-btn__fill" />
      <span className="relative">{children}</span>
    </>
  );
}

/**
 * Same look, but renders as a <span> — for use inside another interactive
 * parent (e.g. a `<Link>` wrapping the whole card). Avoids nested-button HTML
 * and lets the parent Link own the click target.
 */
export function TechButtonDisplay({
  size = "md",
  variant = "primary",
  accent,
  className,
  children,
  style,
}: TechButtonBaseProps) {
  return (
    <span
      data-size={size}
      data-variant={variant}
      className={cn("tech-btn font-display", className)}
      style={accent ? { ...style, ["--tech-accent" as string]: accent } : style}
      aria-hidden
    >
      <Frame>{children}</Frame>
    </span>
  );
}

/** Same look, but renders as a Next.js Link — for navigation CTAs. */
export function TechButtonLink({
  href,
  size = "md",
  variant = "primary",
  accent,
  className,
  children,
  target,
  rel,
  style,
  onClick,
}: TechButtonBaseProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      className={cn("tech-btn font-display", className)}
      style={accent ? { ...style, ["--tech-accent" as string]: accent } : style}
    >
      <Frame>{children}</Frame>
    </Link>
  );
}
