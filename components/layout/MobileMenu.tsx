"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Phone, MessageSquare, Mail, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import {
  isNavGroup,
  type NavEntry,
  type NavGroup,
} from "@/components/layout/nav";

export function MobileMenu({
  isOpen,
  onClose,
  navItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavEntry[];
}) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Apply inert via DOM after hydration — React SSR can omit the attribute and
  // cause a #418 hydration mismatch if set as a JSX prop.
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (isOpen) {
      el.removeAttribute("inert");
    } else {
      el.setAttribute("inert", "");
    }
  }, [isOpen]);

  // Auto-close when route changes (link click inside menu triggers this via pathname).
  useEffect(() => {
    if (isOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed inset-x-0 bottom-0 top-[var(--header-h,64px)] z-20 lg:hidden",
        "transition-opacity duration-200 ease-out",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Закрити меню"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Мобільне меню"
        className={cn(
          "absolute inset-x-0 top-0 flex max-h-full flex-col overflow-y-auto",
          "border-b border-white/10 bg-background/95 backdrop-blur-xl",
          "shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-y-0" : "-translate-y-4",
        )}
      >
        {/* Top accent hairline for continuity with header */}
        <div
          aria-hidden
          className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        <nav className="container-site flex flex-col gap-1 pt-4 pb-2">
          {navItems.map((item) =>
            isNavGroup(item) ? (
              <MobileGroup
                key={item.label}
                group={item}
                pathname={pathname}
                onClose={onClose}
              />
            ) : (
              <MobileLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={pathname === item.href}
                onClose={onClose}
              />
            ),
          )}
        </nav>

        <div className="container-site pb-6 pt-4">
          <TechButtonLink
            href="/pidbir"
            size="md"
            className="w-full h-9"
            onClick={() => onClose()}
          >
            Підібрати ПК
          </TechButtonLink>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <a
              href="tel:+380000000000"
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 rounded-sm border border-white/8 bg-surface/50 py-3 text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-white/20 hover:text-foreground"
            >
              <Phone className="size-4" strokeWidth={1.75} />
              Телефон
            </a>
            <a
              href="https://t.me/kondor_pc"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 rounded-sm border border-white/8 bg-surface/50 py-3 text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-white/20 hover:text-foreground"
            >
              <MessageSquare className="size-4" strokeWidth={1.75} />
              Telegram
            </a>
            <a
              href="mailto:info@kondor-pc.ua"
              onClick={onClose}
              className="flex flex-col items-center gap-1.5 rounded-sm border border-white/8 bg-surface/50 py-3 text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-white/20 hover:text-foreground"
            >
              <Mail className="size-4" strokeWidth={1.75} />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLink({
  href,
  label,
  active,
  onClose,
}: {
  href: string;
  label: string;
  active: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      data-active={active}
      className={cn(
        "group/mitem relative flex items-center justify-between py-3.5",
        "text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground",
        "transition-colors duration-200 ease-out",
        "hover:text-foreground data-[active=true]:text-foreground",
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="tabular text-[10px] text-muted-foreground/40 transition-transform duration-300 ease-out group-hover/mitem:translate-x-0.5"
      >
        →
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-foreground/20",
          "transition-transform duration-300 ease-out",
          "scale-x-0 group-hover/mitem:scale-x-100 data-[active=true]:scale-x-100",
        )}
      />
    </Link>
  );
}

function MobileGroup({
  group,
  pathname,
  onClose,
}: {
  group: NavGroup;
  pathname: string;
  onClose: () => void;
}) {
  // Auto-open if current route is inside this group.
  const childActive = group.children.some((c) => pathname === c.href);
  const [open, setOpen] = useState(childActive);

  return (
    <div className="border-b border-foreground/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "group/mitem relative flex w-full items-center justify-between py-3.5",
          "text-xs font-medium uppercase tracking-[0.22em]",
          "transition-colors duration-200 ease-out",
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-0.5 pb-2 pl-4">
            {group.children.map((c) => {
              const active = pathname === c.href;
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    onClick={onClose}
                    data-active={active}
                    className={cn(
                      "block py-2 text-[11px] font-medium uppercase tracking-[0.2em]",
                      "transition-colors duration-150 ease-out",
                      "text-muted-foreground/80 hover:text-foreground",
                      "data-[active=true]:text-foreground",
                    )}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
