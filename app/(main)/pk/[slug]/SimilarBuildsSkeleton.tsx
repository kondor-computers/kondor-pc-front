export function SimilarBuildsSkeleton() {
  return (
    <section className="container-site pt-[92px] lg:pt-30 lg:pb-[77px]" aria-hidden>
      <div className="mb-8 h-10 w-72 rounded bg-muted/40" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[280px] rounded-lg bg-muted/30" />
        ))}
      </div>
    </section>
  );
}
