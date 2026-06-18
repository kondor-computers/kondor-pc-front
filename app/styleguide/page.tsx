import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/Wordmark";
import { SpecPill, type SpecRow } from "@/components/shared/SpecPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TechButton } from "@/components/shared/TechButton";
import { SKU_ACCENTS, type SkuSlug } from "@/lib/sku-accents";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const PALETTE_ROWS = [
  { name: "background", role: "canvas" },
  { name: "surface", role: "card base" },
  { name: "surface-elevated", role: "elevated surface" },
  { name: "muted", role: "subtle bg" },
  { name: "border", role: "dividers" },
  { name: "foreground", role: "primary text / CTA" },
  { name: "muted-foreground", role: "secondary text" },
  { name: "ring", role: "focus ring" },
  { name: "destructive", role: "errors / danger" },
];

const SKU_ORDER: SkuSlug[] = [
  "vega",
  "hyper",
  "nebula",
  "orbitra",
  "nyx",
  "velar",
  "pulsar",
  "comet",
];

const FPS_ROWS = [
  { label: "144+ FPS", note: "комфортно для кіберспорту", color: "var(--fps-green)" },
  { label: "60–143 FPS", note: "грається стабільно", color: "var(--fps-yellow)" },
  { label: "30–59 FPS", note: "на знижених налаштуваннях", color: "var(--fps-orange)" },
  { label: "< 30 FPS", note: "не рекомендуємо", color: "var(--fps-red)" },
];

