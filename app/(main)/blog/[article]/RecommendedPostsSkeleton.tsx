export function RecommendedAsideSkeleton() {
  return (
    <aside
      className="hidden w-80 shrink-0 pt-10 lg:block"
      aria-busy="true"
    >
      <div className="mb-6 h-5 w-32 animate-pulse rounded bg-surface" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-border bg-surface/60"
          />
        ))}
      </div>
    </aside>
  );
}
