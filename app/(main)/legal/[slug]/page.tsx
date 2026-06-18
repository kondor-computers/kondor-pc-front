import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_PAGES, legalBySlug, visibleLegalParagraphs } from "@/lib/mock/legal-pages";
import { SiteContactsBlock } from "@/components/shared/SiteContactsBlock";
import {
  formatIbanDisplay,
  getPaymentRequisites,
  getPaymentRequisitesSeller,
} from "@/lib/sanity/paymentRequisites";
import { LegalParagraph } from "@/components/legal/LegalParagraph";
import {
  getSiteContactEmail,
  getSiteContactEmailAndTelegram,
  getSiteContacts,
} from "@/lib/sanity/siteContacts";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { LEGAL_SEO_BY_SLUG } from "@/lib/sanity/siteSeoConfig";
import { metadataForLegalSlug } from "@/lib/sanity/siteSeoFetcher";

export async function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalBySlug(slug);
  if (!page) return { title: "Не знайдено" };

  const fromSanity = await metadataForLegalSlug(slug);
  if (fromSanity) return fromSanity;

  return {
    title: page.title,
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalBySlug(slug);
  if (!page) notFound();

  const isRequisitesPage = slug === "pravova-informatsiya";
  const isPrivacyPage = slug === "politika-konfidentsiynosti";
  const isOfferPage = slug === "publichna-oferta";

  const [
    paymentRequisites,
    siteContacts,
    contactEmail,
    offerSeller,
    offerContacts,
  ] = await Promise.all([
    isRequisitesPage ? getPaymentRequisites() : null,
    isRequisitesPage ? getSiteContacts() : null,
    isPrivacyPage ? getSiteContactEmail() : null,
    isOfferPage ? getPaymentRequisitesSeller() : null,
    isOfferPage ? getSiteContactEmailAndTelegram() : null,
  ]);

  const legalSeoPageId = LEGAL_SEO_BY_SLUG[slug];

  return (
    <>
      {legalSeoPageId ? (
        <>
          <SitePageSchemaJson
            pageId={legalSeoPageId}
            excludeTypes={["WebPage"]}
          />
          <SiteWebPageJsonLd pageId={legalSeoPageId} />
        </>
      ) : null}
      <div className="container-site py-16 md:py-24">
        <div className="mb-10">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Правова інформація
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {page.title}
          </h1>
        </div>

        <article className="space-y-8 text-sm leading-relaxed md:text-base">
          {paymentRequisites && (
            <>
              <section>
                <h2 className="font-display mb-3 text-lg font-semibold md:text-xl">
                  ПРОДАВЕЦЬ
                </h2>
                <p className="mb-3 text-muted-foreground">
                  {paymentRequisites.seller}
                </p>
                <p className="mb-3 text-muted-foreground">
                  ЄДРПОУ / РНОКПП: {paymentRequisites.edrpouOrRnokpp}
                </p>
              </section>
              <section>
                <h2 className="font-display mb-3 text-lg font-semibold md:text-xl">
                  БАНКІВСЬКІ РЕКВІЗИТИ
                </h2>
                <p className="mb-3 text-muted-foreground">
                  IBAN:{" "}
                  <span className="tabular font-medium text-foreground">
                    {formatIbanDisplay(paymentRequisites.iban)}
                  </span>
                </p>
              </section>
            </>
          )}
          {siteContacts && <SiteContactsBlock contacts={siteContacts} />}
          {page.body.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="font-display mb-3 text-lg font-semibold md:text-xl">
                  {section.heading}
                </h2>
              )}
              {visibleLegalParagraphs(section.paragraphs).map((p, j) => (
                <LegalParagraph
                  key={j}
                  text={p}
                  contactEmail={contactEmail ?? offerContacts?.email}
                  paymentSeller={offerSeller}
                  siteContacts={offerContacts}
                />
              ))}
              {section.list && (
                <ul className="mt-2 space-y-1.5">
                  {section.list.map((li, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-muted-foreground before:mt-2 before:size-1 before:shrink-0 before:rounded-full before:bg-foreground/40 before:content-['']"
                    >
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
      {legalSeoPageId ? <SitePageSeoContent pageId={legalSeoPageId} /> : null}
    </>
  );
}
