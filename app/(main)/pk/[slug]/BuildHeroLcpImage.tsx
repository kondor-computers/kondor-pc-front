import { SanityImage } from "@/components/shared/SanityImage";
import { lcpImageUrl } from "@/lib/sanity/lcpImageUrl";

/** Server-rendered LCP frame — paints before ProductGallery client JS. */
export function BuildHeroLcpImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div
      className="sku-glow relative aspect-[4/3] w-full overflow-hidden rounded-lg"
      style={{ ["--sku" as string]: "var(--brand-primary)" }}
    >
      <SanityImage
        src={lcpImageUrl(src)}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 620px, 90vw"
        quality={80}
        priority
        className="object-cover"
      />
    </div>
  );
}
