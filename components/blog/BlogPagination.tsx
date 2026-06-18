import Link from "next/link";

/**
 * Server-rendered blog paginator using real <a> links (`/blog?page=N`).
 * Crawlable, works without JS, needs zero client JS. Next.js upgrades the links
 * to soft client-side navigation when JS is available. Page-button logic and
 * styling are kept identical to the previous client-side Pagination.
 */
function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

function getPageButtons(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    pages.push(1, 2, 3);
    if (currentPage === 3) pages.push(4);
    pages.push("...", totalPages - 1, totalPages);
  } else if (currentPage === 4) {
    pages.push(1, "...", 3, 4, 5, "...", totalPages - 1, totalPages);
  } else if (currentPage === totalPages - 3) {
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages - 1,
      totalPages,
    );
  } else if (currentPage === totalPages - 2) {
    pages.push(
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else if (currentPage >= totalPages - 1) {
    pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages - 1,
      totalPages,
    );
  }

  return pages;
}

const ARROW_BASE =
  "flex size-11 shrink-0 select-none items-center justify-center rounded-full border border-border text-foreground leading-none no-underline transition";
const ARROW_ENABLED =
  "cursor-pointer hover:border-brand-primary hover:text-brand-primary";
const ARROW_DISABLED = "cursor-not-allowed opacity-40";

const PAGE_BASE =
  "flex size-9 cursor-pointer select-none items-center justify-center rounded-full text-[14px] font-medium leading-none no-underline transition";

export default function BlogPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pageButtons = getPageButtons(currentPage, totalPages);
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  return (
    <nav
      aria-label="Сторінки"
      className={`${totalPages > 1 ? "flex" : "hidden"} mx-auto mt-10 items-center justify-center gap-3 lg:mt-16`}
    >
      {prevDisabled ? (
        <span aria-hidden className={`${ARROW_BASE} ${ARROW_DISABLED}`}>
          ‹
        </span>
      ) : (
        <Link
          href={pageHref(currentPage - 1)}
          aria-label="Попередня сторінка"
          className={`${ARROW_BASE} ${ARROW_ENABLED}`}
        >
          <span aria-hidden>‹</span>
        </Link>
      )}

      <div className="flex items-center gap-1.5">
        {pageButtons.map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-1 text-[14px] text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(Number(item))}
              aria-current={currentPage === item ? "page" : undefined}
              className={`${PAGE_BASE} ${
                currentPage === item
                  ? "bg-brand-primary text-primary-foreground"
                  : "text-foreground hover:text-brand-primary"
              }`}
            >
              {item}
            </Link>
          ),
        )}
      </div>

      {nextDisabled ? (
        <span aria-hidden className={`${ARROW_BASE} ${ARROW_DISABLED}`}>
          ›
        </span>
      ) : (
        <Link
          href={pageHref(currentPage + 1)}
          aria-label="Наступна сторінка"
          className={`${ARROW_BASE} ${ARROW_ENABLED}`}
        >
          <span aria-hidden>›</span>
        </Link>
      )}
    </nav>
  );
}
