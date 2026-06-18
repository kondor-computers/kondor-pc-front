import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href: string };

interface BlogBreadcrumbsProps {
  crumbs: Crumb[];
}

export default function BlogBreadcrumbs({ crumbs }: BlogBreadcrumbsProps) {
  return (
    <nav
      aria-label="Хлібні крихти"
      className="container-site py-7 lg:pt-9 text-xs text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.href}-${i}`}>
              {isLast ? (
                <li
                  aria-current="page"
                  className="line-clamp-1 max-w-[60vw] text-foreground"
                >
                  {crumb.label}
                </li>
              ) : (
                <li>
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                </li>
              )}
              {!isLast ? (
                <li aria-hidden>
                  <ChevronRight className="mx-1 inline size-3" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
