import { SectionHeader } from "@/components/shared/SectionHeader";
import { BuildCardStatic } from "@/components/shared/BuildCardStatic";
import { getSimilarBuilds } from "@/lib/sanity-pc/builds";
import { getAllGames, makeGameLabelMap, makeGameShortLabelMap } from "@/lib/sanity-pc/games";

export async function SimilarBuildsSection({ slug }: { slug: string }) {
  const [similar, gamesCatalog] = await Promise.all([
    getSimilarBuilds(slug, 3),
    getAllGames(),
  ]);

  if (similar.length === 0) return null;

  const gameLabels = makeGameLabelMap(gamesCatalog);
  const gameShortLabels = makeGameShortLabelMap(gamesCatalog);

  return (
    <section className="">
      <div className="relative container-site pt-[92px] lg:pt-30 lg:pb-[77px]">
        <SectionHeader
          kicker="Альтернативи"
          title="ІНШІ ЗБІРКИ ЦЬОГО КЛАСУ"
          subtitle="Порівняйте альтернативні збірки в цьому ціновому сегменті."
          titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {similar.map((s) => (
            <BuildCardStatic
              key={s.slug}
              build={s}
              variant="compact"
              gameLabels={gameLabels}
              gameShortLabels={gameShortLabels}
              highlightGames={["cs2", "warzone", "cyberpunk"]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
