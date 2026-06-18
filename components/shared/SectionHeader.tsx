import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "start",
  titleAs = "h2",
  showKickerDot = true,
  className,
  kickerClassName,
  titleClassName,
  subtitleClassName,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "start" | "center";
  titleAs?: "h1" | "h2";
  showKickerDot?: boolean;
  className?: string;
  kickerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker && (
        <div
          className={cn(
            "text-[8px] lg:text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground",
            kickerClassName,
          )}
        >
          {kicker}
          {showKickerDot && (
            <span className="inline-block ml-3 lg:ml-5.5 size-2 lg:size-3 rounded-full bg-brand-primary" />
          )}
        </div>
      )}
      {titleAs === "h1" ? (
        <h1
          className={cn(
            "font-display text-[24px] font-bold lg:text-[48px] leading-[120%]",
            titleClassName,
          )}
        >
          {title}
        </h1>
      ) : (
        <h2
          className={cn(
            "font-display text-[24px] font-bold lg:text-[48px] leading-[120%]",
            titleClassName,
          )}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-muted-foreground text-[14px] lg:text-[16px] leading-[120%]",
            align === "center" && "mx-auto",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
