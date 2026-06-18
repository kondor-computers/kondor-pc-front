import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { faqsByScope, visibleFaqs } from "@/lib/mock/faqs";
import {
  Truck,
  Package,
  MapPin,
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  Bitcoin,
  Shield,
} from "lucide-react";
import { LazyMarqueeLine } from "@/components/shared/LazyMarqueeLine";
import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { DeferredSitePageSchema } from "@/components/seo/DeferredSitePageSchema";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { JsonLd, faqPageJsonLd } from "@/lib/seo";
import { DeliveryBusinessSection } from "./DeliveryBusinessSection";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForSitePage("seoDeliveryPaymentPage");
}

const DELIVERY = [
  {
    icon: Truck,
    title: "Нова Пошта — відділення",
    price: "200–400 ₴",
    term: "1–3 дні",
    note: "Доставка по всій Україні",
  },
  {
    icon: Package,
    title: "Нова Пошта — кур'єр",
    price: "200–400 ₴",
    term: "1–2 дні",
    note: "Залежно від адреси",
  },
  {
    icon: MapPin,
    title: "Самовивіз",
    price: "Безкоштовно",
    term: "за записом",
    note: "Київ",
  },
];

const PACKING = [
  { icon: Package, text: "Страхуємо кожне замовлення на повну вартість" },
  { icon: Package, text: "Додаткова фіксація компонентів всередині корпусу" },
  { icon: Shield, text: "Пінопластові вставки на всіх сторонах" },
];

const PAYMENT = [
  {
    icon: CreditCard,
    title: "Карта онлайн (MonoPay)",
    text: "Миттєве підтвердження. Комісія 1.3% додається до суми.",
  },
  {
    icon: Wallet,
    title: "Monobank Частинами",
    text: "3 платежі без %. Оформлення онлайн 2 хв.",
    visible: false,
  },
  {
    icon: Wallet,
    title: "ПУМБ Частинами",
    text: "До 24 місяців (% залежить від терміну).",
    visible: false,
  },
  {
    icon: Building2,
    title: "ФОП / ЮО — рахунок",
    text: "Рахунок, договір та закриваючі документи для ФОП/ЮО.",
  },
  {
    icon: Package,
    title: "Оплата при отриманні на НП",
    text: "Комісія НП: 2% + 20 ₴.",
  },
  {
    icon: Wallet,
    title: "ПриватБанк Оплата частинами",
    text: "До 24 місяців (% залежить від терміну).",
    visible: false,
  },
  {
    icon: Banknote,
    title: "Безготівковий IBAN",
    text: "Переказ на наш IBAN — для фізосіб.",
  },
  {
    icon: Bitcoin,
    title: "Криптовалюта",
    text: "USDT, BTC, ETH — за домовленістю з менеджером.",
  },
];

function visiblePaymentOptions() {
  return PAYMENT.filter((p) => p.visible !== false);
}

const faqs = [...faqsByScope("delivery"), ...faqsByScope("payment")];
const items = faqs.length > 0 ? faqs : visibleFaqs().slice(0, 5);
const faqSchema = faqPageJsonLd(items);
const paymentOptions = visiblePaymentOptions();

