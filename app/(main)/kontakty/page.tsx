import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LazyMarqueeLine } from "@/components/shared/LazyMarqueeLine";
import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { LazyContactForm } from "./LazyContactForm";
import { ContactsPanel } from "./ContactsPanel";
import { RequisitesSection } from "./RequisitesSection";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForSitePage("seoContactsPage");
}

export default function ContactsPage() {
  return (
    <>
      <SitePageSchemaJson pageId="seoContactsPage" />
      <section className="rounded-b-[40px] overflow-hidden">
        <div className="relative container-site pt-8 pb-[67px] lg:pt-12 lg:pb-[62px]">
          <div className="absolute -z-30 top-[170px] lg:top-[50px] right-[-64px] lg:right-[-190px] w-[322px] lg:w-[640px] h-[322px] lg:h-[640px] pointer-events-none">
            <Image
              src="/images/garantiya/pc.webp"
              alt="Ігровий ПК Kondor PC"
              width={469}
              height={469}
              sizes="(min-width: 1024px) 640px, 322px"
              fetchPriority="low"
              className="object-cover w-[322px] lg:w-[640px] h-auto"
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
          <div className="absolute -z-40 bottom-[-278px] left-[-541px] lg:bottom-[-598px] lg:left-[-771px] w-[1131px] h-[954px] pointer-events-none">
            <Image
              src="/images/garantiya/steps-shadows.svg"
              alt=""
              width={1131}
              height={954}
              fetchPriority="low"
              className="object-cover"
            />
          </div>
          <SectionHeader
            kicker="Контакти"
            title="Контакти Kondor PC"
            subtitle="Щодня з 9:00 до 21:00 — відповідаємо у Telegram та по телефону."
            titleAs="h1"
            className="mb-[67px] lg:text-[62px]"
            titleClassName="mt-3 mb-5 lg:mt-7 lg:mb-10 max-w-[328px] lg:max-w-none"
            subtitleClassName="lg:max-w-[406px] max-w-[328px] lg:max-w-none"
          />

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <ContactsPanel />
              <LazyContactForm />
            </div>
          </Reveal>
        </div>
      </section>
      <LazyMarqueeLine />

      <RequisitesSection />
      <SitePageSeoContent pageId="seoContactsPage" />
    </>
  );
}
