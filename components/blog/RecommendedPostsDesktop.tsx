import type { BlogPostPreview } from "@/types/blogPost";
import BlogCard from "./BlogCard";

interface RecommendedPostsDesktopProps {
  posts: BlogPostPreview[];
  uniqueKey: string;
}

export default function RecommendedPostsDesktop({
  posts,
  uniqueKey,
}: RecommendedPostsDesktopProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <aside className="pt-10 lg:sticky lg:top-24">
      <h2 className="mb-6 font-heading text-[18px] font-semibold uppercase tracking-wide text-foreground">
        Читайте також
      </h2>
      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={`${uniqueKey}-${post.slug}`}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
