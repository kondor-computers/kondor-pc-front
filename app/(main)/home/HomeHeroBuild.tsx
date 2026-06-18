import { BuildHeroCard } from "@/components/shared/BuildHeroCard";
import type { Build } from "@/types/build";

export function HomeHeroBuild({ build }: { build: Build }) {
  return (
    <BuildHeroCard
      build={build}
      variant="full"
      priority
      highlightGames={["cs2", "warzone", "cyberpunk"]}
    />
  );
}
