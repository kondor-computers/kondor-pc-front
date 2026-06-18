import {BLOCKS} from "@/components/blocks";
import type {LandingPage, ResolvedPageContext, Section} from "@/lib/data/types";

/**
 * LandingPageBody — shared section renderer for /game-pc/[slug] and /promo/[slug].
 *
 * Iterates `page.sections` and looks each up in the `BLOCKS` registry by
 * `_type`. Unknown types are skipped (with a dev-only warning). Sections
 * with `anchor` are wrapped in a `<section id={anchor}>` for in-page nav.
 */
export function LandingPageBody({
  page,
  pageContext,
}: {
  page: LandingPage;
  pageContext: ResolvedPageContext;
}) {
  return (
    <>
      {page.sections.map((section: Section) => {
        const Block = BLOCKS[section._type];
        if (!Block) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[landing/${page.slug}] unknown block _type: ${section._type}`,
            );
          }
          return null;
        }
        const {_type, _key, anchor, ...rest} = section as Section & {
          anchor?: string;
        };
        void _type;
        const body = <Block {...rest} pageContext={pageContext} />;
        return anchor ? (
          <section key={_key} id={anchor} aria-label={anchor}>
            {body}
          </section>
        ) : (
          <div key={_key}>{body}</div>
        );
      })}
    </>
  );
}
