import { SectionHeader } from "@/components/shared/SectionHeader";
import { getTestimonialsByGameTag } from "@/lib/data/adapter";
import type { ResolvedPageContext } from "@/lib/data/types";
import type { TestimonialSource } from "@/lib/data/types/testimonial";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<TestimonialSource, string> = {
  google_maps: "Google Maps",
  telegram: "Telegram",
  instagram: "Instagram",
};

const SOURCE_TONE: Record<TestimonialSource, string> = {
  google_maps: "border-fps-yellow/40 text-fps-yellow",
  telegram: "border-brand-primary/40 text-brand-primary",
  instagram: "border-sku-vega/40 text-[var(--sku-vega)]",
};

export async function SocialTestimonialForGame({
  limit = 2,
  pageContext,
}: {
  limit?: number;
  pageContext: ResolvedPageContext;
}) {
  const items = await getTestimonialsByGameTag(pageContext.refSlug, limit);
  if (items.length === 0) return null;

  return (
    <div className="container-site py-16 md:py-20">
      <SectionHeader
        kicker="Відгуки"
        title={
          <>
            ЩО ПИШУТЬ КЛІЄНТИ ПРО ЗБІРКИ ПІД{" "}
            <span className="text-brand-primary">
              {pageContext.displayName}
            </span>
          </>
        }
        titleClassName="mt-3"
      />

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((t) => (
          <article
            key={t.id}
            className="card-frame-md flex h-full flex-col gap-4 p-6"
          >
            <header className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{t.author}</div>
                {t.verified ? (
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-fps-green">
                    <svg
                      aria-hidden
                      className="size-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Перевірено
                  </div>
                ) : null}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border bg-background/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  SOURCE_TONE[t.source],
                )}
              >
                {SOURCE_LABEL[t.source]}
              </span>
            </header>

            <p className="text-sm leading-relaxed text-muted-foreground">
              «{t.body}»
            </p>

            {t.buildSlug ? (
              <div className="mt-auto border-t border-border pt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                Збірка · {t.buildSlug.toUpperCase()}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
