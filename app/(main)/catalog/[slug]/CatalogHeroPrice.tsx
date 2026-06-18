import { formatPrice } from "@/lib/format";
import type { CatalogProductDetail } from "@/types/catalog";

export function CatalogHeroPrice({ item }: { item: CatalogProductDetail }) {
  const hasDiscount =
    typeof item.priceDiscount === "number" && item.priceDiscount < item.price;
  const finalPrice = hasDiscount ? item.priceDiscount! : item.price;

  return (
    <div className="flex items-baseline gap-3">
      <div className="font-heading tabular text-4xl font-bold">
        {formatPrice(finalPrice)}
      </div>
      {hasDiscount && (
        <div className="tabular text-base text-muted-foreground line-through">
          {formatPrice(item.price)}
        </div>
      )}
    </div>
  );
}
