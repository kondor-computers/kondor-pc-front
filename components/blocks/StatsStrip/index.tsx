type Stat = { value: string; label: string };

const DEFAULT_STATS: Stat[] = [
  { value: "5 000+", label: "збірок" },
  { value: "6 років", label: "на ринку" },
  { value: "64 тис.", label: "підписників" },
  { value: "500+", label: "відгуків" },
];

export function StatsStrip({ items }: { items?: Stat[] }) {
  const stats = items && items.length > 0 ? items : DEFAULT_STATS;
  return (
    <div className="container-site py-8">
      <div className="grid grid-cols-2 gap-4 clip-angular-12 border border-border bg-surface p-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="font-display text-[18px] sm:text-[24px] xl:text-[40px] font-bold tabular leading-none">
              {s.value}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
