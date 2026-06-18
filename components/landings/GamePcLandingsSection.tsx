import { SectionHeader } from "@/components/shared/SectionHeader";
import type { LandingPagePreview } from "@/lib/sanity/landingAdapter";
import LandingCard from "./LandingCard";

interface GamePcLandingsSectionProps {
  landings: LandingPagePreview[];
}

export default function GamePcLandingsSection({ landings }: GamePcLandingsSectionProps) {
  if (!landings.length) return null;

  return (
    <section className="container-site scroll-mt-24 py-16 md:py-24">
      <SectionHeader
        kicker="Підбірки"
        title="ПІДБІР ПК ПІД ТВОЇ ЗАДАЧІ"
        subtitle="Готові підбірки за іграми, бюджетом та сценаріями використання."
        className="mb-10 lg:mb-12"
      />
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {landings.map((landing) => (
          <li key={landing.slug}>
            <LandingCard landing={landing} />
          </li>
        ))}
      </ul>
    </section>
  );
}
