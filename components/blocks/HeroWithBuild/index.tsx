import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import type { ResolvedPageContext } from "@/lib/data/types";
import { BuildCardSingle } from "@/components/blocks/BuildCardSingle";

export async function HeroWithBuild({
  h1,
  subtitle,
  buildSlug,
  pageContext,
}: {
  h1?: string;
  subtitle?: string;
  buildSlug: string;
  pageContext: ResolvedPageContext;
}) {
  const heading = h1 ?? `ПК ДЛЯ ${pageContext.displayName.toUpperCase()}`;

  return (
    <section className="relative overflow-hidden rounded-b-[28px]">
      <div className="absolute bottom-[-160px] left-[-220px] size-[420px] rounded-full bg-[#00FFFE] blur-[110px] opacity-60" />
      <div className="absolute -bottom-[260px] right-[-200px] size-[460px] rounded-full bg-[#0097FF] blur-[110px] opacity-60" />
      <div className="hidden md:block absolute -bottom-[300px] right-[-400px] size-[680px] rounded-full bg-[#005996] blur-[220px] opacity-70" />

      <div className="container-site relative grid gap-10 pt-8 pb-10 lg:pt-12 lg:pb-16 sm:grid-cols-[1.3fr_1fr] md:items-center lg:gap-12">
        <div>
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Готові ігрові ПК
            <span className="ml-3 inline-block size-2 rounded-full bg-brand-primary align-middle" />
          </div>
          <h1 className="font-display text-[40px] font-bold uppercase leading-[1.02] tracking-tight md:text-6xl lg:text-[88px]">
            {heading}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-md text-[14px] font-light leading-[120%] text-muted-foreground lg:text-[16px]">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <TechButtonLink
              href={`/pidbir?ref=${pageContext.refSlug}`}
              size="lg"
              className="w-full sm:max-w-[360px] lg:max-w-[420px] h-[48px] text-[12px] md:text-[14px]"
            >
              ПІДІБРАТИ ПК ЗА 30 СЕКУНД
            </TechButtonLink>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>або одразу дивись збірки під {pageContext.displayName}:</span>
            <a
              href="#builds"
              className="text-brand-primary transition-colors hover:text-foreground"
            >
              ↓ нижче
            </a>
          </div>
        </div>

        <div className="relative">
          <BuildCardSingle
            buildSlug={buildSlug}
            variant="full"
            pageContext={pageContext}
          />
        </div>
      </div>
    </section>
  );
}
