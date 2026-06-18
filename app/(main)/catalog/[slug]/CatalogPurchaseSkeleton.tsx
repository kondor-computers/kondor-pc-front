export function CatalogPurchaseSkeleton() {
  return (
    <div className="mt-5 flex flex-col gap-5" aria-busy="true">
      <div className="h-[72px] animate-pulse rounded-md border border-border bg-surface/60" />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-12 flex-1 animate-pulse rounded-md bg-surface" />
        <div className="h-12 flex-1 animate-pulse rounded-md bg-surface" />
      </div>
    </div>
  );
}
