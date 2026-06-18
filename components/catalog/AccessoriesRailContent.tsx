import type { CatalogProductGroup } from "@/types/catalog";
import { CatalogCard } from "./CatalogCard";
import { AccessoriesRailMobileSlider } from "./AccessoriesRailMobileSlider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TechButtonLink } from "../shared/TechButtonPrimitives";
import ArrowIcon from "../icons/ArrowIcon";

export function AccessoriesRailContent({
  groups,
  title = "Зібрати з ПК",
  subtitle = "Аксесуари під твоє робоче місце — клавіатура, миша, поверхня.",
}: {
  groups: CatalogProductGroup[];
  title?: string;
  subtitle?: string;
}) {
  if (groups.length === 0) return null;

  return (
    <section className="pb-24 lg:pb-30">
      <div className="container-site">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            kicker="Аксесуари"
            title={title}
            subtitle={subtitle}
            className="mb-8"
            titleClassName="mt-3 lg:mt-7 mb-5 lg:mb-10 lg:text-[36px]"
            subtitleClassName="lg:max-w-[556px]"
          />
          <TechButtonLink
            href="/catalog"
            variant="white"
            className="w-full md:w-fit md:ml-auto h-[30px]"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap font-heading">
              Весь каталог
              <ArrowIcon className="mb-0.5" />
            </span>
          </TechButtonLink>
        </div>

        <AccessoriesRailMobileSlider groups={groups} />

        <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <CatalogCard key={group.key} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}
