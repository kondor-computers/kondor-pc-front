import { SectionHeader } from "@/components/shared/SectionHeader";
import { BuildCardSingle } from "@/components/blocks/BuildCardSingle";
import type { ResolvedPageContext } from "@/lib/data/types";

export function BuildsRow({
  heading,
  subheading,
  buildSlugs,
  pageContext,
}: {
  heading?: string;
  subheading?: string;
  buildSlugs: string[];
  pageContext?: ResolvedPageContext;
}) {
  if (!buildSlugs || buildSlugs.length === 0) return null;
  return (
    <div className="container-site py-16 md:py-20">
      {heading ? (
        <SectionHeader
          kicker="Збірки"
          title={heading}
          subtitle={subheading}
          titleClassName="mt-3"
        />
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {buildSlugs.map((slug) => (
          <BuildCardSingle
            key={slug}
            buildSlug={slug}
            variant="full"
            pageContext={pageContext}
          />
        ))}
      </div>
    </div>
  );
}
