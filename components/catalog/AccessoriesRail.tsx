import { getAddonItems } from "@/lib/sanity/fetchers";
import { groupProducts } from "@/lib/catalog/group";
import { AccessoriesRailContent } from "./AccessoriesRailContent";

/**
 * Server component — fetches the global `showonaddons` pool from Sanity
 * and renders a 4-up grid. Mirrors legacy Kondor Devices behavior:
 * "accessories" is a single curated pool, not per-PC references.
 */
export async function AccessoriesRail({
  title = "Зібрати з ПК",
  subtitle = "Аксесуари під твоє робоче місце — клавіатура, миша, поверхня.",
  limit = 4,
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const addons = await getAddonItems();
  if (!addons || addons.length === 0) return null;

  const groups = groupProducts(addons).slice(0, limit);

  return (
    <AccessoriesRailContent groups={groups} title={title} subtitle={subtitle} />
  );
}
