import { cn } from "@/lib/utils";
import { Cpu, Gpu, MemoryStick, HardDrive } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SpecKey = "cpu" | "gpu" | "ram" | "storage";

const ICONS: Record<SpecKey, LucideIcon> = {
  cpu: Cpu,
  gpu: Gpu,
  ram: MemoryStick,
  storage: HardDrive,
};

const LABELS: Record<SpecKey, string> = {
  cpu: "Процесор",
  gpu: "Відеокарта",
  ram: "ОЗП",
  storage: "Накопичувач",
};

export interface SpecRow {
  key: SpecKey;
  value: string;
  note?: string;
}

/**
 * Kondor's signature card-pill — the 2×2 spec block seen on every IG tile.
 * 4 specs, tabular numbers, subtle accent bg from current --sku scope.
 */
export function SpecPill({
  specs,
  className,
}: {
  specs: SpecRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "tabular grid grid-cols-2 gap-px overflow-hidden rounded-md",
        "bg-border/60 ring-1 ring-inset ring-white/5",
        className,
      )}
    >
      {specs.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <div
            key={s.key}
            className="flex flex-col gap-1 bg-surface-elevated/80 px-1.5 py-2.5 backdrop-blur"
          >
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Icon className="size-3.5" strokeWidth={1.75} />
              {LABELS[s.key]}
            </div>
            <div className="flex items-baseline gap-1.5 leading-tight">
              <span className="text-[11px] font-semibold text-foreground">
                {s.value}
              </span>
              {s.note && (
                <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">
                  {s.note}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