export default function DeliveryPaymentPage() {
  return (
    <>
      <DeferredSitePageSchema
        pageId="seoDeliveryPaymentPage"
        excludeTypes={["FAQPage", "WebPage"]}
      />
      <SiteWebPageJsonLd pageId="seoDeliveryPaymentPage" />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <div className="rounded-b-[28px] lg:rounded-b-[40px] overflow-hidden">
        <section>
          <div className="relative container-site pt-8 lg:pt-12 pb-[50px] lg:pb-25">
            <SectionHeader
              kicker="Доставка та оплата"
              title="ШВИДКА ДОСТАВКА ПО УКРАЇНІ, ЗРУЧНА ОПЛАТА"
              subtitle="Надійно пакуємо та відправляємо ПК по всій Україні. Безготівкова оплата та кілька способів отримання замовлення."
              titleAs="h1"
              className="mb-0"
              titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 md:max-w-[1054px]"
              subtitleClassName="text-[14px] lg:text-[16px] leading-[120%] lg:max-w-[644px]"
            />
          </div>
        </section>
        {/* DELIVERY */}
        <section className="relative container-site pb-6 lg:pb-20">
          <div className="hidden lg:block absolute -z-30 bottom-[-40px] lg:top-[-210px] right-[-218px] lg:right-[-160px] w-[503px] h-[522px] pointer-events-none">
            <Image
              src="/images/delivery/pc.webp"
              alt="Ігровий ПК Kondor PC"
              width={503}
              height={522}
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
          <div className="hidden lg:block absolute -z-40 bottom-[-278px] left-[-541px] lg:bottom-[-578px] lg:left-[-771px] w-[1131px] h-[954px] pointer-events-none">
            <Image
              src="/images/garantiya/steps-shadows.svg"
              alt=""
              width={1131}
              height={954}
              fetchPriority="low"
              className="object-cover"
            />
          </div>
          <div className="lg:hidden absolute -z-40 bottom-[-348px] left-[-221px] lg:bottom-[-658px] lg:left-[-771px] w-[836px] h-[811px] pointer-events-none">
            <Image
              src="/images/delivery/hero-shadows-mob.svg"
              alt=""
              width={836}
              height={811}
              fetchPriority="low"
              className="object-cover"
            />
          </div>
          <SectionHeader
            kicker="01 · Доставка"
            title="Способи доставки"
            className="mb-7 lg:mb-10"
            showKickerDot={false}
            titleClassName="lg:text-[36px]"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {DELIVERY.map((d) => (
              <div
                key={d.title}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                  <d.icon className="size-5" strokeWidth={1.5} />
                </div>
                <div className="text-[16px] leading-[120%] font-semibold tracking-wide uppercase">
                  {d.title}
                </div>
                <div className="tabular mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-xl font-bold">
                    {d.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {d.term}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{d.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* PACKING */}
      <section className="overflow-hidden">
        <div className="relative container-site pt-14 pb-[195px] lg:pt-20 lg:pb-[170px]">
          <div className="absolute -z-20 top-[-796px] lg:top-[-154px] right-[-1359px] lg:left-[-120px] w-[1929px] h-[2007px] rotate-180 lg:rotate-0 pointer-events-none">
            <Image
              src="/images/pk/shadows.svg"
              alt=""
              width={1929}
              height={2007}
              fetchPriority="low"
              className="object-cover"
            />
          </div>
          <div className="absolute -z-10 bottom-[158px] lg:bottom-[103px] left-[-30px] w-[247px] h-[247px] pointer-events-none">
            <Image
              src="/images/home/trust/figure.svg"
              alt=""
              width={247}
              height={247}
              fetchPriority="low"
              className="object-cover"
            />
          </div>
          <div className="absolute -z-10 bottom-0 right-[-7px] lg:right-[90px] w-[307px] lg:w-[501px] h-auto aspect-[501/367] pointer-events-none">
            <Image
              src="/images/delivery/pc-packaging.webp"
              alt="Ігровий ПК Kondor PC в упаковці для доставки Новою Поштою"
              width={501}
              height={367}
              sizes="(min-width: 1024px) 501px, 307px"
              fetchPriority="low"
              className="object-cover w-[307px] lg:w-[501px] h-auto"
            />
          </div>
          <Reveal>
            <SectionHeader
              kicker="Як пакуємо"
              title="ЯК МИ УПАКОВУЄМО ПК ДЛЯ ДОСТАВКИ"
              subtitle="Жодної поломки за всі роки доставки. Якщо коробка прийшла пошкодженою — не приймай, ми вирішимо."
              className="mb-[70px]"
              titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 lg:text-[36px]"
              subtitleClassName="text-[16px] leading-[120%] lg:max-w-[492px]"
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="grid gap-3 sm:grid-cols-2">
              {PACKING.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                    <p.icon className="size-4.5" strokeWidth={1.5} />
                  </div>
                  <div className="text-sm">{p.text}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <LazyMarqueeLine />

      {/* PAYMENT */}
      <section className="relative container-site py-[92px] lg:pt-[66px] lg:pb-[76px]">
        <div className="absolute -z-40 top-[301px] sm:top-[231px] lg:top-[81px] left-[52px] sm:left-[362px] lg:left-[787px] xl:left-[827px] w-[252px] h-[269px] sm:w-[252px] sm:h-[269px] lg:w-[354px] lg:h-[346px] pointer-events-none">
          <Image
            src="/images/home/top-rated/figure.svg"
            alt=""
            width={354}
            height={346}
            fetchPriority="low"
            className="object-cover"
          />
          <div className="absolute bottom-[-60px] left-[-10px] lg:bottom-[-348px] lg:left-[-138px] w-[302px] h-[291px] lg:w-[617px] lg:h-[582px] rounded-full bg-black blur-[35px]" />
        </div>
        <Reveal>
          <SectionHeader
            kicker="02 · Оплата"
            title={`${paymentOptions.length} способів оплати`}
            subtitle="Вибирай при оформленні замовлення — умови відображаються прямо в чекауті."
            className="mb-[92px]"
            titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 lg:text-[36px]"
            subtitleClassName="text-[16px] leading-[120%]"
          />
        </Reveal>
        <Reveal delay={80}>
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentOptions.map((p) => (
              <div
                key={p.title}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
                  <p.icon className="size-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-medium">{p.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <DeliveryBusinessSection items={items} />
      <SitePageSeoContent pageId="seoDeliveryPaymentPage" />
    </>
  );
}
