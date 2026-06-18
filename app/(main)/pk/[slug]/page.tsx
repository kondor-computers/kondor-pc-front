import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Bell,
  Camera,
  Truck,
  Package,
  Shield,
  RotateCcw,
  PackageCheck,
  Wrench,
  Flame,
  Send,
} from "lucide-react";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { ComponentList } from "@/components/shared/ComponentList";
import { IncludedFeaturesBlock } from "@/components/shared/IncludedFeaturesBlock";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { LazyStickyBuyBar } from "./LazyStickyBuyBar";
import { BuildCardStatic } from "@/components/shared/BuildCardStatic";
import { ProductConfiguratorProvider } from "@/components/shared/ProductConfigurator";
import { BuildIdentityColumn } from "@/components/shared/BuildIdentityColumn";
import { BuildRepeatCta } from "@/components/shared/BuildRepeatCta";
import { SKU_ACCENTS } from "@/lib/sku-accents";
import {
  JsonLd,
  productJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToAssemblyJsonLd,
  pcBuildVideoObjectJsonLd,
} from "@/lib/seo";
import { getAllBuilds, getBuildBySlug, getBuildSlugs, pickSimilarBuilds } from "@/lib/sanity-pc/builds";
import { getAllGames, makeGameLabelMap, makeGameShortLabelMap } from "@/lib/sanity-pc/games";
import { getAddonItems } from "@/lib/sanity/fetchers";
import { groupProducts } from "@/lib/catalog/group";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { SchemaJsonFromSeo } from "@/components/seo/SchemaJsonFromUrl";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { ProductOgType } from "@/components/seo/ProductOgType";
import { buildPageMetadata } from "@/lib/sanity/pageSeo";
import { resolveProductImageUrl } from "@/lib/sanity/seoImage";
import { LazyMarqueeLine } from "@/components/shared/LazyMarqueeLine";
import { FaqBlock } from "@/components/shared/FaqBlock";
import { FpsTable } from "@/components/shared/FpsTable";
import { AccessoriesRailContent } from "@/components/catalog/AccessoriesRailContent";
import Image from "next/image";
import { BuildHeroLcpImage } from "./BuildHeroLcpImage";
import { BuildHeroTitle } from "./BuildHeroTitle";
import { LazyProductGallery } from "./LazyProductGallery";
import { BuildGameplayVideo } from "./BuildGameplayVideo";

export const revalidate = 60;

export async function generateStaticParams() {
  return getBuildSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBuildBySlug(slug);
  if (!b) return { title: "Не знайдено" };
  return buildPageMetadata({
    seo: b.seo,
    path: `/pk/${slug}`,
    openGraphType: "product",
    defaultTitle: `${b.name} — ${b.spec.cpu} + ${b.spec.gpu}`,
    defaultDescription: `${b.name} — ігровий ПК: ${b.spec.cpu}, ${b.spec.gpu}, ${b.spec.ram}. ${b.shortTagline}. Купити за ${formatPrice(b.priceUah)}.`,
  });
}

const ASSEMBLY_STEPS = [
  {
    n: 1,
    icon: PackageCheck,
    title: "Отримання компонентів",
    text: "Тільки нові деталі від офіційних постачальників. Перевіряємо кожну.",
  },
  {
    n: 2,
    icon: Wrench,
    title: "Ручна збірка",
    text: "Налаштовуємо BIOS, драйвери та систему для стабільної роботи й максимальної продуктивності.",
  },
  {
    n: 3,
    icon: Flame,
    title: "Стрес-тест 4 години",
    text: "Перевірка під максимальним навантаженням: температури, стабільність, шум.",
  },
  {
    n: 4,
    icon: Camera,
    title: "Відеозвіт",
    text: "Знімаємо відео готового ПК. Ти бачиш, що саме отримаєш.",
  },
  {
    n: 5,
    icon: Send,
    title: "Упаковка та відправка",
    text: "Подвійна коробка, пінопласт, фіксація. Відправляємо НП з трек-номером.",
  },
];

