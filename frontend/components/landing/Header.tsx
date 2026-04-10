"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, LayoutDashboard, Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" }
];

export function Header() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const isLoggedIn = !loading && !!user;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:duration-300 md:ease-out",
        {
          "border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/[0.06] dark:bg-black/90 dark:shadow-none dark:supports-[backdrop-filter]:bg-[#09090b]/50 md:top-4 md:max-w-4xl":
            scrolled && !mobileOpen,
          "bg-white/90 dark:bg-black/90": mobileOpen
        }
      )}
    >
      <nav
        className={cn(
          "flex h-16 w-full items-center justify-between px-6 md:h-14 md:transition-all md:duration-300 md:ease-out",
          { "md:px-4": scrolled }
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Heart className="h-3.5 w-3.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Cardly
          </span>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={buttonVariants({
                variant: "ghost",
                className:
                  "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              })}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side — desktop */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/cards"
              className="hidden items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(20,184,166,0.4)] transition-colors hover:bg-teal-700 hover:shadow-[0_0_30px_-4px_rgba(20,184,166,0.6)] sm:inline-flex"
            >
              <LayoutDashboard size={14} />
              My Cards
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:inline-flex"
                })}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="hidden items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(20,184,166,0.4)] transition-colors hover:bg-teal-700 hover:shadow-[0_0_30px_-4px_rgba(20,184,166,0.6)] sm:inline-flex"
              >
                Start free
                <ArrowRight size={14} />
              </Link>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 top-16 z-50 flex flex-col overflow-hidden border-t border-slate-200 bg-white/95 dark:border-white/[0.06] dark:bg-black/95 md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div
          data-slot={mobileOpen ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-6"
          )}
        >
          <div className="grid gap-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "justify-start text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                })}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/cards"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={14} />
                My Cards
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full"
                  })}
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Start free
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
