import { PortableText } from "@portabletext/react";
import type { BlogPost } from "@/types/blogPost";
import { getBlogPortableTextComponents } from "./blogPortableTextComponents";

interface ContentSectionProps {
  article: BlogPost;
}

export default function ContentSection({ article }: ContentSectionProps) {
  return (
    <section className="py-10 lg:pt-14 lg:pb-4">
      <div className="min-w-0 overflow-x-visible">
        <PortableText
          value={
            article.content as unknown as Parameters<
              typeof PortableText
            >[0]["value"]
          }
          components={getBlogPortableTextComponents(article.slug)}
        />
      </div>
    </section>
  );
}
