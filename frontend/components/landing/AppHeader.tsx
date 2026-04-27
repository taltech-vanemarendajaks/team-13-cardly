"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Heart, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { AccountModal } from "@/components/AccountModal";

const PLAN_LABELS: Record<string, { label: string; className: string }> = {
  free: {
    label: "Free",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
  },
  pro: {
    label: "Pro",
    className:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
  },
  business: {
    label: "Business",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
  }
};

export function AppHeader() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountModal, setAccountModal] = useState<
    "profile" | "subscription" | null
  >(null);
  const [cardCount, setCardCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      apiFetch<{ id: string }[]>("/cards")
        .then((cards) => setCardCount(cards.length))
        .catch(() => {});
    }
  }, [user]);

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

  const planInfo = PLAN_LABELS[user?.plan ?? "free"] ?? PLAN_LABELS.free;

  return (
    <>
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

          {/* Right side */}
          {!loading && user && (
            <div className="flex items-center gap-3">
              {/* Free plan usage */}
              {user.plan === "free" && (
                <button
                  onClick={() => setAccountModal("subscription")}
                  className="hidden items-center gap-2.5 rounded-lg border border-teal-200/80 bg-teal-50/50 py-1.5 pl-3 pr-2 transition-colors hover:bg-teal-50 dark:border-teal-500/20 dark:bg-teal-500/[0.05] dark:hover:bg-teal-500/[0.10] sm:flex"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-teal-700 dark:text-teal-400">
                        {cardCount}/{PLAN_LIMITS.free.maxCards} cards
                      </span>
                    </div>
                    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-teal-200/60 dark:bg-teal-800/40">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all dark:bg-teal-400"
                        style={{
                          width: `${Math.min((cardCount / PLAN_LIMITS.free.maxCards) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Upgrade
                  </span>
                </button>
              )}

              {/* Avatar dropdown */}
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

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/[0.10] dark:bg-[#0a0a0a]">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.name ?? "User"}
                        </p>
                        <Badge className={`border-0 text-[10px] ${planInfo.className}`}>
                          {planInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setMenuOpen(false); setAccountModal("profile"); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Manage Account
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); setAccountModal("subscription"); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                      >
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        {user.plan === "free" ? "Upgrade Plan" : "Manage Subscription"}
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
            </div>
          )}
        </nav>
      </header>

      {accountModal && (
        <AccountModal
          onClose={() => setAccountModal(null)}
          defaultSection={accountModal}
        />
      )}
    </>
  );
}
