"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-api";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  stripeStatus: string | null;
  cardCount: number;
  createdAt: string;
}

const PLAN_BADGE: Record<string, string> = {
  free: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  pro: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  business: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400"
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<AdminUser[]>("/admin/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    setDeleting(id);
    try {
      await adminFetch(`/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {}
    setDeleting(null);
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {users.length} total users
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-white/[0.10] dark:bg-white/[0.03]"
            >
              <div className="h-4 w-48 rounded bg-slate-100 dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.03]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Plan
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Cards
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400"
                    >
                      {user.email}
                    </Link>
                    {user.name && (
                      <p className="text-xs text-slate-400">{user.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`border-0 text-[10px] ${PLAN_BADGE[user.plan] ?? PLAN_BADGE.free}`}
                    >
                      {user.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {user.cardCount}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void handleDelete(user.id)}
                      disabled={deleting === user.id}
                      className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
