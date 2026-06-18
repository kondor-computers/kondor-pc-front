import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import type { BlogPost } from "@/types/blogPost";
import { blogHeroDesktopUrl, blogHeroLcpUrl } from "@/lib/blog/heroImage";
import { contentImageUrl } from "@/lib/sanity/contentClient";

interface HeroProps {
  article: BlogPost;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function AuthorLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const className =
    "font-medium text-foreground/90 transition-colors hover:text-foreground";

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function ArticleHero({ article }: HeroProps) {
  const {
    heroTitle,
    heroDescription,
    heroMobileImage,
    heroDesktopImage,
    author,
  } = article;

  const lcpImage = heroMobileImage?.asset
    ? heroMobileImage
    : heroDesktopImage?.asset
      ? heroDesktopImage
      : null;

  const lcpSrc = lcpImage ? blogHeroLcpUrl(lcpImage) : null;
  if (lcpSrc) {
    preload(lcpSrc, { as: "image", fetchPriority: "high" });
  }

  const showDedicatedMobile =
    Boolean(heroMobileImage?.asset) && Boolean(heroDesktopImage?.asset);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {lcpSrc && (
        <Image
          src={lcpSrc}
          fill
          alt={lcpImage?.alt || heroTitle}
          sizes="100vw"
          quality={80}
          className={
            showDedicatedMobile
              ? "-z-20 object-cover md:hidden"
              : "-z-20 object-cover"
          }
          priority
        />
      )}
      {heroDesktopImage?.asset && showDedicatedMobile && (
        <Image
          src={blogHeroDesktopUrl(heroDesktopImage)}
          fill
          alt={heroDesktopImage?.alt || heroTitle}
          sizes="100vw"
          quality={80}
          className="-z-20 hidden object-cover md:block"
          fetchPriority="low"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />
      <div className="container-site py-20 md:py-28 lg:py-32">
        <h1 className="max-w-[980px] font-display text-[28px] font-bold uppercase leading-[110%] text-foreground md:text-[44px] lg:text-[56px]">
          {heroTitle}
        </h1>
        {author?.name && (
          <div className="mt-5 flex items-center gap-3">
            {author.photo?.asset && (
              <Image
                src={contentImageUrl(author.photo)
                  .width(96)
                  .height(96)
                  .fit("crop")
                  .auto("format")
                  .url()}
                alt={author.photo.alt || author.name}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/20"
              />
            )}
            <div className="text-[13px] leading-[140%] text-foreground/75 md:text-[14px]">
              <span className="text-foreground/60">Автор: </span>
              {author.profileUrl?.trim() ? (
                <AuthorLink href={author.profileUrl.trim()}>
                  {author.name}
                </AuthorLink>
              ) : (
                <span className="font-medium text-foreground/90">
                  {author.name}
                </span>
              )}
            </div>
          </div>
        )}
        {heroDescription && (
          <p className="mt-5 max-w-[760px] whitespace-pre-line text-[14px] leading-[150%] text-foreground/85 md:text-[16px]">
            {heroDescription}
          </p>
        )}
      </div>
    </section>
  );
}
