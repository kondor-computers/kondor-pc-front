import type { Metadata } from "next";
import { SelectionForm } from "./SelectionForm";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getAllGames } from "@/lib/sanity-pc/games";
import Image from "next/image";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { fetchLandingPreviews } from "@/lib/sanity/landingAdapter";
import GamePcLandingsSection from "@/components/landings/GamePcLandingsSection";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForSitePage("seoPickerPage");
}

export const revalidate = 60;

export default async function PidbirPage() {
  const [gamesCatalog, gamePcLandings] = await Promise.all([
    getAllGames(),
    fetchLandingPreviews("game-pc").catch(() => []),
  ]);
  return (
    <>
      <SitePageSchemaJson pageId="seoPickerPage" excludeTypes={["WebPage"]} />
      <SiteWebPageJsonLd pageId="seoPickerPage" />
      <div className="">
        <section className="relative py-[150px] lg:pb-30 mb-15 lg:mb-25 rounded-b-[40px] overflow-hidden">
          <div className="relative container-site">
            <div className="lg:hidden absolute -z-20 top-[-150px] left-[-360px] w-[873px] h-[755px] pointer-events-none">
              <Image
                src="/images/pidbir/decor-mob.webp"
                alt=""
                width={873}
                height={755}
fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block -z-10 absolute bottom-[-1143px] left-[-837px] xl:left-[-787px] w-[3375px] h-[1887px] pointer-events-none">
              <Image
                src="/images/pidbir/shadows-desk.svg"
                alt=""
                width={3375}
                height={1887}
className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[-160px] left-[-277px] w-[890px] h-[916px] pointer-events-none">
              <Image
                src="/images/pidbir/decor-left-desk.webp"
                alt=""
                width={890}
                height={916}
fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[-160px] right-[-327px] w-[871px] h-[640px] pointer-events-none">
              <Image
                src="/images/pidbir/decor-right-desk.webp"
                alt=""
                width={871}
                height={640}
fetchPriority="low"
                className="object-cover"
              />
            </div>
            <SectionHeader
              kicker="Підбір · 30 секунд"
              title="ПІДБЕРЕМО ПК ЗА 30 СЕКУНД"
              subtitle="Покажемо реальні FPS у твоїх іграх та варіанти в твоєму бюджеті."
              titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10"
              subtitleClassName="lg:max-w-[398px]"
              className="mb-0 lg:max-w-[606px] lg:mx-auto"
              titleAs="h1"
            />
          </div>
        </section>
        <div className="container-site">
          <SelectionForm gamesCatalog={gamesCatalog} />
        </div>
      </div>
      <GamePcLandingsSection landings={gamePcLandings} />
      <SitePageSeoContent pageId="seoPickerPage" />
    </>
  );
}
