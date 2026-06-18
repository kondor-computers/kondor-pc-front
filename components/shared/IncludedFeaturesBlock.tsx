import * as LucideIcons from "lucide-react";
import { Check } from "lucide-react";
import { benefitIconName } from "@/lib/benefit-icons";
import type { BuildBenefit } from "@/types/build";

function iconFor(
  key: string,
): React.ComponentType<{ className?: string; strokeWidth?: number }> {
  const name = benefitIconName(key);
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[pascal];
  return Icon ?? Check;
}

export function IncludedFeaturesBlock({
  benefits,
}: {
  benefits: BuildBenefit[];
}) {
  if (benefits.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {benefits.map((benefit) => {
        const Icon = iconFor(benefit.key);
        return (
          <li
            key={benefit.key}
            className="flex items-start gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
              <Icon className="size-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-heading text-[14px] leading-[120%] font-medium uppercase">
                {benefit.title}
              </div>
              {benefit.description ? (
                <div className="mt-1.5 text-[12px] leading-[120%] text-muted-foreground">
                  {benefit.description}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
