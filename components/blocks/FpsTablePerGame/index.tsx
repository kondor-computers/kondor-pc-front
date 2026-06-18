import { SectionHeader } from "@/components/shared/SectionHeader";
import { getAllBuilds } from "@/lib/data/adapter";
import type { ResolvedPageContext } from "@/lib/data/types";
import type { FpsEntry, FpsResolution } from "@/lib/data/types/build";
import { cn } from "@/lib/utils";
import { formatUah } from "@/lib/format";

const PRESET_ORDER: Record<string, number> = {
  competitive: 5,
  high: 4,
  ultra: 3,
  medium: 2,
  low: 1,
};

function pickBest(
  fpsData: FpsEntry[],
  gameSlug: string,
  res: FpsResolution,
): FpsEntry | null {
  const matches = fpsData.filter(
    (e) => e.gameSlug === gameSlug && e.resolution === res,
  );
  if (matches.length === 0) return null;
  return [...matches].sort(
    (a, b) => PRESET_ORDER[b.preset] - PRESET_ORDER[a.preset],
  )[0];
}

function fpsTone(fps: number): { dot: string; text: string } {
  if (fps >= 240) return { dot: "bg-fps-green", text: "text-fps-green" };
  if (fps >= 144) return { dot: "bg-brand-primary", text: "text-brand-primary" };
  if (fps >= 60) return { dot: "bg-fps-yellow", text: "text-fps-yellow" };
  if (fps >= 30) return { dot: "bg-fps-orange", text: "text-fps-orange" };
  return { dot: "bg-fps-red", text: "text-fps-red" };
}

export async function FpsTablePerGame({
  resolutions = ["1080p", "1440p", "4K"],
  pageContext,
}: {
  resolutions?: FpsResolution[];
  pageContext: ResolvedPageContext;
}) {
  const builds = await getAllBuilds();
  const gameSlug = pageContext.refSlug;
  const gameName = pageContext.displayName;

  return (
    <div className="container-site py-16 md:py-20">
      <SectionHeader
        kicker="FPS у грі"
        title={
          <>
            СКІЛЬКИ FPS У <span className="text-brand-primary">{gameName}</span>
          </>
        }
        subtitle="Наші внутрішні тести на високих/competitive налаштуваннях. Цифри підтверджені відеозаписами процесу збірки."
        titleClassName="mt-3"
      />

      <div className="overflow-x-auto clip-angular-12 border border-border bg-surface">
        <table className="min-w-full divide-y divide-border text-sm tabular">
          <thead className="bg-background/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Збірка</th>
              {resolutions.map((r) => (
                <th key={r} className="px-5 py-3 font-medium">
                  {r}
                </th>
              ))}
              <th className="px-5 py-3 font-medium">Ціна</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {builds.map((b) => (
              <tr key={b.slug} className="transition-colors hover:bg-background/50">
                <td className="px-5 py-4">
                  <div className="font-heading text-lg font-bold uppercase tracking-wider">
                    {b.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {b.gpu.name}
                  </div>
                </td>
                {resolutions.map((r) => {
                  const entry = pickBest(b.fpsData, gameSlug, r);
                  if (!entry) {
                    return (
                      <td key={r} className="px-5 py-4 text-muted-foreground/50">
                        —
                      </td>
                    );
                  }
                  const tone = fpsTone(entry.fps);
                  return (
                    <td key={r} className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", tone.dot)} />
                        <span className={cn("font-bold", tone.text)}>
                          {entry.fps}
                        </span>
                        <span className="text-xs text-muted-foreground">FPS</span>
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {entry.preset}
                      </div>
                    </td>
                  );
                })}
                <td className="px-5 py-4">
                  <div className="font-bold">{formatUah(b.priceUah)} ₴</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Цифри отримані на наших тестових стендах. Реальні значення можуть відрізнятися ±5% залежно від драйверів і налаштувань ОС.
      </p>
    </div>
  );
}
