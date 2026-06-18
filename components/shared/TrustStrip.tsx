import { cn } from "@/lib/utils";
import { TRUST_SIGNALS } from "@/lib/mock/trust";

export function TrustStrip({
  className,
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "grid";
}) {
  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5",
          className,
        )}
      >
        {TRUST_SIGNALS.map((s) => (
          <div
            key={s.key}
            className="rounded-md border border-border bg-surface px-4 py-3"
          >
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] uppercase tracking-wider",
        className,
      )}
    >
      {TRUST_SIGNALS.slice(0, 4).map((s, i) => (
        <span key={s.key} className="flex items-center gap-2">
          <span className="font-semibold">{s.value}</span>
          <span className="text-brand-primary">{s.label}</span>
          {i < 3 && (
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
