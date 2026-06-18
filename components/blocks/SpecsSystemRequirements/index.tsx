import { SectionHeader } from "@/components/shared/SectionHeader";
import type { ResolvedPageContext } from "@/lib/data/types";
import type { GameSpecs } from "@/lib/data/types/game";
import { cn } from "@/lib/utils";

type Tone = "muted" | "primary" | "accent";

export function SpecsSystemRequirements({
  pageContext,
}: {
  pageContext: ResolvedPageContext;
}) {
  const game = pageContext.game;
  if (!game) return null;

  const columns: Array<{
    kicker: string;
    title: string;
    subtitle: string;
    tone: Tone;
    specs: GameSpecs;
  }> = [
    {
      kicker: "Мінімальні",
      title: "ГРА ЗАПУСТИТЬСЯ",
      subtitle: "30–60 FPS на низьких",
      tone: "muted",
      specs: game.minSpecs,
    },
    {
      kicker: "Рекомендовані",
      title: "КОМФОРТНА ГРА",
      subtitle: "144+ FPS на високих",
      tone: "primary",
      specs: game.recSpecs,
    },
    ...(game.competitiveSpecs
      ? [
          {
            kicker: "Для 240+ FPS",
            title: "COMPETITIVE",
            subtitle: "Стабільні 240–500+ FPS",
            tone: "accent" as const,
            specs: game.competitiveSpecs,
          },
        ]
      : []),
  ];

  const toneCard: Record<Tone, string> = {
    muted: "border-border bg-surface",
    primary: "border-brand-primary/30 bg-brand-primary/[0.04]",
    accent: "border-fps-orange/30 bg-fps-orange/[0.04]",
  };
  const toneKicker: Record<Tone, string> = {
    muted: "text-muted-foreground",
    primary: "text-brand-primary",
    accent: "text-fps-orange",
  };

  return (
    <div className="container-site py-16 md:py-20">
      <SectionHeader
        kicker="Системні вимоги"
        title={
          <>
            ЩО ПОТРІБНО ДЛЯ <span className="text-brand-primary">{game.nameUk}</span>
          </>
        }
        subtitle="Офіційні вимоги Valve плюс наша рекомендація для competitive-гри на 240+ FPS."
        titleClassName="mt-3"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((c) => (
          <article
            key={c.kicker}
            className={cn(
              "clip-angular-12 border p-6 transition-colors",
              toneCard[c.tone],
            )}
          >
            <div
              className={cn(
                "text-[10px] uppercase tracking-widest",
                toneKicker[c.tone],
              )}
            >
              {c.kicker}
            </div>
            <h3 className="mt-2 font-display text-[20px] font-bold uppercase tracking-tight leading-[120%]">
              {c.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>

            <dl className="mt-6 space-y-3 text-sm">
              <SpecRow label="CPU" value={c.specs.cpu} />
              <SpecRow label="GPU" value={c.specs.gpu} />
              <SpecRow label="RAM" value={c.specs.ram} />
              <SpecRow label="Storage" value={c.specs.storage} />
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
