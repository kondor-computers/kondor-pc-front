import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ResolvedPageContext } from "@/lib/data/types";

export function Breadcrumbs({
  pageContext,
}: {
  pageContext: ResolvedPageContext;
}) {
  return (
    <nav
      aria-label="Хлібні крихти"
      className="container-site py-7 lg:pt-9 text-xs text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center">
        <li>
          <Link href="/" className="hover:text-foreground">
            Головна
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="mx-1 inline size-3" />
        </li>
        <li>
          <Link
            href="/pidbir"
            className="hover:text-foreground"
          >
            Підбір
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="mx-1 inline size-3" />
        </li>
        <li aria-current="page" className="text-foreground">
          ПК для {pageContext.displayName}
        </li>
      </ol>
    </nav>
  );
}
