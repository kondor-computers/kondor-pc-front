/** Placeholder while ContactForm JS loads. */
export function ContactFormSkeleton() {
  return (
    <div
      className="space-y-3.5 rounded-lg border border-border bg-surface p-6"
      aria-busy="true"
      aria-label="Завантаження форми"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-20 rounded bg-muted/50" />
          <div className="h-10 w-full rounded-md bg-muted/30" />
        </div>
      ))}
      <div className="h-10 w-full rounded-md bg-muted/40" />
    </div>
  );
}
