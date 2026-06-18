import type { PageSeo } from "@/types/blogPost";
import type { Game } from "./game";
import type { UseCase } from "./useCase";

export type Section = {
  _type: string;
  _key: string;
  [k: string]: unknown;
};

export type LandingPageContextRef = {
  refType: "game" | "event" | "use_case";
  refSlug: string;
};

export type LandingPage = {
  slug: string;
  type: "game" | "event" | "use_case";
  context: LandingPageContextRef;
  internalTitle?: string;
  seo: PageSeo | null;
  /** Promo-only: after this date the page shows an expired banner. */
  expiresAt?: string;
  sections: Section[];
};

export type ResolvedPageContext = {
  refType: "game" | "event" | "use_case";
  refSlug: string;
  game?: Game;
  useCase?: UseCase;
  /** Human-readable name resolved from the underlying ref (game.nameUk / useCase.nameUk / refSlug). */
  displayName: string;
};
