import Image from "next/image";
import { Play } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { CatalogProductDetail } from "@/types/catalog";

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {}
  return null;
}

export function CatalogDetailSections({ item }: { item: CatalogProductDetail }) {
  const ytEmbed = item.video?.url ? youtubeEmbed(item.video.url) : null;

  return (
    <>
      {(item.chars?.length > 0 || item.complect?.length > 0) && (
        <section className="border-t border-border bg-surface/30">
          <div className="container-site py-12 md:py-16">
            <div className="grid gap-10 md:grid-cols-2">
              {item.chars?.length > 0 && (
                <div>
                  <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Характеристики
                  </div>
                  <h2 className="mb-6 font-display text-2xl font-bold">
                    ТЕХНІЧНІ ДЕТАЛІ
                  </h2>
                  <dl className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
                    {item.chars.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <dt className="text-muted-foreground">{c.name}</dt>
                        <dd className="tabular text-right font-medium">
                          {c.char}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {item.complect?.length > 0 && (
                <div>
                  <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Що в коробці
                  </div>
                  <h2 className="mb-6 font-display text-2xl font-bold">
                    КОМПЛЕКТАЦІЯ
                  </h2>
                  <ul className="space-y-2">
                    {item.complect.map((c, i) => {
                      const iconUrl = c.icon?.asset
                        ? urlFor(c.icon)
                            .width(96)
                            .height(96)
                            .fit("max")
                            .quality(95)
                            .url()
                        : undefined;
                      return (
                        <li
                          key={i}
                          className="flex items-center gap-3 rounded-md border border-border bg-surface/80 px-3 py-2 text-sm"
                        >
                          <div className="relative flex size-8 shrink-0 items-center justify-center">
                            {iconUrl ? (
                              <Image
                                src={iconUrl}
                                alt=""
                                width={28}
                                height={28}
                                className="size-7 object-contain [filter:brightness(0)_invert(1)]"
                              />
                            ) : null}
                          </div>
                          <span className="flex-1">{c.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {ytEmbed && (
        <section className="border-t border-border">
          <div className="container-site py-12 md:py-16">
            <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Відео
            </div>
            <h2 className="mb-6 font-display text-2xl font-bold">
              ЯК ЦЕ ВИГЛЯДАЄ
            </h2>
            <div className="aspect-video overflow-hidden rounded-md border border-border bg-surface">
              <iframe
                src={ytEmbed}
                title={`${item.name} — відео`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </section>
      )}

      {!ytEmbed && item.video?.url && (
        <section className="border-t border-border">
          <div className="container-site py-8 md:py-12">
            <a
              href={item.video.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm transition hover:border-white/25"
            >
              <Play className="size-4" />
              Дивитись відео
            </a>
          </div>
        </section>
      )}
    </>
  );
}
