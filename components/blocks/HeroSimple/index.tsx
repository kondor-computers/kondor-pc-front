import Image from "next/image";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import { cn } from "@/lib/utils";

type SimpleImage = { src: string; alt: string; caption?: string };
type Cta = { text?: string; href?: string };

/**
 * HeroSimple — універсальний верхній блок без прив'язки до продукту.
 *
 * H1 + підзаголовок + опціональна CTA-кнопка + опціональний фон.
 * Використовується на тестових і promo-сторінках із Sanity.
 */
export function HeroSimple({
  h1,
  subtitle,
  cta,
  bgImage,
}: {
  h1: string;
  subtitle?: string;
  cta?: Cta;
  bgImage?: SimpleImage;
}) {
  const hasCta = cta && cta.text && cta.href;

  return (
    <section className="relative overflow-hidden rounded-b-[28px]">
      {/* Background image with darkening overlay */}
      {bgImage ? (
        <>
          <Image
            src={bgImage.src}
            alt={bgImage.alt}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10 object-cover"
          />
          {/* Side-vignette: solid on the left for text readability,
              transparent on the right so the chassis stays vivid. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/60 to-transparent"
          />
          {/* Bottom fade for footer continuity. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent"
          />
        </>
      ) : (
        <>
          <div className="absolute bottom-[-160px] left-[-220px] size-[420px] rounded-full bg-[#00FFFE] blur-[110px] opacity-50" />
          <div className="absolute -bottom-[260px] right-[-200px] size-[460px] rounded-full bg-[#0097FF] blur-[110px] opacity-50" />
        </>
      )}

      <div className="container-site relative pt-8 pb-16 pt-12 lg:pb-28">
        <div className="max-w-3xl">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Готові ігрові ПК
            <span className="ml-3 inline-block size-2 rounded-full bg-brand-primary align-middle" />
          </div>
          <h1
            className={cn(
              "font-display text-[40px] font-bold uppercase leading-[1.02] tracking-tight",
              "md:text-6xl lg:text-[80px]",
            )}
          >
            {h1}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-xl text-[14px] font-light leading-[120%] text-muted-foreground lg:text-[16px]">
              {subtitle}
            </p>
          ) : null}

          {hasCta ? (
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <TechButtonLink
                href={cta!.href!}
                size="lg"
                className="h-[48px] w-full max-w-[360px]"
              >
                {cta!.text}
              </TechButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
