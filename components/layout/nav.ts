/**
 * Site-wide primary navigation.
 * Single source of truth — consumed by Header (desktop), MobileMenu (burger),
 * and Footer. Edit here, all three update at once.
 *
 * «Промо» group is populated at runtime from Sanity `/promo/*` pages via
 * `buildNav()` in layouts. `/game-pc/*` landings are shown on `/pidbir` only.
 */

export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; children: NavLink[] };
export type NavEntry = NavLink | NavGroup;

export const isNavGroup = (n: NavEntry): n is NavGroup => "children" in n;

const PIDBIRKY_GROUP_LABEL = "Підбірки";
const PROMO_GROUP_LABEL = "Промо";

/** Static nav entries — everything except dynamic Sanity groups. */
const STATIC_NAV: NavEntry[] = [
  { href: "/pk", label: "Ігрові ПК" },
  { href: "/catalog", label: "Аксесуари" },
  { href: "/pidbir", label: "Підбір" },
  { href: "/sborka", label: "Кастомна збірка" },
  { href: "/blog", label: "Блог" },
  {
    label: "Сервіс",
    children: [
      { href: "/garantiya", label: "Гарантія" },
      { href: "/dostavka-oplata", label: "Доставка та оплата" },
      { href: "/kontakty", label: "Контакти" },
    ],
  },
];

/** Fallback when Sanity is unavailable (dev / empty dataset). */
export const NAV: NavEntry[] = buildNav([], []);

function optionalGroup(label: string, links: NavLink[]): NavGroup | null {
  return links.length > 0 ? { label, children: links } : null;
}

/** Merge static nav with Sanity-driven «Підбірки» and «Промо» links. */
export function buildNav(
  pidbirkyLinks: NavLink[],
  promoLinks: NavLink[] = [],
): NavEntry[] {
  const beforeBlog = STATIC_NAV.slice(0, 4);
  const afterDynamic = STATIC_NAV.slice(4);

  const dynamicGroups = [
    optionalGroup(PIDBIRKY_GROUP_LABEL, pidbirkyLinks),
    optionalGroup(PROMO_GROUP_LABEL, promoLinks),
  ].filter((g): g is NavGroup => g !== null);

  return [...beforeBlog, ...dynamicGroups, ...afterDynamic];
}

/** Footer column layout derived from nav entries. */
export function buildNavColumns(nav: NavEntry[]) {
  const flat: NavLink[] = [];
  const groups: { title: string; links: NavLink[] }[] = [];
  for (const item of nav) {
    if (isNavGroup(item)) {
      groups.push({ title: item.label, links: item.children });
    } else {
      flat.push(item);
    }
  }
  return [{ title: "Розділи", links: flat }, ...groups];
}
