import { SectionHeader } from "@/components/shared/SectionHeader";
import type { FeatureItem } from "@/lib/data/types/content";
import { cn } from "@/lib/utils";

type Columns = 2 | 3 | 4;

const COL_CLASS: Record<Columns, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function FeatureList({
  heading,
  subheading,
  columns = 3,
  features,
}: {
  heading?: string;
  subheading?: string;
  columns?: Columns;
  features: FeatureItem[];
}) {
  return (
    <div className="container-site py-16 md:py-20">
      {heading ? (
        <SectionHeader
          kicker="Переваги"
          title={heading}
          subtitle={subheading}
          titleClassName="mt-3"
        />
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8",
          COL_CLASS[columns],
        )}
      >
        {features.map((f, i) => (
          <article
            key={i}
            className="clip-angular-12 border border-border bg-surface p-6 transition-colors hover:border-brand-primary/40"
          >
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
              <FeatureIcon icon={f.icon} />
            </div>
            <h3 className="font-heading text-[16px] font-semibold uppercase leading-[120%] tracking-wide text-foreground">
              {f.title}
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {f.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function FeatureIcon({ icon }: { icon: string }) {
  // emoji passthrough
  if (icon && /^\p{Extended_Pictographic}/u.test(icon)) {
    return <span className="text-xl">{icon}</span>;
  }
  // lucide:* — fallback to shield until lucide is wired
  const key = icon?.startsWith("lucide:") ? "shield" : icon;
  const svg = ICONS[key as keyof typeof ICONS] ?? ICONS.shield;
  return (
    <svg
      {...ICON_PROPS}
      className="size-5 text-brand-primary"
      aria-hidden
    >
      {svg}
    </svg>
  );
}

const ICONS = {
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  tools: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2-2 3-3z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2z" />
      <path d="M20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2z" />
      <path d="M18 18v1a3 3 0 0 1-3 3h-2" />
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
};
