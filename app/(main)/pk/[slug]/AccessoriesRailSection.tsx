import { Suspense } from "react";
import { AccessoriesRail } from "@/components/catalog/AccessoriesRail";

function AccessoriesRailSkeleton() {
  return (
    <section className="pb-24 lg:pb-30" aria-busy="true" aria-hidden>
      <div className="container-site">
        <div className="mb-8 h-10 w-64 rounded bg-muted/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg bg-muted/30" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AccessoriesRailSection({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Suspense fallback={<AccessoriesRailSkeleton />}>
      <AccessoriesRail title={title} subtitle={subtitle} limit={4} />
    </Suspense>
  );
}
