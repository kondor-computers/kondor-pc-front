import { SectionHeader } from "@/components/shared/SectionHeader";
import { getBuildsRecommendedForGame } from "@/lib/data/adapter";
import { BuildCardSingle } from "@/components/blocks/BuildCardSingle";
import type { ResolvedPageContext } from "@/lib/data/types";

export async function ProductRecommendedForGame({
  heading,
  pageContext,
}: {
  heading?: string;
  pageContext: ResolvedPageContext;
}) {
  const builds = await getBuildsRecommendedForGame(pageContext.refSlug);
  const title =
    heading ?? `ТРИ ЗБІРКИ ПІД ${pageContext.displayName.toUpperCase()}`;

  return (
    <div className="container-site py-16 md:py-20">
      <SectionHeader
        kicker="Рекомендовані збірки"
        title={title}
        subtitle="Від оптимального Full HD до 4К з запасом на 2 роки."
        titleClassName="mt-3"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {builds.map((b) => (
          <BuildCardSingle
            key={b.slug}
            buildSlug={b.slug}
            variant="full"
            pageContext={pageContext}
          />
        ))}
      </div>
    </div>
  );
}
