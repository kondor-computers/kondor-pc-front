import type { Build } from "@/types/build";

/** Server-rendered product title — paints before configurator client JS. */
export function BuildHeroTitle({ build }: { build: Build }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Ігровий ПК · {build.tier}
      </div>
      <h1 className="break-words font-display text-[40px] lg:text-[60px] font-bold uppercase leading-none tracking-tight">
        {build.name}
      </h1>
      <p className="mt-3 lg:mt-2 text-[16px] lg:text-[18px] text-muted-foreground">
        {build.shortTagline}
      </p>
    </div>
  );
}
