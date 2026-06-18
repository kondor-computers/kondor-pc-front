import { CatalogCardStatic } from "@/components/catalog/CatalogCardStatic";
import { groupProducts } from "@/lib/catalog/group";
import { getSimilarItems } from "@/lib/sanity/fetchers";

export async function SimilarCatalogSection({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) {
  const similar = await getSimilarItems(slug, categorySlug);
  const groups = groupProducts(similar).slice(0, 4);
  if (groups.length === 0) return null;

  return (
    <section className="container-site py-12 md:py-16">
      <div className="mb-6">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Схожі товари
        </div>
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          З ЦІЄЇ Ж КАТЕГОРІЇ
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map((g) => (
          <CatalogCardStatic key={g.key} group={g} />
        ))}
      </div>
    </section>
  );
}
