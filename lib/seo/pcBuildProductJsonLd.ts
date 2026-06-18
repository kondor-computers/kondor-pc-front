import type { Build, Resolution } from "@/types/build";
import { SITE_URL } from "@/lib/seo/constants";

const TARGET_RESOLUTION_LABEL: Record<Resolution, string> = {
  fullhd: "Full HD 1920x1080",
  "2k": "2K 2560x1440",
  "4k": "4K 3840x2160",
};

const FPS_RESOLUTION_LABEL: Record<Resolution, string> = {
  fullhd: "Full HD",
  "2k": "2K",
  "4k": "4K",
};

function normalizeSiteUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

function productAvailability(status: Build["status"]): string {
  if (status === "in_stock") return "https://schema.org/InStock";
  if (status === "assemble_on_order") return "https://schema.org/PreOrder";
  return "https://schema.org/OutOfStock";
}

function formatGpuSpec(build: Build): string {
  const gpu = build.spec.gpu.trim();
  const vram = build.spec.gpuVram?.trim();
  if (vram && !gpu.toLowerCase().includes(vram.toLowerCase())) {
    return `${gpu} ${vram}`;
  }
  return gpu;
}

function formatRamSpec(build: Build): string {
  const ram = build.spec.ram.trim();
  const speed = build.spec.ramSpeed?.trim();
  return speed ? `${ram} ${speed}` : ram;
}

function getOsLabel(build: Build): string | undefined {
  const osComponent = build.components.find((c) => c.category === "os");
  if (osComponent?.displayName?.trim()) return osComponent.displayName.trim();
  const windowsBenefit = build.includedBenefits.find((b) => b.key === "windows");
  return windowsBenefit?.title?.trim();
}

function getWarrantyLabel(build: Build): string {
  const maxComponentMonths = build.components.reduce(
    (max, component) => Math.max(max, component.warrantyMonths ?? 0),
    0,
  );
  if (maxComponentMonths > 0) {
    return `${maxComponentMonths} місяців`;
  }

  const warrantyBenefit = build.includedBenefits.find((b) => b.key === "warranty");
  const fromBenefit = warrantyBenefit?.title
    ?.replace(/^гарантія\s*/iu, "")
    .trim();
  return fromBenefit || "12 місяців";
}

function buildProductDescription(build: Build): string {
  const fromSeo = build.seo?.metaDescription?.trim();
  if (fromSeo) return fromSeo;

  const descriptionParts = [
    `Ігровий ПК ${build.name}: ${build.spec.cpu}, ${formatGpuSpec(build)}, ${formatRamSpec(build)}, ${build.spec.storage}.`,
    build.shortTagline?.trim(),
  ].filter(Boolean);

  return descriptionParts.join(" ");
}

function buildAdditionalProperties(
  build: Build,
  gameLabels: Record<string, string>,
): Array<{ "@type": "PropertyValue"; name: string; value: string }> {
  const properties: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [
    { "@type": "PropertyValue", name: "CPU", value: build.spec.cpu },
    { "@type": "PropertyValue", name: "GPU", value: formatGpuSpec(build) },
    { "@type": "PropertyValue", name: "RAM", value: formatRamSpec(build) },
    { "@type": "PropertyValue", name: "SSD", value: build.spec.storage },
  ];

  const os = getOsLabel(build);
  if (os) {
    properties.push({ "@type": "PropertyValue", name: "OS", value: os });
  }

  properties.push(
    { "@type": "PropertyValue", name: "Warranty", value: getWarrantyLabel(build) },
    {
      "@type": "PropertyValue",
      name: "Build time",
      value: `${build.assemblyDays} робочі дні`,
    },
    {
      "@type": "PropertyValue",
      name: "Target resolution",
      value: TARGET_RESOLUTION_LABEL[build.targetResolution],
    },
  );

  for (const entry of build.fps) {
    if (entry.resolution !== build.targetResolution) continue;
    const gameName = gameLabels[entry.gameSlug] ?? entry.gameSlug;
    properties.push({
      "@type": "PropertyValue",
      name: `FPS ${gameName} ${FPS_RESOLUTION_LABEL[entry.resolution]}`,
      value: String(entry.fpsAvg),
    });
  }

  return properties;
}

export function pcBuildProductJsonLd(
  build: Build,
  imageUrl: string,
  options?: { gameLabels?: Record<string, string> },
) {
  const siteUrl = normalizeSiteUrl();
  const productUrl = `${siteUrl}/pk/${build.slug}`;
  const gameLabels = options?.gameLabels ?? {};
  const handlingMaxDays = Math.max(build.assemblyDays + 2, build.assemblyDays);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: build.name,
    description: buildProductDescription(build),
    image: imageUrl,
    sku: build.sku || build.slug,
    brand: {
      "@type": "Brand",
      name: "Kondor PC",
    },
    manufacturer: {
      "@id": `${siteUrl}/#organization`,
    },
    category: "Gaming PC",
    additionalProperty: buildAdditionalProperties(build, gameLabels),
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: "UAH",
      price: String(build.priceUah),
      availability: productAvailability(build.status),
      seller: {
        "@id": `${siteUrl}/#organization`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "UAH",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "UA",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: build.assemblyDays,
            maxValue: handlingMaxDays,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "UA",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };
}
