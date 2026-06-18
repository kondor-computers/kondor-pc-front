import type { BlogPostPreview } from "@/types/blogPost";
import BlogCard from "./BlogCard";
import BlogPagination from "./BlogPagination";

const ITEMS_PER_PAGE = 12;

interface BlogListProps {
  blogPosts: BlogPostPreview[];
  currentPage: number;
}

export default function BlogList({ blogPosts, currentPage }: BlogListProps) {
  if (!blogPosts || blogPosts.length === 0) {
    return (
      <section className="container-site py-16 md:py-24">
        <p className="text-center text-muted-foreground">
          Скоро тут з&apos;являться нові статті.
        </p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(blogPosts.length / ITEMS_PER_PAGE));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = blogPosts.slice(start, start + ITEMS_PER_PAGE);

  return (
    <section className="container-site scroll-mt-24 py-16 md:py-24">
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {currentItems.map((post) => (
          <li key={post.slug}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>
      <BlogPagination currentPage={page} totalPages={totalPages} />
    </section>
  );
}
