/**
 * Portable Text renderer config for blog articles.
 * Ported from nbyg-front (preserve names: getBlogPortableTextComponents,
 * BLOG_CONTENT_IMAGE_SIZES, etc.).
 *
 * Renders Kondor PC-themed markup — typography uses font-display for h2 and
 * font-heading for h3, accent colour from brand-primary, body in muted-foreground.
 */
import type { PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import type {
  BlogPostContentFaqAnswerButton,
  BlogPostContentGallerySection,
  BlogPostContentImage,
  BlogPostContentTable,
} from "@/types/blogPost";
import { contentImageUrl } from "@/lib/sanity/contentClient";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";

const BLOG_CONTENT_IMAGE_SIZES =
  "(max-width: 1024px) 100vw, min(896px, calc(100vw - 8rem))";

function blogContentImageUrl(image: BlogPostContentImage) {
  return contentImageUrl(image).width(1920).fit("max").auto("format").url();
}

export const getBlogPortableTextComponents = (
  slug: string,
): Partial<PortableTextComponents> => ({
  block: {
    normal: ({ children, value }) => {
      const key = `${slug}-${value?._key || `p-${Math.random()}`}`;
      return (
        <p key={key} className="mt-4 text-[14px] leading-[160%] text-muted-foreground lg:text-[16px]">
          {children}
        </p>
      );
    },
    h2: ({ children, value }) => {
      const key = `${slug}-${value?._key || `h2-${Math.random()}`}`;
      const getTextFromChildren = (node: React.ReactNode): string => {
        if (typeof node === "string") return node;
        if (typeof node === "number") return String(node);
        if (Array.isArray(node)) return node.map(getTextFromChildren).join("");
        if (React.isValidElement(node)) {
          const props = node.props as { children?: React.ReactNode };
          if (props?.children) return getTextFromChildren(props.children);
        }
        return "";
      };
      const titleText = getTextFromChildren(children) || "";

      return (
        <h2
          key={key}
          className="mt-12 mb-4 font-display text-[24px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[36px]"
        >
          {titleText}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const key = `${slug}-${value?._key || `h3-${Math.random()}`}`;
      return (
        <h3
          key={key}
          className="mt-8 mb-3 font-heading text-[18px] font-semibold uppercase tracking-wide text-foreground lg:text-[22px]"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, value }) => {
      const key = `${slug}-${value?._key || `h4-${Math.random()}`}`;
      return (
        <h4
          key={key}
          className="mt-6 mb-2 font-heading text-[15px] font-semibold uppercase tracking-wide text-foreground lg:text-[17px]"
        >
          {children}
        </h4>
      );
    },
  },
  list: {
    bullet: ({ children, value }) => {
      const key = `${slug}-${value?._key || `ul-${Math.random()}`}`;
      return (
        <ul
          key={key}
          className="mt-4 ml-6 list-disc space-y-2 text-[14px] leading-[160%] text-muted-foreground marker:text-brand-primary lg:text-[16px]"
        >
          {children}
        </ul>
      );
    },
    number: ({ children, value }) => {
      const key = `${slug}-${value?._key || `ol-${Math.random()}`}`;
      return (
        <ol
          key={key}
          className="mt-4 ml-6 list-decimal space-y-2 text-[14px] leading-[160%] text-muted-foreground marker:text-brand-primary lg:text-[16px]"
        >
          {children}
        </ol>
      );
    },
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = value?.href || "#";
      const blank = value?.blank || false;
      return (
        <Link
          href={href}
          target={blank ? "_blank" : undefined}
          rel={blank ? "noopener noreferrer" : undefined}
          className="text-brand-primary underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }: { value: BlogPostContentImage }) => {
      if (!value?.asset) return null;
      const imageUrl = blogContentImageUrl(value);
      const alt = value?.alt ?? "";
      const key = `${slug}-${value?._key || `image-${Math.random()}`}`;
      const w = value.dimensions?.width ?? 1200;
      const h = value.dimensions?.height ?? 800;

      return (
        <figure
          key={key}
          className="my-8 w-full overflow-hidden rounded-xl border border-border bg-card"
        >
          <Image
            src={imageUrl}
            alt={alt}
            width={w}
            height={h}
            sizes={BLOG_CONTENT_IMAGE_SIZES}
            className="block h-auto w-full max-h-[80dvh] object-contain"
          />
        </figure>
      );
    },
    gallerySection: ({ value }: { value: BlogPostContentGallerySection }) => {
      const items = (value?.items ?? []).filter((it) => it?.image?.asset);
      if (items.length === 0) return null;
      return (
        <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const img = item.image!;
            const url = contentImageUrl(img)
              .width(900)
              .fit("max")
              .auto("format")
              .url();
            return (
              <figure
                key={item._key}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <Image
                  src={url}
                  alt={img.alt ?? ""}
                  width={img.dimensions?.width ?? 900}
                  height={img.dimensions?.height ?? 600}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="block h-full w-full object-cover"
                />
              </figure>
            );
          })}
        </div>
      );
    },
    table: ({ value }: { value: BlogPostContentTable }) => {
      const rows = value?.rows || [];
      if (rows.length === 0) return null;

      const headerRow = rows[0];
      const dataRows = rows.slice(1);
      const headerCells = headerRow?.cells || [];
      const columnCount = headerCells.length;
      const tableKey = `${slug}-${value?._key || `table-${Math.random()}`}`;

      return (
        <div key={tableKey} className="my-8 w-full overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
            <colgroup>
              {Array.from({ length: columnCount }).map((_, index) => (
                <col key={index} style={{ width: `${100 / columnCount}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-surface-elevated">
                {headerCells.map((cell, index) => (
                  <th
                    key={index}
                    className="border-b border-r border-border p-4 text-center align-middle text-[12px] font-semibold uppercase tracking-wide text-foreground last:border-r-0 lg:text-[14px]"
                  >
                    {cell || ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => {
                const isLastRow = rowIndex === dataRows.length - 1;
                return (
                  <tr key={rowIndex}>
                    {(row?.cells || []).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`p-4 text-center align-middle text-[12px] text-muted-foreground last:border-r-0 lg:text-[14px] ${
                          isLastRow ? "" : "border-b"
                        } border-r border-border`}
                      >
                        {cell || ""}
                      </td>
                    ))}
                    {Array.from({
                      length: columnCount - (row?.cells?.length || 0),
                    }).map((_, index) => (
                      <td
                        key={`empty-${index}`}
                        className={`p-4 last:border-r-0 ${
                          isLastRow ? "" : "border-b"
                        } border-r border-border`}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    },
    faqAnswerButton: ({ value }: { value: BlogPostContentFaqAnswerButton }) => {
      const label = value?.label?.trim();
      const href = value?.href?.trim();
      if (!label || !href) return null;

      const key = `${slug}-${value?._key || `button-${Math.random()}`}`;

      return (
        <div key={key} className="my-6">
          <TechButtonLink
            href={href}
            size="sm"
            variant="primary"
            className="h-[40px] px-6 text-[13px] lg:text-[14px] !no-underline hover:!no-underline"
            target={value.newTab ? "_blank" : undefined}
            rel={value.newTab ? "noopener noreferrer" : undefined}
          >
            {label}
          </TechButtonLink>
        </div>
      );
    },
  },
});
