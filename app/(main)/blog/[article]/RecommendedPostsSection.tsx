import RecommendedPostsDesktop from "@/components/blog/RecommendedPostsDesktop";
import RecommendedPostsMobile from "@/components/blog/RecommendedPostsMobile";
import { getAllBlogPosts } from "@/lib/sanity/blogFetchers";
import type { BlogPostPreview } from "@/types/blogPost";

export const RECOMMENDED_BLOG_POSTS_COUNT = 3;

function pickRecommendedPosts(
  posts: BlogPostPreview[],
  currentSlug: string,
): BlogPostPreview[] {
  return posts.filter((post) => post.slug !== currentSlug).slice(0, RECOMMENDED_BLOG_POSTS_COUNT);
}

export async function RecommendedPostsAside({
  slug,
  uniqueKey,
}: {
  slug: string;
  uniqueKey: string;
}) {
  const blogPosts = await getAllBlogPosts();
  const recommended = pickRecommendedPosts(blogPosts, slug);
  if (recommended.length === 0) return null;

  return (
    <div className="hidden w-80 shrink-0 lg:block">
      <RecommendedPostsDesktop
        posts={recommended}
        uniqueKey={`${uniqueKey}-recommended-desktop`}
      />
    </div>
  );
}

export async function RecommendedPostsRail({
  slug,
  uniqueKey,
}: {
  slug: string;
  uniqueKey: string;
}) {
  const blogPosts = await getAllBlogPosts();
  const recommended = pickRecommendedPosts(blogPosts, slug);
  if (recommended.length === 0) return null;

  return (
    <div className="lg:hidden">
      <RecommendedPostsMobile
        posts={recommended}
        uniqueKey={`${uniqueKey}-recommended-mobile`}
      />
    </div>
  );
}
