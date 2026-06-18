import { SectionHeader } from "@/components/shared/SectionHeader";
import type { ResolvedPageContext } from "@/lib/data/types";

export function SpecsGraphicsSettings({
  pageContext,
}: {
  pageContext: ResolvedPageContext;
}) {
  const game = pageContext.game;
  if (!game || game.graphicsSettings.length === 0) return null;

  return (
    <div className="container-site py-16 md:py-20">
      <SectionHeader
        kicker="Налаштування графіки"
        title={
          <>
            ЩО ЗМІНЮЮТЬ ПРЕСЕТИ У{" "}
            <span className="text-brand-primary">{game.nameUk}</span>
          </>
        }
        subtitle="Не всі налаштування рівноцінні. Червоним позначили ті, що найсильніше валять FPS — їх можна сміливо зменшувати."
        titleClassName="mt-3"
      />

      <div className="overflow-x-auto clip-angular-12 border border-border bg-surface">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Налаштування</th>
              <th className="px-5 py-3 font-medium">Low</th>
              <th className="px-5 py-3 font-medium">Medium</th>
              <th className="px-5 py-3 font-medium">High</th>
              <th className="px-5 py-3 font-medium">Ultra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {game.graphicsSettings.map((s) => (
              <tr key={s.name}>
                <td className="px-5 py-4">
                  <div className="font-medium">{s.name}</div>
                  {s.fpsImpact ? (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-fps-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fps-red">
                      ⚠ {s.fpsImpact}
                    </div>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{s.low}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.medium}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.high}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.ultra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
