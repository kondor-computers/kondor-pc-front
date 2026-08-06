import { SanityImage } from "@/components/shared/SanityImage";

/** Server-rendered LCP frame — direct Sanity CDN, no /_next/image hop. */
export function CatalogHeroLcpImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="card-frame-md relative aspect-square w-full overflow-hidden bg-surface/40">
      <SanityImage
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 640px, 90vw"
        quality={80}
        priority
        className="object-cover"
      />
    </div>
  );
}
