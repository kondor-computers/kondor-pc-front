import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BudgetChipLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** Budget bucket link — same chamfer mask as TechButton, white fill. */
export function BudgetChipLink({
  href,
  children,
  className,
}: BudgetChipLinkProps) {
  return (
    <Link href={href} className={cn("budget-chip", className)}>
      <span aria-hidden className="budget-chip__edge" />
      <span aria-hidden className="budget-chip__fill" />
      <span className="relative">{children}</span>
    </Link>
  );
}
