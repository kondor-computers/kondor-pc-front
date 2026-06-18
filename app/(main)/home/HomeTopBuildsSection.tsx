import Image from "next/image";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BuildCardStatic } from "@/components/shared/BuildCardStatic";
import { Reveal } from "@/components/shared/Reveal";
import {
  getAllGames,
  makeGameLabelMap,
  makeGameShortLabelMap,
} from "@/lib/sanity-pc/games";
import type { Build } from "@/types/build";

export async function HomeTopBuildsSection({
  topBuilds,
}: {
  topBuilds: Build[];
}) {
  const gamesCatalog = await getAllGames();
  const gameLabels = makeGameLabelMap(gamesCatalog);
  const gameShortLabels = makeGameShortLabelMap(gamesCatalog);

  return (
    <section className="relative container-site py-[92px] lg:pt-[154px] lg:pb-[90px]">
      <div className="hidden lg:block absolute -z-40 top-[-96px] left-[-43px] w-[2245px] h-[2316px]">
        <Image
          src="/images/home/top-rated/shadow-desk.svg"
          alt=""
          width={2245}
          height={2316}
          fetchPriority="low"
          className="object-cover"
        />
      </div>
      <div className="block lg:hidden absolute -z-40 top-[-20px] left-[-43px] w-[878px] h-[906px]">
        <Image
          src="/images/home/top-rated/shadow-mob.svg"
          alt=""
          width={878}
          height={906}
          fetchPriority="low"
          className="object-cover"
        />
      </div>
      <div className="hidden lg:block -z-30 absolute top-[281px] lg:left-[787px] xl:left-[897px] w-[354px] h-[346px]">
        <Image
          src="/images/home/top-rated/figure.svg"
          alt=""
          width={354}
          height={346}
          fetchPriority="low"
          className="object-cover"
        />
        <div className="absolute bottom-[-388px] left-[-138px] w-[617px] h-[582px] rounded-full bg-black blur-[35px]" />
      </div>
      <Reveal>
        <SectionHeader
          kicker="Найчастіше обирають цього місяця"
          title="ТРИ ПЕРЕВІРЕНІ ЗБІРКИ В РІЗНИХ БЮДЖЕТАХ"
          subtitle="По одній оптимальній моделі на кожен ціновий діапазон — з реальними FPS у популярних іграх."
          className="lg:mb-[130px]"
          titleClassName="lg:max-w-[891px] lg:mt-7 lg:mb-10"
          subtitleClassName="lg:max-w-[428px]"
        />
      </Reveal>
      <Reveal delay={80}>
        <div className="grid gap-4 md:grid-cols-3">
          {topBuilds.map((build, i) => (
            <BuildCardStatic
              key={build.slug}
              build={build}
              variant="full"
              gameLabels={gameLabels}
              gameShortLabels={gameShortLabels}
              highlightGames={["cs2", "warzone", "gta5"]}
              badge={i === 1 ? "Хіт" : undefined}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
