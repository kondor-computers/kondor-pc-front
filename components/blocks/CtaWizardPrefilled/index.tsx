import { SectionHeader } from "@/components/shared/SectionHeader";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import { BudgetChipLink } from "@/components/shared/BudgetChipLink";
import type { ResolvedPageContext } from "@/lib/data/types";

const BUDGET_BUCKETS = [
  { label: "До 40 000 ₴", href: "/pidbir/rezultat?budget=0-40" },
  { label: "40–80 000 ₴", href: "/pidbir/rezultat?budget=40-80" },
  { label: "80 000 ₴+", href: "/pidbir/rezultat?budget=80-200" },
];

export function CtaWizardPrefilled({
  heading,
  buttonText,
  pageContext,
}: {
  heading?: string;
  buttonText?: string;
  pageContext: ResolvedPageContext;
}) {
  const name = pageContext.displayName;
  const title = heading ?? "НЕ ЗНАЄШ ЯКУ ОБРАТИ?";
  const cta = buttonText ?? `Підібрати ПК для ${name}`;

  return (
    <div className="container-site py-16 md:py-20">
      <section className="relative overflow-hidden rounded-[40px] bg-brand-primary py-14 md:py-20">
        <div className="relative px-4">
          <SectionHeader
            align="center"
            kicker="Готовий?"
            title={title}
            subtitle={`Відповідай на 4 простих питання — покажемо 3 ідеальні варіанти під твій бюджет і ${name}. Підбір за 30 секунд.`}
            kickerClassName="text-black"
            titleClassName="text-black py-4 leading-[120%]"
            subtitleClassName="text-black/80 lg:max-w-[460px]"
            showKickerDot={false}
          />

          <div className="flex flex-col items-center justify-center gap-5 lg:flex-row">
            <TechButtonLink
              href={`/pidbir?ref=${pageContext.refSlug}`}
              size="md"
              variant="swap"
              className="h-[51px] w-full max-w-[360px] text-center"
            >
              {cta}
            </TechButtonLink>
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-2">
              {BUDGET_BUCKETS.map((b) => (
                <BudgetChipLink
                  key={b.href}
                  href={b.href}
                  className="tabular text-[12px]"
                >
                  {b.label}
                </BudgetChipLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
