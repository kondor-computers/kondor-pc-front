/** Placeholder while CustomBuildForm JS loads. */
export function CustomBuildFormSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Завантаження форми">
      <div className="h-[140px] rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 h-4 w-36 rounded bg-muted/50" />
        <div className="mb-3 h-4 w-full rounded bg-muted/30" />
        <div className="h-1.5 w-full rounded-full bg-muted/40" />
      </div>
      <div className="h-[200px] rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 h-4 w-32 rounded bg-muted/50" />
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 rounded-md bg-muted/30" />
          ))}
        </div>
      </div>
      <div className="h-[52px] rounded-lg bg-muted/40" />
    </div>
  );
}
