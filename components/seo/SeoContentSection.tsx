"use client";

import { useMemo, useState } from "react";
import { PortableText } from "@portabletext/react";
import type { BlogPostContent } from "@/types/blogPost";
import { getBlogPortableTextComponents } from "@/components/blog/blogPortableTextComponents";
import { TechButton } from "@/components/shared/TechButton";
import { splitSeoPortableText } from "@/lib/sanity/seoContent";

interface SeoContentSectionProps {
  content: BlogPostContent[];
  scopeKey: string;
}

export function SeoContentSection({ content, scopeKey }: SeoContentSectionProps) {
  const split = useMemo(() => splitSeoPortableText(content), [content]);
  const [expanded, setExpanded] = useState(false);

  if (!split) return null;

  const components = getBlogPortableTextComponents(scopeKey);
  const portableValue = (blocks: BlogPostContent[]) =>
    blocks as unknown as Parameters<typeof PortableText>[0]["value"];

  return (
    <section className="border-t border-border">
      <div className="container-site py-10 md:py-12">
        <PortableText value={portableValue(split.visible)} components={components} />

        {split.hasMore && (
          <>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <PortableText
                  value={portableValue(split.hidden)}
                  components={components}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-start">
              <TechButton
                type="button"
                size="sm"
                variant="primary"
                onClick={() => setExpanded((value) => !value)}
                className="h-[40px] px-6 text-[12px] lg:text-[14px]"
              >
                {expanded ? "Показати менше" : "Показати більше"}
              </TechButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
