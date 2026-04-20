"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Heart,
  ArrowLeft,
  Users,
  ShieldCheck
} from "lucide-react";
import { setAdminKey, adminFetch } from "@/lib/admin-api";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users }
];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminKey");
    if (stored) {
      adminFetch("/admin/overview")
        .then(() => setAuthenticated(true))
        .catch(() => {
          sessionStorage.removeItem("adminKey");
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    setAdminKey(keyInput);
    try {
      await adminFetch("/admin/overview");
      setAuthenticated(true);
    } catch {
      setError("Invalid admin key");
      sessionStorage.removeItem("adminKey");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-black">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-white/[0.10] dark:bg-[#111]">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Admin Access
            </h1>
          </div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Enter the admin key to continue.
          </p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
            placeholder="Admin key"
            className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-white"
            autoFocus
          />
          {error && (
            <p className="mb-3 text-sm text-red-500">{error}</p>
          )}
          <button
            onClick={() => void handleLogin()}
            className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#0d0d0d] md:flex">
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Cardly
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-slate-100 font-medium text-slate-900 dark:bg-white/[0.06] dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.03] dark:hover:text-slate-300"
                }`}
              >
                <Icon
                  size={15}
                  className={active ? "text-teal-600" : "text-slate-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-3 py-4 dark:border-white/[0.06]">
          <Link
            href="/cards"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.03]"
          >
            <ArrowLeft size={15} />
            Back to app
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
