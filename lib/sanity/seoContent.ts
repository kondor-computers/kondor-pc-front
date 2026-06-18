import type { BlogPostContent, BlogPostContentBlock } from "@/types/blogPost";

function getBlockText(block: BlogPostContentBlock): string {
  return (block.children ?? []).map((child) => child.text ?? "").join("");
}

function hasTextContentInBlocks(blocks: BlogPostContent[]): boolean {
  return blocks.some(
    (block) =>
      block._type === "block" &&
      getBlockText(block as BlogPostContentBlock).trim().length > 0,
  );
}

export function splitSeoPortableText(content: BlogPostContent[] | undefined) {
  if (!content?.length) return null;

  const firstParaIndex = content.findIndex(
    (block) =>
      block._type === "block" &&
      (!(block as BlogPostContentBlock).style ||
        (block as BlogPostContentBlock).style === "normal"),
  );

  if (firstParaIndex === -1) {
    return {
      visible: content,
      hidden: [] as BlogPostContent[],
      hasMore: false,
    };
  }

  const hidden = content.slice(firstParaIndex + 1);
  return {
    visible: content.slice(0, firstParaIndex + 1),
    hidden,
    hasMore: hasTextContentInBlocks(hidden),
  };
}
