import { Suspense } from "react";
import Image from "next/image";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/shared/Reveal";
import type { Faq } from "@/types/build";
import { FaqBlock } from "@/components/shared/FaqBlock";
import { BusinessContactNote } from "./BusinessContactNote";

const BUSINESS_DOCS = [
  "Рахунок на оплату",
  "Договір поставки",
  "УПД / видаткова накладна",
  "Акт приймання-передачі",
];

export function DeliveryBusinessSection({ items }: { items: Faq[] }) {
  return (
    <section className="relative rounded-[40px] overflow-hidden">
      <div className="absolute -z-40 inset-0 bg-brand-primary rounded-[40px]" />
      <div className="relative container-site pt-[233px] pb-16 md:py-20 lg:max-w-[861px]">
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
        <div className="hidden lg:block absolute -z-30 top-[69px] right-[calc(50%-1510px)] w-[1889px] h-[1200px] pointer-events-none">
          <Image
            src="/images/delivery/right-decor-desk.webp"
            alt=""
            width={1889}
            height={1200}
            fetchPriority="low"
            className="object-cover"
          />
        </div>
        <div className="hidden lg:block absolute -z-20 bottom-0 left-[calc(50%-627px)] w-[1004px] h-[600px] pointer-events-none">
          <Image
            src="/images/delivery/shadow-bottom-desk.svg"
            alt=""
            width={1004}
            height={600}
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
            kicker="ФОП та ЮО"
            title="Для юридичних осіб"
            subtitle="Оформлюй замовлення як ФОП або ЮО — надамо всі необхідні документи."
            className="mb-10"
            kickerClassName="text-center text-black"
            titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 text-center text-black"
            subtitleClassName="text-[14px] lg:text-[16px] leading-[120%] text-center lg:max-w-[424px] lg:mx-auto text-black"
            showKickerDot={false}
          />
        </Reveal>
        <Reveal delay={80}>
          <div className="rounded-lg border border-border bg-surface p-6 mb-9">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Працюємо з документами
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {BUSINESS_DOCS.map((d) => (
                <li
                  key={d}
                  className="flex items-center gap-2 text-[12px] lg:text-[14px] leading-[120%]"
                >
                  <span className="text-brand-primary">✓</span>
                  {d}
                </li>
              ))}
            </ul>
            <Suspense
              fallback={
                <p className="mt-5 text-[12px] lg:text-[14px] leading-[120%] text-muted-foreground">
                  Для оформлення обери «Для ФОП/ЮО» при оформленні замовлення.
                </p>
              }
            >
              <BusinessContactNote />
            </Suspense>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <FaqBlock items={items} />
        </Reveal>
      </div>
    </section>
  );
}
