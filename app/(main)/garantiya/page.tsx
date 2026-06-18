import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { faqsByScope, visibleFaqs } from "@/lib/mock/faqs";
import { cn } from "@/lib/utils";
import {
  Shield,
  Wrench,
  Truck,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { LazyMarqueeLine } from "@/components/shared/LazyMarqueeLine";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { JsonLd, faqPageJsonLd } from "@/lib/seo";
import { FaqBlock } from "@/components/shared/FaqBlock";
import { formatUah } from "@/lib/format";
import { WarrantyContactsBlock } from "./WarrantyContactsBlock";
import { ServiceStepContacts } from "./ServiceStepContacts";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForSitePage("seoWarrantyPage");
}

const COVERED = [
  "Справність усіх компонентів протягом 12 місяців",
  "Безкоштовне обслуговування та ремонт у цей період",
  "Заміна компонента на новий, якщо ремонт неможливий",
  "Гарантія виробника на кожен компонент (2–5 років)",
  "Безкоштовна доставка до сервісу та назад",
];

const NOT_COVERED = [
  "Механічні пошкодження з вини користувача",
  "Наслідки скачків напруги (радимо ДБЖ)",
  "Псування від рідини або їжі",
  "Самостійне розбирання без нашої присутності",
];

const SERVICE_STEPS = [
  {
    icon: MessageSquare,
    title: "Пиши нам",
    text: "",
  },
  {
    icon: Wrench,
    title: "Опис проблеми",
    text: "Надсилаєш фото чи відео поломки",
  },
  {
    icon: Truck,
    title: "доставка НП",
    text: "Надійне пакуванння та страхування посилки",
  },
  {
    icon: Shield,
    title: "Діагностика 1–3 дні",
    text: "Наш інженер перевіряє систему",
  },
  {
    icon: Wrench,
    title: "Ремонт 3–10 днів",
    text: "Ремонтуємо або замінюємо компонент",
  },
  {
    icon: Truck,
    title: "Повернення",
    text: "Відправляємо ПК назад безкоштовно",
  },
];

const PLANS = [
  { years: 1, price: 0, note: "базовий · включено" },
  { years: 2, price: 3500, note: "захист компонентів" },
  { years: 3, price: 6500, note: "пріоритет + чистки" },
];

const faqs =
  faqsByScope("warranty").length > 0
    ? faqsByScope("warranty")
    : visibleFaqs().slice(0, 5);
const faqSchema = faqPageJsonLd(faqs);

export default function WarrantyPage() {
  return (
    <>
      <SitePageSchemaJson
        pageId="seoWarrantyPage"
        excludeTypes={["FAQPage", "WebPage"]}
      />
      <SiteWebPageJsonLd pageId="seoWarrantyPage" />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      {/* Hero */}
      <section className="relative">
        <div className="absolute -z-10 top-[-223px] lg:top-[-154px] left-[-860px] lg:left-[-120px] w-[1929px] h-[2007px] pointer-events-none">
          <Image
            src="/images/pk/shadows.svg"
            alt=""
            width={1929}
            height={2007}
fetchPriority="low"
            className="object-cover"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, #14462380, transparent 70%)",
          }}
        />
        <div className="container-site relative pt-8 lg:pt-12 pb-[46px] lg:pb-15">
          <SectionHeader
            kicker="Гарантія"
            title="ГАРАНТІЯ ДО 3 РОКІВ"
            subtitle="12 місяців гарантії від Kondor PC + оригінальна гарантія виробника на кожен компонент. Якщо щось зламається — забираємо ПК НП за наш рахунок."
            titleAs="h1"
            titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10"
            subtitleClassName="text-[14px] lg:text-[16px] leading-[120%] max-w-[328px] lg:max-w-[493px]"
          />
        </div>
      </section>

      {/* Covered / Not covered */}
      <section className="relative container-site pt-[46px] pb-[92px] lg:pt-15 lg:pb-[111px]">
        <div className="absolute -z-10 bottom-[63px] lg:bottom-[164px] right-[-40px] lg:right-[-30px] w-[247px] h-[247px] pointer-events-none">
          <Image
            src="/images/garantiya/square.svg"
            alt=""
            width={247}
            height={247}
