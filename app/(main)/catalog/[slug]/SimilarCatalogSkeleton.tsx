export function SimilarCatalogSkeleton() {
  return (
    <section className="container-site py-12 md:py-16" aria-hidden>
      <div className="mb-6 h-10 w-56 rounded bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted/30" />
        ))}
      </div>
    </section>
  );
}
