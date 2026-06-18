type AnchorItem = { label: string; anchor: string };

export function AnchorNav({ items }: { items: AnchorItem[] }) {
  return (
    <nav
      aria-label="Розділи сторінки"
      className="sticky top-0 z-30 py-8 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container-site overflow-x-auto">
        <ul className="flex min-w-max items-center gap-1 py-2 text-[12px] uppercase tracking-wider">
          {items.map((it) => (
            <li key={it.anchor}>
              <a
                href={`#${it.anchor}`}
                className="font-heading inline-block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-brand-primary"
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
