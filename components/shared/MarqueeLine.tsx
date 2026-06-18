"use client";
import Marquee from "react-fast-marquee";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface MarqueeLineProps {
  variant?: "primary";
  className?: string;
}

export default function MarqueeLine({
  className = "",
  variant = "primary",
}: MarqueeLineProps) {
  return (
    <Marquee
      autoFill={true}
      speed={70}
      className={twMerge(
        clsx(
          `py-3 lg:py-6 font-display text-[12px] lg:text-[24px] text-black uppercase leading-none ${
            variant === "primary" ? "bg-brand-primary" : ""
          }`,
          className,
        ),
      )}
    >
      <span className="inline-block mx-[7.15px] lg:mx-[13px]">Kondor.pc</span>
      <span className="inline-block mx-[7.15px] lg:mx-[13px] bg-black size-1.5 rounded-full mb-0.5 lg:mb-1.5"></span>
      <span className="inline-block mx-[7.15px] lg:mx-[13px]">Kondor.pc</span>
      <span className="inline-block mx-[7.15px] lg:mx-[13px] bg-black size-1.5 rounded-full mb-0.5 lg:mb-1.5"></span>
    </Marquee>
  );
}
