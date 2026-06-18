import type { Metadata } from "next";
import { LazyCustomBuildForm } from "./LazyCustomBuildForm";
import { SectionHeader } from "@/components/shared/SectionHeader";
import Image from "next/image";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { JsonLd, howToAssemblyJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForSitePage("seoCustomBuildPage");
}

const WHAT_WE_CAN = [
  {
    n: "01",
    title: "ІГРОВИЙ ПК З НУЛЯ",
    text: "Будь-яка конфігурація під твої ігри та бюджет.",
  },
  {
    n: "02",
    title: "РОБОЧА СТАНЦІЯ",
    text: "Для монтажу відео, 3D, роботи з AI, програмування.",
  },
  {
    n: "03",
    title: "УНІКАЛЬНИЙ ДІЗАЙН",
    text: "Кастомний корпус, обтяжка, RGB-підсвітка під твій стиль.",
  },
];

const STEPS = [
  "Заповнюєш заявку",
  "Ми зв'яжемося за 2 години",
  "Оплата та збірка (5–7 днів)",
  "Надійне пакування та страхування посилки НП",
];

export default function SborkaPage() {
  return (
    <>
      <SitePageSchemaJson
        pageId="seoCustomBuildPage"
        excludeTypes={["WebPage", "HowTo"]}
      />
      <SiteWebPageJsonLd pageId="seoCustomBuildPage" />
      <JsonLd data={howToAssemblyJsonLd()} />
      <div className="relative container-site pt-8 lg:pt-12 pb-16 lg:py-24">
        <div className="absolute -z-20 top-[-97px] sm:top-[-197px] lg:top-[-167px] right-[-615px] lg:right-[-420px] w-[1876px] h-[1990px]">
          <Image
            src="/images/sborka/shadows.svg"
            alt=""
            width={1876}
            height={1990}
className="object-cover"
          />
        </div>
        <div className="absolute -z-10 top-[120px] sm:top-[20px] right-[-110px] lg:top-[-76px] lg:right-[51px] w-[403px] lg:w-[597px] h-auto aspect-[597/797] pointer-events-none">
          <Image
            src="/images/sborka/decor.webp"
            alt=""
            width={597}
            height={797}
fetchPriority="low"
            className="object-cover w-full h-full"
          />
        </div>
        <SectionHeader
          kicker="Кастомна збірка"
          title="ЗБІРКА ПІД ТВОЇ ЗАДАЧІ"
          subtitle="Не знайшов ідеальну конфігурацію в каталозі? Зберемо саме те, що тобі потрібно."
          titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 max-w-[328px] md:max-w-[490px]"
          subtitleClassName="text-[16px] leading-[120%] max-w-[328px] lg:max-w-[430px]"
          className="mb-12"
          titleAs="h1"
        />

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
            {WHAT_WE_CAN.map((c) => (
              <div
                key={c.n}
                className="relative overflow-hidden clip-angular-12 bg-brand-primary p-6 min-h-[183px] sm:min-h-[230px] md:min-h-[210px] lg:min-h-[230px] xl:min-h-[183px]"
              >
                <div className="mb-4 flex items-center justify-between" />
                <div className="font-display text-[24px] sm:text-[15px] md:text-[20px] lg:text-[24px] font-semibold leading-[120%] text-black">
                  {c.title}
                </div>
                <p className="mt-3 max-w-[204px] text-[12px] leading-[120%] text-black">
                  {c.text}
                </p>
                <div className="absolute bottom-[0px] right-[0px] tabular font-heading text-[60px] font-bold text-black lg:bottom-[-27px] lg:right-[-27px] lg:text-[104px]">
                  {c.n}
                </div>
              </div>
            ))}
        </div>

        <div className="mb-12">
          <ol className="tabular flex flex-col sm:flex-row sm:flex-wrap md:items-center gap-x-6 gap-y-3 text-sm">
              {STEPS.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 rounded-[6px] bg-white px-4 py-3"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-background font-display text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="font-heading text-[12px] lg:text-[14px] font-medium leading-[120%] text-black uppercase">
                    {s}
                  </span>
                </li>
              ))}
          </ol>
        </div>

        <LazyCustomBuildForm />
      </div>
      <SitePageSeoContent pageId="seoCustomBuildPage" />
    </>
  );
}
