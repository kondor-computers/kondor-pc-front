import type { Build, Faq } from "@/types/build";
import type { CatalogProductDetail } from "@/types/catalog";
import type { FaqSchemaItem } from "@/lib/seo/faqSchema";
import { pcBuildProductJsonLd } from "@/lib/seo/pcBuildProductJsonLd";
import { ORGANIZATION_LOGO_HEIGHT, ORGANIZATION_LOGO_URL, ORGANIZATION_LOGO_WIDTH, SITE_URL } from "@/lib/seo/constants";
import {
  ensureHttps,
  getSiteContacts,
  telegramHref,
} from "@/lib/sanity/siteContacts";

export async function organizationJsonLd() {
  const contacts = await getSiteContacts().catch(() => null);

  const phone = contacts?.phone ?? "+380633631066";
  const email = contacts?.email ?? "info@kondor-pc.ua";
  const telegramUrl = contacts?.telegramChatUrl
    ? ensureHttps(contacts.telegramChatUrl)
    : contacts?.telegram
      ? telegramHref(contacts.telegram)
      : "https://t.me/kondor_pc";
  const instagramUrl = contacts?.instagramUrl
    ? ensureHttps(contacts.instagramUrl)
    : "https://www.instagram.com/kondor_pc";
  const youtubeUrl = contacts?.youtubeUrl
    ? ensureHttps(contacts.youtubeUrl)
    : "https://www.youtube.com/@kondorpc";

  const siteUrl = SITE_URL.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "@id": `${siteUrl}/#organization`,
    name: "Kondor PC",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: ORGANIZATION_LOGO_URL,
      width: ORGANIZATION_LOGO_WIDTH,
      height: ORGANIZATION_LOGO_HEIGHT,
    },
    foundingDate: "2020",
    telephone: phone,
    email,
    areaServed: "UA",
    sameAs: [telegramUrl, instagramUrl, youtubeUrl],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "customer service",
        areaServed: "UA",
        availableLanguage: "Ukrainian",
      },
      {
        "@type": "ContactPoint",
        email,
        contactType: "customer service",
        areaServed: "UA",
      },
      {
        "@type": "ContactPoint",
        url: telegramUrl,
        contactType: "customer service",
      },
    ],
  };
}

export function websiteJsonLd() {
  const siteUrl = SITE_URL.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Kondor PC",
    url: siteUrl,
    inLanguage: "uk-UA",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function webPageJsonLd({
  path,
  name,
}: {
  path: string;
  name: string;
}) {
  const siteUrl = SITE_URL.replace(/\/$/, "");
  const pathname =
    path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const url = `${siteUrl}${pathname}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name,
    url,
    inLanguage: "uk-UA",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export { howToAssemblyJsonLd } from "@/lib/seo/howToAssemblyJsonLd";
export { pcCatalogCollectionPageJsonLd } from "@/lib/seo/pcCatalogCollectionPageJsonLd";
export { pcBuildVideoObjectJsonLd } from "@/lib/seo/pcBuildVideoObjectJsonLd";
export { blogPostingJsonLd } from "@/lib/seo/blogPostingJsonLd";

export function productJsonLd(
  build: Build,
  imageUrl: string,
  options?: { gameLabels?: Record<string, string> },
) {
  return pcBuildProductJsonLd(build, imageUrl, options);
}

export function catalogProductJsonLd(
  item: CatalogProductDetail,
  options?: { imageUrl?: string },
) {
  const price = item.priceDiscount ?? item.price;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    ...(item.description ? { description: item.description } : {}),
    ...(options?.imageUrl ? { image: options.imageUrl } : {}),
    brand: { "@type": "Brand", name: "Kondor PC" },
    sku: item.id,
    category: item.category?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/catalog/${item.slug}`,
      priceCurrency: "UAH",
      price: String(price),
      availability: item.preorder
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Kondor PC",
      },
    },
  };
}

export type { FaqSchemaItem } from "@/lib/seo/faqSchema";

export function faqPageJsonLd(
  items: Faq[] | FaqSchemaItem[],
): object | null {
  const mainEntity = items
    .filter((f) => f.question?.trim() && f.answer?.trim())
    .map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
    }));

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function JsonLd({
  data,
}: {
  data: object | object[];
}) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
