import { RichContent } from "@/components/blocks/RichContent";
import type { ContentNode } from "@/lib/data/types/content";

export function TextBlock({
  heading,
  subheading,
  content,
}: {
  heading?: string;
  subheading?: string;
  content: ContentNode[];
}) {
  return (
    <div className="container-site py-16 md:py-20">
      <div>
        {heading ? (
          <h2 className="font-display text-[28px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[40px]">
            {heading}
          </h2>
        ) : null}
        {subheading ? (
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground lg:text-[16px]">
            {subheading}
          </p>
        ) : null}
        <RichContent nodes={content} />
      </div>
    </div>
  );
}
