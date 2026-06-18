import Image from "next/image";
import Link from "next/link";
import type { BlogPostPreview } from "@/types/blogPost";
import { contentImageUrl } from "@/lib/sanity/contentClient";

interface BlogCardProps {
  post: BlogPostPreview;
}

export default function BlogCard({ post }: BlogCardProps) {
  const { heroMobileImage, heroTitle, heroDescription, slug } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-primary/60"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {heroMobileImage?.asset ? (
          <Image
            src={contentImageUrl(heroMobileImage).width(800).auto("format").url()}
            fill
            alt={heroMobileImage?.alt || heroTitle}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-elevated" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 lg:p-6">
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[20px]">
            {heroTitle}
          </h3>
          <p className="line-clamp-4 text-[13px] leading-[150%] text-muted-foreground lg:text-[14px]">
            {heroDescription}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] text-brand-primary transition-transform group-hover:translate-x-1">
          Читати <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