const SAMPLE_SPECS: SpecRow[] = [
  { key: "cpu", value: "Ryzen 5 7500F" },
  { key: "gpu", value: "RTX 5060", note: "8 GB" },
  { key: "ram", value: "32 GB DDR5", note: "6000 MHz" },
  { key: "storage", value: "1 TB NVMe" },
];

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-12">
      <div className="mb-8">
        {kicker && (
          <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  role,
  cssVar,
}: {
  name: string;
  role: string;
  cssVar: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-border bg-surface p-3">
      <div
        className="size-12 shrink-0 rounded-md ring-1 ring-inset ring-white/10"
        style={{ background: cssVar }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-body text-sm text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

function SkuChip({ slug }: { slug: SkuSlug }) {
  return (
    <div
      className="group relative overflow-hidden rounded-md border border-border bg-surface p-4 transition hover:border-white/15"
      style={{ ["--sku" as string]: SKU_ACCENTS[slug] }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--sku)" }}
      />
      <div
        aria-hidden
        className="absolute -right-8 -top-8 size-24 rounded-full opacity-40 blur-2xl"
        style={{ background: "var(--sku)" }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="font-display text-lg font-bold uppercase tracking-wider">
            {slug}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            --sku-{slug}
          </div>
        </div>
        <div
          className="size-6 rounded-full ring-2 ring-background"
          style={{ background: "var(--sku)" }}
        />
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <header className="mb-16 flex flex-col gap-6">
        <Wordmark size="xl" />
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            internal — not for production
          </div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            Design system preview
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Тимчасові токени на основі Instagram. Коли клієнт надасть брендбук і
            логотип — колір, шрифти та радіуси зміняться у двох файлах
            (<code className="font-body text-xs">globals.css</code> і{" "}
            <code className="font-body text-xs">layout.tsx</code>) без правок
            компонентів.
          </p>
        </div>
      </header>

      {/* TYPOGRAPHY */}
      <Section kicker="01" title="Typography">
        <div className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-6">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Display · Unbounded
            </div>
            <div className="font-display text-5xl font-bold md:text-6xl">
              Знайдемо ПК під твої ігри
            </div>
            <div className="mt-6 font-display text-3xl font-bold">
              Характеристики без компромісів
            </div>
            <div className="mt-4 font-display text-xl font-semibold">
              Нова збірка — NEBULA
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-6">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Body · Montserrat
            </div>
            <p className="text-lg">
              Збираємо готові ігрові ПК з реальними FPS-тестами. Гарантія 12
              місяців від Kondor PC плюс гарантія виробника.
            </p>
            <p className="mt-3 text-base text-muted-foreground">
              Підбір за 30 секунд: обери гру, обери бюджет — покажемо 3–5
              варіантів з реальними FPS у Full HD, 2K і 4K.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Менший текст для підписів, мікротексту під кнопками, підказок у
              формах.
            </p>
          </div>

          <div className="tabular rounded-md border border-border bg-surface p-6">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Tabular · specs · prices
            </div>
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Ціна</div>
                <div className="font-display text-3xl font-bold">34 990 ₴</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">CS2 · 1080p</div>
                <div className="font-display text-3xl font-bold">380</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Warzone · 1440p</div>
                <div className="font-display text-3xl font-bold">130</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cyberpunk · 4K</div>
                <div className="font-display text-3xl font-bold">60</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* PALETTE */}
      <Section kicker="02" title="Palette — neutral base">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTE_ROWS.map((row) => (
            <Swatch
              key={row.name}
              name={`--${row.name}`}
              role={row.role}
              cssVar={`var(--${row.name})`}
            />
          ))}
        </div>
      </Section>

      {/* SKU ACCENTS */}
      <Section
        kicker="03"
        title="SKU accents"
      >
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Бренд сам по собі нейтральний. Колір приходить від SKU — як у
          Instagram, де кожна збірка живе своїм акцентом, а не обов&apos;язковим
          кольором сайту.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SKU_ORDER.map((slug) => (
            <SkuChip key={slug} slug={slug} />
          ))}
        </div>
      </Section>

      {/* FPS COLORS */}
      <Section
        kicker="04"
        title="FPS indicator colors"
      >
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Основний UX-якір таблиці FPS на картці ПК. Новачок не знає, чи 60 FPS
          це добре — маркери читають статус миттєво.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FPS_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-start gap-3 rounded-md border border-border bg-surface p-4"
            >
              <div
                className="mt-0.5 size-4 shrink-0 rounded-full"
                style={{ background: row.color }}
              />
              <div>
                <div className="font-display text-base font-semibold">
                  {row.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {row.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* RADII */}
      <Section kicker="05" title="Radii & Surfaces">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "sm", class: "rounded-sm" },
            { name: "md", class: "rounded-md" },
            { name: "lg", class: "rounded-lg" },
            { name: "xl", class: "rounded-xl" },
          ].map((r) => (
            <div
              key={r.name}
              className={`flex h-24 items-center justify-center border border-border bg-surface-elevated ${r.class}`}
            >
              <span className="font-body text-xs text-muted-foreground">
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* BUTTONS */}
      <Section kicker="06" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Купити зараз</Button>
          <Button variant="secondary">В кошик</Button>
          <Button variant="outline">Детальніше</Button>
          <Button variant="ghost">Скасувати</Button>
          <Button variant="link">Показати все</Button>
          <Button variant="destructive">Видалити</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large CTA</Button>
        </div>
      </Section>

      {/* BADGES */}
      <Section kicker="07" title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>В наявності</Badge>
          <Badge variant="secondary">Збираємо під замовлення</Badge>
          <Badge variant="outline">Рекомендовано</Badge>
          <Badge variant="destructive">-10%</Badge>
        </div>
      </Section>

      {/* TECH BUTTON */}
      <Section kicker="07·½" title="Tech button — angular CTA">
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Кутова CTA з chamfer-маскою. На мобілці текст{" "}
          <code className="font-body text-xs">12px</code> (<code className="font-body text-xs">text-xs</code>
          ), на десктопі — за розміром. Варіанти:{" "}
          <code className="font-body text-xs">primary</code> (cyan fill / black text → hover black fill,
          cyan border + text),{" "}
          <code className="font-body text-xs">inverse</code> (стани навпаки),{" "}
          <code className="font-body text-xs">swap</code> (чорний fill / cyan text → hover обмін
          fill і edge). Ховер: <code className="font-body text-xs">duration-300 ease-out</code>.
          Проп <code className="font-body text-xs">accent</code> — колір рамки.
        </p>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <TechButton variant="primary" size="md">
              Primary
            </TechButton>
            <TechButton variant="inverse" size="md">
              Inverse
            </TechButton>
            <TechButton variant="swap" size="md">
              Swap
            </TechButton>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <TechButton variant="primary" size="sm">
              sm
            </TechButton>
            <TechButton variant="primary" size="md">
              md
            </TechButton>
            <TechButton variant="primary" size="lg">
              lg
            </TechButton>
            <TechButton variant="primary" disabled>
              Disabled
            </TechButton>
          </div>
        </div>
      </Section>

      {/* SPEC PILL — the key pattern */}
      <Section
        kicker="08"
        title="Spec pill — ключовий IG-патерн"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <SpecPill specs={SAMPLE_SPECS} />
          </div>
          <div className="text-sm text-muted-foreground">
            Повторює структуру Instagram-плитки: 2×2 сітка специфікацій з
            іконками, табулярними цифрами і короткими примітками (частота, обсяг
            VRAM). Фон — surface-elevated з тонкою роздільною сіткою через{" "}
            <code className="font-body text-xs">gap-px</code> + border color,
            без важких ліній. Використовується в каталозі, на картці ПК, в
            результатах підбору, в кошику.
          </div>
        </div>
      </Section>

      {/* FORM SAMPLE */}
      <Section kicker="09" title="Form elements">
        <div className="grid max-w-lg gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Імʼя</Label>
            <Input id="name" placeholder="Іван Петренко" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" placeholder="+380 95 000 00 00" />
            <p className="text-xs text-muted-foreground">
              Менеджер зателефонує для підтвердження
            </p>
          </div>
        </div>
      </Section>

      {/* CARD SAMPLE — SKU card preview */}
      <Section
        kicker="10"
        title="SKU card preview (without photography)"
      >
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Без фото корпусів від клієнта — картка тримається на геометрії,
          типографіці та акцентному світлі SKU. Коли прийдуть реальні PNG
          корпусів, вони лягають у прозору область зверху; фон і glow
          залишаються.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKU_ORDER.slice(0, 3).map((slug) => {
            const names = {
              vega: "VEGA",
              hyper: "HYPER",
              nebula: "NEBULA",
              orbitra: "ORBITRA",
              nyx: "NYX",
              velar: "VELAR",
              pulsar: "PULSAR",
              comet: "COMET",
            } as const;
            const prices = {
              vega: "34 990",
              hyper: "31 990",
              nebula: "49 990",
              orbitra: "89 990",
              nyx: "26 990",
              velar: "109 990",
              pulsar: "74 990",
              comet: "21 990",
            } as const;
            const taglines = {
              vega: "Full HD геймінг",
              hyper: "Intel-альтернатива",
              nebula: "2K без компромісів",
              orbitra: "4K геймінг та стрім",
              nyx: "Найдоступніший",
              velar: "Флагман на AMD",
              pulsar: "Для стрімінгу",
              comet: "Перший ПК",
            } as const;
            return (
              <Card
                key={slug}
                className="sku-glow relative overflow-hidden border-border bg-surface p-0"
                style={{ ["--sku" as string]: SKU_ACCENTS[slug] }}
              >
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl"
                  style={{ background: "var(--sku)" }}
                />
                <div className="relative flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-2xl font-bold uppercase tracking-wider">
                        {names[slug]}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {taglines[slug]}
                      </div>
                    </div>
                    <div
                      className="size-3 rounded-full"
                      style={{ background: "var(--sku)" }}
                    />
                  </div>

                  <div
                    aria-hidden
                    className="relative flex h-40 items-center justify-center rounded-md border border-border bg-background/60"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      chassis photo
                    </div>
                  </div>

                  <SpecPill specs={SAMPLE_SPECS} />

                  <div className="flex items-end justify-between pt-1">
                    <div className="tabular">
                      <div className="font-display text-2xl font-bold">
                        {prices[slug]} ₴
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        або 4 × частинами
                      </div>
                    </div>
                    <Button size="sm">Детальніше</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <footer className="mt-24 border-t border-border pt-8 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <Wordmark size="sm" />
          <span>
            Next.js 15 · React 19 · Tailwind 4 · shadcn — dark-only MVP
          </span>
        </div>
      </footer>
    </div>
  );
}
