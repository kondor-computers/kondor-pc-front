import { cn } from "@/lib/utils";

/**
 * Temporary typographic wordmark. Swap for brand logo SVG when received.
 */
export function Wordmark({
  className,
  size = "md",
  showDot = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showDot?: boolean;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl md:text-4xl",
  };

  return (
    <span
      className={cn(
        "font-wide font-bold uppercase tracking-[0.12em] text-foreground",
        "inline-flex items-baseline gap-[0.15em] select-none",
        sizes[size],
        className,
      )}
      aria-label="Kondor PC"
    >
      <span>Kondor</span>
      {showDot && (
        <span
          aria-hidden
          className="inline-block size-[0.25em] rounded-full bg-foreground translate-y-[-0.15em]"
        />
      )}
      <span className="text-muted-foreground">PC</span>
    </span>
  );
}