fetchPriority="low"
            className="object-cover"
          />
        </div>
        <Reveal>
          <SectionHeader
            kicker="Що входить"
            title="ЩО ПОКРИВАЄ НАША ГАРАНТІЯ"
            titleClassName="mt-3 lg:mt-7 lg:text-[32px]"
          />
        </Reveal>
        <Reveal delay={80}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#20DEFF66]/60 bg-surface p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full  bg-[#20DEFF66]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#20DEFF]">
              Покриває
            </div>
            <ul className="space-y-2.5 text-sm">
              {COVERED.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#20DEFF]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Не покриває
            </div>
            <ul className="space-y-2.5 text-sm">
              {NOT_COVERED.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">—</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </Reveal>
      </section>

      <LazyMarqueeLine />

      {/* Process */}
      <section className="relative rounded-b-[40px] overflow-hidden">
        <div className="relative container-site pt-16 pb-5 lg:pt-30 lg:pb-[163px]">
          <div className="absolute -z-30 bottom-[-40px] lg:top-[-10px] right-[-218px] lg:right-[-210px] w-[469px] lg:w-[640px] h-[469px] lg:h-[640px] pointer-events-none">
            <Image
              src="/images/garantiya/pc.webp"
              alt="Ігровий ПК Kondor PC"
              width={469}
              height={469}
              sizes="(min-width: 1024px) 640px, 460px"
  fetchPriority="low"
              className="object-cover w-[460px] lg:w-[640px] h-auto"
            />
          </div>
          <div className="hidden lg:block absolute -z-20 bottom-[-182px] right-[-256px] w-[632px] h-[632px] pointer-events-none">
            <Image
              src="/images/garantiya/right-mask.webp"
              alt=""
              width={632}
              height={632}
  fetchPriority="low"
              className="object-cover"
            />
          </div>
          <div className="hidden lg:block absolute -z-10 bottom-[-276px] right-[-675px] w-[735px] h-[735px] pointer-events-none">
            <Image
              src="/images/garantiya/steps-right-shadow-desk.svg"
              alt=""
              width={735}
              height={735}
  className="object-cover"
            />
          </div>
          <div className="absolute -z-40 bottom-[-278px] left-[-541px] lg:bottom-[-578px] lg:left-[-771px] w-[1131px] h-[954px] pointer-events-none">
            <Image
              src="/images/garantiya/steps-shadows.svg"
              alt=""
              width={1131}
              height={954}
  fetchPriority="low"
              className="object-cover"
            />
          </div>
          <Reveal>
            <SectionHeader
              kicker="Як обслуговуємо"
              title="6 КРОКІВ ГАРАНТІЙНОГО ВИПАДКУ"
              subtitle="Середній час обслуговування — 7 робочих днів від звернення до повернення ПК додому."
              titleAs="h2"
              titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 lg:text-[32px]"
              subtitleClassName="lg:max-w-[455px]"
            />
          </Reveal>
          <Reveal delay={80}>
          <ol className="grid gap-3 md:grid-cols-2">
            {SERVICE_STEPS.map((s, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                  <s.icon className="size-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="tabular text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-[120%]">
                    Крок {i + 1}
                  </div>
                  <div className="font-heading text-base font-semibold uppercase leading-[120%]">
                    {s.title}
                  </div>
                  <p className="mt-0.5 text-[12px] lg:text-[14px] text-muted-foreground leading-[120%]">
                    {i === 0 ? (
                      <Suspense
                        fallback={
                          <span>Telegram, телефон або email</span>
                        }
                      >
                        <ServiceStepContacts />
                      </Suspense>
                    ) : (
                      s.text
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          </Reveal>
        </div>
      </section>

      {/* Extended warranty */}
      <div className="overflow-hidden">
        <section className="relative container-site py-16 md:py-20">
          <div className="absolute -z-30 top-[-812px] left-[-279px] lg:top-[-840px] lg:left-[-355px] w-[1698px] h-[1748px] pointer-events-none">
            <Image
              src="/images/garantiya/extended-shadows.svg"
              alt=""
              width={1698}
              height={1748}
  fetchPriority="low"
              className="object-cover"
            />
          </div>
          <Reveal>
            <SectionHeader
              kicker="Розширена гарантія"
              title="ПРОДОВЖИ ГАРАНТІЮ ДО 3 РОКІВ"
              subtitle="Обирай при покупці — додатковий захист, пріоритетне обслуговування, безкоштовні чистки."
              titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 lg:text-[36px]"
              subtitleClassName="lg:max-w-[483px]"
            />
          </Reveal>
          <Reveal delay={80}>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.years}
                className={cn(
                  "rounded-lg border p-6",
                  p.years === 2
                    ? "border-brand-primary bg-surface-elevated text-brand-primary"
                    : "border-border bg-surface",
                )}
              >
                <div className="tabular font-display text-3xl font-bold">
                  {p.years}{" "}
                  {p.years === 1 ? "рік" : p.years < 5 ? "роки" : "років"}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {p.note}
                </div>
                <div className="tabular mt-4 font-heading text-xl font-bold">
                  {p.price === 0
                    ? "Безкоштовно"
                    : `+${formatUah(p.price)} ₴`}
                </div>
              </div>
            ))}
          </div>
          </Reveal>
        </section>
      </div>

      <div className="relative rounded-[40px] overflow-hidden">
        <div className="absolute -z-30 top-0 left-0 w-full h-full bg-brand-primary" />
        {/* Contacts block */}
        <section>
          <div className="container-prose pt-[233px] lg:pt-20 text-center">
            <div className="lg:hidden absolute -z-20 top-[-125px] left-[calc(50%-460px)] w-[630px] h-[487px] pointer-events-none">
              <Image
                src="/images/home/faq/top-decor-mob.webp"
                alt=""
                width={630}
                height={487}
    fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-10 top-[-520px] left-[calc(50%-710px)] w-[1175px] h-[1153px] pointer-events-none">
              <Image
                src="/images/home/faq/top-shadows-mob.svg"
                alt=""
                width={1175}
                height={1153}
    className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-10 bottom-[-345px] left-[calc(50%-340px)] w-[748px] h-[549px] pointer-events-none">
              <Image
                src="/images/home/faq/bottom-decor-mob.webp"
                alt=""
                width={748}
                height={549}
    fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="lg:hidden absolute -z-20 bottom-[-265px] left-[calc(50%-467px)] w-[975px] h-[975px] pointer-events-none">
              <Image
                src="/images/home/faq/bottom-shadows-mob.svg"
                alt=""
                width={975}
                height={975}
    className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[22px] left-[calc(50%-1440px)] w-[1231px] h-[767px] pointer-events-none">
              <Image
                src="/images/home/faq/left-decor-desk.webp"
                alt=""
                width={1231}
                height={767}
    fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-20 top-[-69px] right-[calc(50%-1000px)] w-[1160px] h-[852px] pointer-events-none">
              <Image
                src="/images/home/faq/right-decor-desk.webp"
                alt=""
                width={1160}
                height={852}
    fetchPriority="low"
                className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 top-[0px] left-[calc(50%-502px)] w-[1004px] h-[695px] pointer-events-none">
              <Image
                src="/images/home/faq/center-shadows-desk.svg"
                alt=""
                width={1004}
                height={695}
    className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 top-[-453px] left-[calc(50%-1480px)] w-[1056px] h-[1021px] pointer-events-none">
              <Image
                src="/images/home/faq/top-left-shadows-desk.svg"
                alt=""
                width={1056}
                height={1021}
    className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 bottom-[-462px] left-[calc(50%-1377px)] w-[975px] h-[975px] pointer-events-none">
              <Image
                src="/images/home/faq/bottom-left-shadows-desk.svg"
                alt=""
                width={975}
                height={975}
    className="object-cover"
              />
            </div>
            <div className="hidden lg:block absolute -z-10 bottom-[-404px] right-[calc(50%-1277px)] w-[735px] h-[735px] pointer-events-none">
              <Image
                src="/images/home/faq/bottom-right-shadows-desk.svg"
                alt=""
                width={735}
                height={735}
    className="object-cover"
              />
            </div>
            <Reveal>
              <SectionHeader
                align="center"
                kicker="Якщо щось зламалося"
                title="Пиши нам одразу"
                className="mb-6"
                kickerClassName="text-black"
                titleClassName="lg:max-w-[536px] mt-4 text-black"
                showKickerDot={false}
              />
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 mb-12 text-sm text-black">
                Робочі години: щодня 9:00–21:00
              </p>
              <WarrantyContactsBlock />
            </Reveal>
          </div>
        </section>
        {/* FAQ */}
        <Reveal delay={160}>
          <section className="container-prose pt-9 pb-6.5 lg:pt-12 lg:pb-[66px]">
            <FaqBlock items={faqs} />
          </section>
        </Reveal>
      </div>
      <SitePageSeoContent pageId="seoWarrantyPage" />
    </>
  );
}
