"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, FileText, DollarSign } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

interface Overview {
  totalUsers: number;
  totalCards: number;
  paidUsers: number;
  freeUsers: number;
  mrr: number;
  planBreakdown: Record<string, number>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    adminFetch<Overview>("/admin/overview")
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Overview
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.10] dark:bg-white/[0.03]"
            >
              <div className="mb-3 h-4 w-16 rounded bg-slate-100 dark:bg-white/[0.06]" />
              <div className="h-8 w-20 rounded bg-slate-100 dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-500/10"
    },
    {
      label: "Total Cards",
      value: data.totalCards,
      icon: FileText,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10"
    },
    {
      label: "Paid Users",
      value: data.paidUsers,
      icon: CreditCard,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      label: "MRR",
      value: `$${data.mrr}`,
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Overview
      </h1>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.10] dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.10] dark:bg-white/[0.03]">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Plan Breakdown
        </h2>
        <div className="flex gap-6">
          {Object.entries(data.planBreakdown).map(([plan, count]) => (
            <div key={plan} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  plan === "free"
                    ? "bg-slate-400"
                    : plan === "pro"
                      ? "bg-teal-500"
                      : "bg-sky-500"
                }`}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium capitalize">{plan}</span>{" "}
                <span className="text-slate-400">({count})</span>
              </span>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        {data.totalUsers > 0 && (
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
            {data.planBreakdown["free"] > 0 && (
              <div
                className="bg-slate-400"
                style={{
                  width: `${(data.planBreakdown["free"] / data.totalUsers) * 100}%`
                }}
              />
            )}
            {data.planBreakdown["pro"] > 0 && (
              <div
                className="bg-teal-500"
                style={{
                  width: `${((data.planBreakdown["pro"] ?? 0) / data.totalUsers) * 100}%`
                }}
              />
            )}
            {data.planBreakdown["business"] > 0 && (
              <div
                className="bg-sky-500"
                style={{
                  width: `${((data.planBreakdown["business"] ?? 0) / data.totalUsers) * 100}%`
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
