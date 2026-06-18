import { SectionHeader } from "@/components/shared/SectionHeader";
import { FpsTable } from "@/components/shared/FpsTable";
import { getAllGames, makeGameShortLabelMap } from "@/lib/sanity-pc/games";
import type { Build } from "@/types/build";
import { cn } from "@/lib/utils";

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("", className)}>
      <div className="relative container-site">{children}</div>
    </section>
  );
}

export async function FpsTableSection({ build }: { build: Build }) {
  const gamesCatalog = await getAllGames();
  const gameShortLabels = makeGameShortLabelMap(gamesCatalog);

  return (
    <Section className="pt-3 pb-15 lg:pb-0 lg:pt-[128px]">
      <SectionHeader
        kicker="Що ти отримаєш"
        title="СКІЛЬКИ FPS ТИ ОТРИМАЄШ У СВОЇХ ІГРАХ"
        subtitle="Тестуємо кожну збірку в нашій лабораторії. Значення нижче — середні FPS на налаштуваннях «Високі»."
        titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
        subtitleClassName="lg:max-w-[466px]"
      />
      <FpsTable build={build} gameShortLabels={gameShortLabels} />
    </Section>
  );
}
