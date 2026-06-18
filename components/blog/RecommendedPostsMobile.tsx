import type { BlogPostPreview } from "@/types/blogPost";
import BlogCard from "./BlogCard";

interface RecommendedPostsMobileProps {
  posts: BlogPostPreview[];
  uniqueKey: string;
}

export default function RecommendedPostsMobile({
  posts,
  uniqueKey,
}: RecommendedPostsMobileProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <h2 className="mb-6 font-display text-[22px] font-bold uppercase leading-[120%] text-foreground">
        Читайте також
      </h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:snap-none [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <div
            key={`${uniqueKey}-${post.slug}`}
            className="w-[min(82%,300px)] shrink-0 snap-start md:w-auto"
          >
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
