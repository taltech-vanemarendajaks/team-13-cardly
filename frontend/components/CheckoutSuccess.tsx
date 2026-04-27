"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

const PLAN_LABEL: Record<string, string> = {
  pro: "Pro",
  business: "Business"
};

const DISMISS_MS = 4000;

export function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refresh } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshedRef = useRef(false);

  const isSuccess = searchParams.get("checkout") === "success";

  const dismiss = () => {
    router.replace("/cards");
  };

  useEffect(() => {
    if (!isSuccess) return;

    // Verify checkout with Stripe and update plan in DB, then refresh auth
    const doVerify = async () => {
      if (refreshedRef.current) return;
      refreshedRef.current = true;
      try {
        await apiFetch("/billing/verify-checkout", { method: "POST" });
      } catch {}
      await refresh();
    };
    void doVerify();

    timerRef.current = setTimeout(dismiss, DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (!isSuccess) return null;

  const planLabel = user?.plan
    ? (PLAN_LABEL[user.plan] ?? user.plan)
    : "your plan";
  const isTrial = true; // first-time subscribers get trial

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-[380px] rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xl dark:border-white/[0.10] dark:bg-[#111111] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)]">
        {/* Circle + ping ring */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <span className="absolute -inset-3 animate-ping rounded-full bg-emerald-400/20" />
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
            <CheckCircle2 size={40} className="text-white" />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          {isTrial ? "Trial started!" : "You\u2019re all set!"}
        </h2>
        <p className="mb-7 text-sm text-slate-500 dark:text-slate-400">
          {isTrial
            ? `Welcome to ${planLabel}! Your 7-day free trial is now active.`
            : `Welcome to ${planLabel}! Your subscription is now active.`}
        </p>

        <button
          onClick={dismiss}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          Get started &rarr;
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Redirecting automatically&hellip;
        </p>

        {/* Progress bar */}
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{
              width: "100%",
              animation: `drain ${DISMISS_MS}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes drain {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}
