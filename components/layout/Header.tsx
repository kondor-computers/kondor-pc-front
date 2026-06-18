"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import { CartButton } from "@/components/layout/CartButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils";
import MenuIcon from "@/components/icons/MenuIcon";
import {
  isNavGroup,
  type NavEntry,
  type NavGroup,
} from "@/components/layout/nav";

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const panelId = useId();

  useEffect(() => setMounted(true), []);

  // Position the portal panel under the button. Recompute on scroll/resize.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const updateCoords = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setCoords({ left: rect.left, top: rect.bottom + 4 });
    };
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

  // Close on click outside (button + panel) and on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Block focus on closed dropdown items without SSR/client attribute mismatch.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) {
      el.removeAttribute("inert");
    } else {
      el.setAttribute("inert", "");
    }
  }, [open]);

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="group"
      aria-labelledby={buttonId}
      style={
        coords
          ? { left: coords.left, top: coords.top }
          : { left: -9999, top: -9999 }
      }
      className={cn(
        "fixed z-50 min-w-[220px]",
        "rounded-sm border border-white/15 bg-[#0a0d12] backdrop-blur-xl",
        "shadow-[0_18px_36px_-12px_rgba(0,0,0,0.9)]",
        "transition-[opacity,transform] duration-200 ease-out",
        open && coords
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0",
      )}
    >
      <ul className="flex flex-col py-1.5">
        {group.children.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-2 text-[10px] xl:text-[11px] font-medium uppercase tracking-[0.18em]",
                "text-muted-foreground transition-colors duration-150 ease-out",
                "hover:bg-white/5 hover:text-foreground",
              )}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "group/nav relative inline-flex items-center gap-1 rounded-sm px-2.5 xl:px-3 py-1.5",
          "text-[8px] xl:text-[10px] font-medium uppercase tracking-[0.18em]",
          "transition-colors duration-200 ease-out hover:text-foreground",
          open && "text-foreground",
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "size-3 transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-foreground/40 transition-transform duration-300 ease-out group-hover/nav:scale-x-100"
        />
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  );
}

export function Header({ navItems }: { navItems: NavEntry[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Publish header's current height as a CSS variable so MobileMenu can offset under it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`,
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={scrolled}
        data-menu-open={menuOpen}
        className={cn(
          "sticky top-0 xl:top-4 z-30 isolate bg-black xl:bg-transparent",
        )}
      >
        {/* Bottom sector line */}
        <div
          aria-hidden
          className="xl:hidden pointer-events-none absolute inset-x-0 bottom-0 border-b [border-image:linear-gradient(90deg,_#183B42_0%,_#09B5FF_100%)_1] transition-opacity duration-300"
        />

        <div className="container-site">
          <div className="header-bar">
            <span aria-hidden className="header-bar__edge" />
            <span aria-hidden className="header-bar__fill" />
            <div className="relative z-10 flex items-center justify-between gap-4 py-3.5 xl:px-7 xl:py-4">
              {/* LOGO */}
              <Link
                href="/"
                aria-label="Kondor PC — головна"
                className="group/logo relative inline-flex items-center transition-opacity duration-200 hover:opacity-90"
              >
                <Wordmark size="sm" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-foreground/50 transition-transform duration-300 ease-out group-hover/logo:scale-x-100"
                />
              </Link>
              {/* DESKTOP NAV */}
              <nav className="hidden items-center gap-0.5 lg:flex">
                {navItems.map((n) =>
                  isNavGroup(n) ? (
                    <NavDropdown key={n.label} group={n} />
                  ) : (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "group/nav relative rounded-sm px-1.5 xl:px-3 py-1.5",
                        "text-[8px] xl:text-[10px] font-medium uppercase tracking-[0.18em]",
                        "transition-colors duration-200 ease-out hover:text-foreground",
                      )}
                    >
                      {n.label}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-foreground/40 transition-transform duration-300 ease-out group-hover/nav:scale-x-100"
                      />
                    </Link>
                  ),
                )}
              </nav>
              {/* ACTIONS */}
              <div className="flex items-center gap-3.5 lg:gap-6">
                <TechButtonLink
                  href="/pidbir"
                  size="sm"
                  variant="white"
                  className="ml-1 inline-flex lg:hidden h-[22px] text-[8px]"
                >
                  Підібрати ПК
                </TechButtonLink>
                <CartButton />

                {/* Burger — mobile only */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="lg:hidden transition-transform duration-200 ease-out active:scale-95"
                >
                  <span className="relative block w-6 h-4">
                    <MenuIcon
                      className={cn(
                        "absolute inset-0 !w-6 !h-4 transition duration-300 ease-out",
                        menuOpen
                          ? "scale-75 opacity-0"
                          : "scale-100 opacity-100",
                      )}
                    />
                    <X
                      className={cn(
                        "absolute inset-0 size-5 transition-all duration-200",
                        menuOpen
                          ? "scale-100 opacity-100"
                          : "scale-75 opacity-0",
                      )}
                    />
                  </span>
                </Button>

                {/* Primary CTA — desktop only. Mobile CTA lives inside MobileMenu. */}
                <TechButtonLink
                  href="/pidbir"
                  size="sm"
                  variant="white"
                  className="ml-1 hidden lg:inline-flex h-[34px]"
                >
                  Підібрати ПК
                </TechButtonLink>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="mobile-menu">
        <MobileMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          navItems={navItems}
        />
      </div>
    </>
  );
}
