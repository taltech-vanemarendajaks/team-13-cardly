"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  }, [logout, router]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0a0a]/95">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/cards" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Heart className="h-3.5 w-3.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Cardly
          </span>
        </Link>

        {/* Right side — avatar dropdown */}
        {!loading && user && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              aria-label="Account menu"
            >
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {user.email}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                {initials}
              </div>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/[0.10] dark:bg-[#0a0a0a]">
                {/* User info */}
                <div className="border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name ?? "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      // TODO: open manage account modal
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Manage Account
                  </button>
                  <button
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
