"use client";

import { PriceBlock } from "@/components/shared/PriceBlock";
import { PurchaseActions } from "@/components/shared/PurchaseActions";
import { useProductConfigurator } from "@/components/shared/ProductConfigurator";

export function BuildRepeatCta() {
  const { build, resolvedPriceUah, resolvedOldPriceUah, selectedOptions } =
    useProductConfigurator();

  const nonDefaultPicks = selectedOptions.filter(({ groupId, option }) => {
    const group = build.configurableOptions?.find((g) => g.id === groupId);
    const def = group?.options.find((o) => o.isDefault);
    return option.priceDelta !== 0 || option.id !== def?.id;
  });

  return (
    <div className="card-frame-lg relative mx-auto overflow-hidden p-8 md:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--brand-primary)" }}
      />
      {/* SKU-tinted ember from the bottom — adds warmth to the conversion block */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 100%, color-mix(in srgb, var(--brand-primary) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Готовий?
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Забирай {build.name}
          </h2>
          <p className="mt-3 text-muted-foreground text-[16px] leading-[120%]">
            {build.shortTagline}.{" "}
            {build.status === "in_stock"
              ? "В наявності — відправимо завтра."
              : `Збірка за ${build.assemblyDays} дні після оплати.`}
          </p>
          {nonDefaultPicks.length > 0 && (
            <ul className="tabular mt-4 space-y-1 text-sm text-muted-foreground">
              {nonDefaultPicks.map(({ groupId, groupLabel, option }) => (
                <li key={groupId} className="flex items-center gap-2">
                  <span className="text-[color:var(--sku)]">✓</span>
                  <span>{groupLabel}:</span>
                  <span className="text-foreground">{option.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <PriceBlock
            priceUah={resolvedPriceUah}
            oldPriceUah={resolvedOldPriceUah}
            size="lg"
          />
          <PurchaseActions
            slug={build.slug}
            name={build.name}
            priceUah={build.priceUah}
          />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Доставка безкоштовно · Гарантія 12 міс · Повернення 14 днів
          </div>
        </div>
      </div>
    </div>
  );
}
