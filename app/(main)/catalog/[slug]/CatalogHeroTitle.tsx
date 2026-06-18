import type { CatalogProductDetail } from "@/types/catalog";

/** Server-rendered title block — paints before purchase panel client JS. */
export function CatalogHeroTitle({ item }: { item: CatalogProductDetail }) {
  return (
    <div className="flex flex-col gap-5">
      {item.category && (
        <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {item.category.name}
        </div>
      )}
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">
        {item.name}
      </h1>
      {item.description && (
        <p className="mb-4 text-sm leading-[120%] text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  );
}