const AFTER_STEPS = [
  { icon: Bell, title: "Відразу", text: "Отримуєш номер замовлення" },
  {
    icon: Camera,
    title: "Через 3–5 днів",
    text: "Відео готового ПК перед відправкою",
  },
  {
    icon: Truck,
    title: "Доставка",
    text: "1–3 дні Новою Поштою, трек-номер у email",
  },
  {
    icon: Package,
    title: "Отримання",
    text: "Перевір коробку при отриманні. Пошкодження? Не приймай — ми вирішимо.",
  },
  {
    icon: Shield,
    title: "Гарантія",
    text: "Якщо щось зламається — забираємо НП. Ремонт за 3–10 днів.",
  },
  {
    icon: RotateCcw,
    title: "Повернення",
    text: "14 днів без пояснення причини за українським законом.",
  },
];

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

export default async function BuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [builds, gamesCatalog, addons] = await Promise.all([
    getAllBuilds(),
    getAllGames(),
    getAddonItems(),
  ]);

  const build = builds.find((b) => b.slug === slug);
  if (!build) notFound();

  const similarBuilds = pickSimilarBuilds(builds, slug, 3);
  const gameShortLabels = makeGameShortLabelMap(gamesCatalog);
  const gameLabels = makeGameLabelMap(gamesCatalog);
  const accessoryGroups = groupProducts(addons ?? []).slice(0, 4);

  const accent =
    SKU_ACCENTS[build.slug as keyof typeof SKU_ACCENTS] ??
    "var(--brand-primary)";
  const reviews = build.reviews?.slice(0, 3) ?? [];
  const faqs =
    build.customFaqItems?.map((item, index) => ({
      key: item.id ?? `custom-${build.slug}-${index}`,
      scope: "build" as const,
      question: item.question,
      answer: item.answer,
      answerContent: item.answerContent,
      relatedBuildSlug: build.slug,
    })) ?? [];
  const productImageUrl = resolveProductImageUrl(build);
  const galleryImages =
    build.galleryImageUrls ?? (build.heroImageUrl ? [build.heroImageUrl] : []);
  const heroImage = galleryImages[0];
  const galleryAlt = `${build.name} — ігровий ПК`;
  const needsInteractiveGallery =
    galleryImages.length > 1 || Boolean(build.assemblyVideoUrl);
  const faqSchema = faqPageJsonLd(faqs);
  const videoSchemas = pcBuildVideoObjectJsonLd(build, {
    gameLabels: gameShortLabels,
  });

  return (
    <ProductConfiguratorProvider build={build}>
      <div style={{ ["--sku" as string]: accent }}>
        <ProductOgType />
        <Suspense fallback={null}>
          <SchemaJsonFromSeo
            seo={build.seo}
            excludeTypes={["Product", "BreadcrumbList", "FAQPage", "HowTo", "VideoObject"]}
          />
        </Suspense>
        <JsonLd
          data={[
            productJsonLd(build, productImageUrl, {
              gameLabels: gameShortLabels,
            }),
            breadcrumbJsonLd([
              { name: "Головна", url: "/" },
              { name: "Ігрові ПК", url: "/pk" },
              { name: build.name, url: `/pk/${build.slug}` },
            ]),
            ...(faqSchema ? [faqSchema] : []),
            howToAssemblyJsonLd(),
            ...videoSchemas,
          ]}
        />
        {/* BLOCK 1 — ID + PRICE + CTA */}
        <section className="relative">
          <div className="absolute -z-10 left-[-662px] lg:left-[-305px] top-[-1063px] lg:top-[-735px] w-[1860px] h-[1992px] pointer-events-none">
            <Image
              src="/images/pk/product/shadows-hero.svg"
              alt=""
              width={1860}
              height={1992}
              fetchPriority="low"
              className="object-cover"
            />
          </div>

          {/* Matches `container-site` paddings (px-4 sm:px-6 lg:px-8) so every
            card under this column aligns edge-to-edge with BuildAudience and
            the later full-width sections on mobile. */}
          <div className="container-site relative grid gap-10 pb-12 lg:pb-0 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <div className="relative">
              {heroImage ? (
                <BuildHeroLcpImage src={heroImage} alt={galleryAlt} />
              ) : null}
              {needsInteractiveGallery ? (
                <LazyProductGallery
                  images={galleryImages}
                  videoUrl={build.assemblyVideoUrl}
                  videoPosterUrl={build.assemblyVideoPosterUrl}
                  alt={galleryAlt}
                  overlayMode
                  className="contents"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex flex-col gap-5">
              <BuildHeroTitle build={build} />
              <BuildIdentityColumn />
            </div>
          </div>
        </section>

        {/* BLOCK 1.5 — "Для кого цей ПК" */}
        {/* <div className="container-site pb-2">
            <BuildAudience build={build} />
          </div> */}

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

        {build.gameplayVideoUrl ? (
          <Section className="pb-22 lg:pb-0 lg:pt-30">
            <SectionHeader
              kicker="реальний геймплей"
              title="РЕАЛЬНІ ТЕСТИ НАШИХ ПК"
              className="mb-9"
              titleClassName="mt-3 lg:mt-7 lg:text-[36px]"
            />
            <BuildGameplayVideo
              videoUrl={build.gameplayVideoUrl}
              posterUrl={build.gameplayVideoPosterUrl}
              buildName={build.name}
            />
          </Section>
        ) : null}

        {/* BLOCK 5 — COMPONENTS */}
        <Section className="relative pb-[92px] lg:pb-30 lg:pt-[178px]">
          <div className="absolute -z-10 right-[-85px] lg:right-[-115px] xl:right-[-55px] top-[197px] sm:top-[167px] lg:top-[0px] w-[547px] lg:w-[763px] h-auto aspect-[763/738]">
            <Image
              src="/images/pk/product/figure-components.svg"
              alt="figure-components"
              width="763"
              height="738"
              className="object-cover w-[547px] lg:w-[763px] h-auto"
            />
          </div>
          <SectionHeader
            kicker="Що всередині"
            title={`Компоненти ${build.name}`}
            subtitle="Бренд, модель, пояснення новачку, гарантія виробника."
            className="mb-[168px] md:mb-[128px] lg:mb-10"
            titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px] max-w-[328px] lg:max-w-none"
            subtitleClassName="max-w-[328px] lg:max-w-none"
          />
          <ComponentList build={build} />
        </Section>

        {build.includedBenefits.length > 0 ? (
          <Section className="pb-[92px] lg:pb-[111px]">
            <div className="absolute -z-20 left-[-108px] lg:left-auto lg:right-[-220px] xl:right-[-100px] top-[-289px] lg:top-[-50px] w-[409px] lg:w-[547px] h-auto aspect-[547/568]">
              <Image
                src="/images/pk/product/pc-included.webp"
                alt="pc-included"
                width="547"
                height="568"
                className="object-cover w-[409px] lg:w-[547px] h-auto"
              />
            </div>
            <div className="lg:hidden absolute -z-10 left-[-932px] top-[-434px] w-[1483px] h-[1400px]">
              <Image
                src="/images/pk/product/shadows-included-mob.svg"
                alt="shadows-included-mob"
                width="1483"
                height="1400"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 lg:right-[-440px] lg:top-[-250px] w-[1981px] h-[1870px]">
              <Image
                src="/images/pk/product/shadows-included-desk.svg"
                alt="shadows-included-desk"
                width="1981"
                height="1870"
                className="object-cover"
              />
            </div>
            <SectionHeader
              kicker="Без доплат"
              title="ВЖЕ ВКЛЮЧЕНО В ЦІНУ"
              subtitle="Ми продаємо готове рішення, а не набір деталей. У багатох інших магазинах це продають як додаткові функції, або взагалі про це не згадують, у нас це безкоштовно"
              titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
              subtitleClassName="lg:max-w-[672px]"
            />
            <IncludedFeaturesBlock benefits={build.includedBenefits} />
          </Section>
        ) : null}

        {/* BLOCK 6.5 — ACCESSORIES CROSS-SELL */}
        <AccessoriesRailContent
          groups={accessoryGroups}
          title={`Аксесуари до ${build.name}`}
          subtitle="Клавіатура, миша, ігрова поверхня — обираються окремо й доповнюють збірку."
        />

        {/* BLOCK 7 — HOW WE BUILD */}
        <Section className="pb-[92px] lg:pb-30">
          <SectionHeader
            kicker="5 кроків"
            title="ЯК ПРОХОДИТЬ КОЖНА ЗБІРКА"
            className="mb-8"
            titleClassName="mt-3 lg:mt-7 lg:text-[36px]"
          />
          <div className="grid gap-4 md:grid-cols-5">
            {ASSEMBLY_STEPS.map((s) => (
              <div
                key={s.n}
                className="relative overflow-hidden clip-angular-12 bg-brand-primary p-5 text-black"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5 text-white">
                    <s.icon className="size-4.5" strokeWidth={1.5} />
                  </div>
                  <div className="tabular font-heading text-[20px] font-bold">
                    {String(s.n).padStart(2, "0")}
                  </div>
                </div>
                <div className="font-heading text-[16px] font-semibold leading-[120%] uppercase">
                  {s.title}
                </div>
                <p className="mt-1.5 text-xs">{s.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* BLOCK 8 — AFTER PURCHASE (CRITICAL) */}
        <Section className="pb-15 lg:pb-30">
          <div className="absolute -z-10 left-[-405px] lg:left-[-675px] top-[-878px] lg:top-[-888px] w-[2067px] h-[2086px]">
            <Image
              src="/images/pk/product/shadows-after-payment.svg"
              alt="shadows-after-payment"
              width="2067"
              height="2086"
              className="object-cover"
            />
          </div>
          <SectionHeader
            kicker="Без сюрпризів"
            title="ЩО ВІДБУВАЄТЬСЯ ПІСЛЯ ОПЛАТИ"
            subtitle="Точний сценарій від кнопки «Купити» до того, як ти вмикаєш ПК удома."
            titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
            className="mb-12"
            subtitleClassName="lg:max-w-[422px]"
          />
          <ol className="grid gap-3 md:grid-cols-2">
            {AFTER_STEPS.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                  <s.icon className="size-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-[12px] leading-[120%]">
                    {s.text}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* BLOCK 9 — REPEAT CTA */}
        <Section className="pb-12 lg:pb-23">
          <BuildRepeatCta />
        </Section>

        <LazyMarqueeLine className="mb-16 lg:mb-[107px]" />

        {/* BLOCK 10 — REVIEWS FOR THIS BUILD */}
        {reviews.length > 0 && (
          <Section className="pb-11 lg:pb-[69px]">
            <div className="absolute -z-50 right-[-429px] lg:right-[-645px] top-[391px] lg:top-[215px] w-[735px] h-[735px]">
              <Image
                src="/images/pk/product/shadows-reviews.svg"
                alt="shadows-reviews"
                width="735"
                height="735"
                className="object-cover"
              />
            </div>
            <SectionHeader
              kicker="Досвід клієнтів"
              title={`Що кажуть власники ${build.name}`}
              titleClassName="mt-3 lg:mt-7 lg:text-[36px]"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>
          </Section>
        )}

        {faqs.length > 0 ? (
        <section className="relative rounded-[40px] overflow-hidden">
          <div className="absolute -z-40 inset-0 bg-brand-primary rounded-[40px]" />
          <div className="relative container-site pt-[233px] lg:py-[66px] pb-[122px]">
            <div className="lg:hidden absolute -z-20 top-[-125px] left-[calc(50%-460px)] w-[630px] h-[487px]">
              <Image
                src="/images/home/faq/top-decor-mob.webp"
                alt="top-decor-mob"
                width="630"
                height="487"
                className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-10 top-[-520px] left-[calc(50%-710px)] w-[1175px] h-[1153px]">
              <Image
                src="/images/home/faq/top-shadows-mob.svg"
                alt="top-shadows-mob"
                width="1175"
                height="1153"
                className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-10 bottom-[-345px] left-[calc(50%-340px)] w-[748px] h-[549px]">
              <Image
                src="/images/home/faq/bottom-decor-mob.webp"
                alt="bottom-decor-mob"
                width="748"
                height="549"
                className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-20 bottom-[-265px] left-[calc(50%-467px)] w-[975px] h-[975px]">
              <Image
                src="/images/home/faq/bottom-shadows-mob.svg"
                alt="bottom-shadows-mob"
                width="975"
                height="975"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[22px] left-[calc(50%-1440px)] w-[1231px] h-[767px]">
              <Image
                src="/images/home/faq/left-decor-desk.webp"
                alt="left-decor-desk"
                width="1231"
                height="767"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[-69px] right-[calc(50%-1000px)] w-[1160px] h-[852px]">
              <Image
                src="/images/home/faq/right-decor-desk.webp"
                alt="right-decor-desk"
                width="1160"
                height="852"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 top-[0px] left-[calc(50%-502px)] w-[1004px] h-[695px]">
              <Image
                src="/images/home/faq/center-shadows-desk.svg"
                alt="center-decor-desk"
                width="1004"
                height="695"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 top-[-453px] left-[calc(50%-1480px)] w-[1056px] h-[1021px]">
              <Image
                src="/images/home/faq/top-left-shadows-desk.svg"
                alt="top-left-shadows-desk"
                width="1056"
                height="1021"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 bottom-[-462px] left-[calc(50%-1377px)] w-[975px] h-[975px]">
              <Image
                src="/images/home/faq/bottom-left-shadows-desk.svg"
                alt="bottom-left-shadows-desk"
                width="975"
                height="975"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 bottom-[-404px] right-[calc(50%-1277px)] w-[735px] h-[735px]">
              <Image
                src="/images/home/faq/bottom-right-shadows-desk.svg"
                alt="bottom-right-shadows-desk"
                width="735"
                height="735"
                className="object-cover"
              />
            </div>
            <SectionHeader
              kicker="Часті питання"
              title={`Про ${build.name}`}
              kickerClassName="text-center text-black"
              titleClassName="mt-3 lg:mt-7 text-center text-black"
              showKickerDot={false}
              className="lg:max-w-[706px] lg:mx-auto"
            />
            <div className="lg:max-w-[706px] lg:mx-auto">
              <FaqBlock items={faqs} />
            </div>
          </div>
        </section>
        ) : null}

        {similarBuilds.length > 0 ? (
          <section className="">
            <div className="relative container-site pt-[92px] lg:pt-30 lg:pb-[77px]">
              <SectionHeader
                kicker="Альтернативи"
                title="ІНШІ ЗБІРКИ ЦЬОГО КЛАСУ"
                subtitle="Порівняйте альтернативні збірки в цьому ціновому сегменті."
                titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {similarBuilds.map((s) => (
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
        ) : null}

        <LazyStickyBuyBar
          name={build.name}
          slug={build.slug}
          priceUah={build.priceUah}
          image={build.heroImageUrl}
        />
        <SeoContentBlock seo={build.seo} scopeKey={`pk-${build.slug}`} />
      </div>
    </ProductConfiguratorProvider>
  );
}
