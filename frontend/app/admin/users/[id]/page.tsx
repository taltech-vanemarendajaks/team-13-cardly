"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api";

interface UserCard {
  id: string;
  title: string;
  template: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeStatus: string | null;
  hadTrial: boolean;
  createdAt: string;
  cards: UserCard[];
}

const PLAN_OPTIONS = ["free", "pro", "business"];

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<UserDetail>(`/admin/users/${userId}`)
      .then((u) => {
        setUser(u);
        setSelectedPlan(u.plan);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSavePlan = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ plan: selectedPlan })
      });
      setUser((prev) => (prev ? { ...prev, plan: selectedPlan } : prev));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!confirm("Permanently delete this user and ALL their data?")) return;
    setDeleting(true);
    try {
      await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      router.push("/admin/users");
    } catch {
      setDeleting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this card?")) return;
    setDeletingCard(cardId);
    try {
      await adminFetch(`/admin/users/${userId}/cards/${cardId}`, {
        method: "DELETE"
      });
      setUser((prev) =>
        prev
          ? { ...prev, cards: prev.cards.filter((c) => c.id !== cardId) }
          : prev
      );
    } catch {}
    setDeletingCard(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-100 dark:bg-white/[0.06]" />
        <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.03]" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-slate-400">User not found</p>;
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </button>

      {/* User info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.10] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {user.email}
            </h1>
            {user.name && (
              <p className="mt-0.5 text-sm text-slate-500">{user.name}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => void handleDeleteUser()}
            disabled={deleting}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400"
          >
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Plan</p>
            <div className="mt-1 flex items-center gap-2">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-white"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {selectedPlan !== user.plan && (
                <Button
                  size="sm"
                  onClick={() => void handleSavePlan()}
                  disabled={saving}
                  className="gap-1 bg-teal-600 text-white hover:bg-teal-700"
                >
                  <Save className="h-3 w-3" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              )}
              {saved && (
                <span className="text-xs text-emerald-500">Saved!</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400">Stripe Status</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {user.stripeStatus ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Stripe Customer</p>
            <p className="mt-1 truncate text-sm font-mono text-slate-500 dark:text-slate-400">
              {user.stripeCustomerId ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Subscription ID</p>
            <p className="mt-1 truncate text-sm font-mono text-slate-500 dark:text-slate-400">
              {user.stripeSubscriptionId ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Had Trial</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {user.hadTrial ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cards</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {user.cards.length}
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Cards ({user.cards.length})
        </h2>
        {user.cards.length === 0 ? (
          <p className="text-sm text-slate-400">No cards</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.03]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                    Template
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                    Public
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">
                    Updated
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {user.cards.map((card) => (
                  <tr key={card.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {card.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {card.template ?? "Custom"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`border-0 text-[10px] ${
                          card.isPublic
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {card.isPublic ? "Public" : "Private"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(card.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => void handleDeleteCard(card.id)}
                        disabled={deletingCard === card.id}
                        className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
