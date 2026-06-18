"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalogProductGroup } from "@/types/catalog";
import { CatalogCard } from "./CatalogCard";
import TriangleIcon from "../icons/TriangleIcon";

const SLIDE_GAP_PX = 16;

export function AccessoriesRailMobileSlider({
  groups,
}: {
  groups: CatalogProductGroup[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      const slideWidth = scroller.clientWidth + SLIDE_GAP_PX;
      if (!slideWidth) return;
      const nextIndex = Math.round(scroller.scrollLeft / slideWidth);
      setCurrentIndex(Math.max(0, Math.min(groups.length - 1, nextIndex)));
    };

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [groups.length]);

  function normalizeIndex(index: number) {
    if (groups.length === 0) return 0;
    return (index + groups.length) % groups.length;
  }

  function scrollToIndex(index: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const normalizedIndex = normalizeIndex(index);
    const slideWidth = scroller.clientWidth + SLIDE_GAP_PX;

    scroller.scrollTo({
      left: slideWidth * normalizedIndex,
      behavior: "smooth",
    });
    setCurrentIndex(normalizedIndex);
  }

  return (
    <div className="sm:hidden">
      <div
        ref={scrollerRef}
        className="[&::-webkit-scrollbar]:hidden flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {groups.map((group) => (
          <div key={group.key} className="min-w-full snap-start">
            <CatalogCard group={group} />
          </div>
        ))}
      </div>

      {groups.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            type="button"
            aria-label="Попередній аксесуар"
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="clip-angular-12 flex size-14 items-center justify-center bg-brand-primary text-black transition hover:brightness-105"
          >
            <TriangleIcon className="mr-0.5" />
          </button>
          <button
            type="button"
            aria-label="Наступний аксесуар"
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="clip-angular-12 flex size-14 items-center justify-center bg-white text-black transition hover:brightness-105"
          >
            <TriangleIcon className="rotate-180 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
