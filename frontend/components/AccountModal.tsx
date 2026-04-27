"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CreditCard, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

type Section = "profile" | "subscription";

const GoogleLogo = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.4 3.1 29.5 1 24 1 14.9 1 7.2 6.5 3.7 14.2l7 5.4C12.5 13.3 17.8 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.2-9.4 6.2-16.2z"
    />
    <path
      fill="#FBBC05"
      d="M10.7 28.5c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7-5.4C2 16.6 1 20.2 1 24s1 7.4 2.7 10.5l7-5z"
    />
    <path
      fill="#34A853"
      d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7-5.4c-1.8 1.2-4.1 1.9-6.5 1.9-6.2 0-11.5-3.8-13.3-9.1l-7 5c3.5 7.8 11.2 12.5 20.3 12.5z"
    />
  </svg>
);

export function AccountModal({
  onClose,
  defaultSection = "profile"
}: {
  onClose: () => void;
  defaultSection?: Section;
}) {
  const { refresh } = useAuth();
  const [section, setSection] = useState<Section>(defaultSection);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const navItems: { id: Section; label: string; Icon: typeof User }[] = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "subscription", label: "Subscription", Icon: CreditCard }
  ];

  const sectionTitle =
    section === "profile" ? "Profile details" : "Subscription";

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm md:p-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/[0.10] dark:bg-[#111111] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] md:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-white/[0.10] dark:bg-[#0d0d0d] md:flex">
          <div className="px-6 pb-6 pt-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Account
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage your account info.
            </p>
          </div>
          <nav className="flex-1 space-y-0.5 px-3">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  section === id
                    ? "bg-white font-medium text-slate-900 shadow-sm dark:bg-[#0a0a0a] dark:text-white dark:shadow-none"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:hover:bg-white/[0.03] dark:hover:text-slate-300"
                }`}
              >
                <Icon
                  size={15}
                  className={
                    section === id ? "text-teal-600" : "text-slate-400"
                  }
                />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile header + tabs */}
        <div className="shrink-0 md:hidden">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Account
            </h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.06]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="flex gap-1 px-4 pb-3">
            {navItems.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  section === id
                    ? "bg-slate-100 font-medium text-slate-900 dark:bg-white/[0.06] dark:text-white"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon
                  size={14}
                  className={
                    section === id ? "text-teal-600" : "text-slate-400"
                  }
                />
                {label}
              </button>
            ))}
          </div>
          <div className="border-b border-slate-200 dark:border-white/[0.10]" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#111111]">
          <div className="hidden shrink-0 items-center justify-between px-10 pb-5 pt-8 md:flex">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {sectionTitle}
            </h3>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.06]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="mx-10 hidden border-t border-slate-200 dark:border-white/[0.10] md:block" />
          <div className="flex-1 overflow-y-auto px-5 pb-8 md:px-10">
            {section === "profile" && <ProfileSection />}
            {section === "subscription" && <SubscriptionSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function Row({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-5 last:border-0 dark:border-white/[0.06] md:flex-row md:items-start md:gap-8 md:py-6">
      <span className="shrink-0 text-sm font-medium text-slate-500 md:w-40 md:pt-0.5 md:font-normal">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// ── Profile Section ─────────────────────────────────────────────

function ProfileSection() {
  const { user, logout } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await apiFetch("/auth/account", { method: "DELETE" });
      await logout();
      window.location.href = "/";
    } catch {
      setDeleteError("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="mt-2">
      <Row label="Profile">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600">
            <span className="text-base font-bold text-white">
              {displayName[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {displayName}
          </span>
        </div>
      </Row>

      <Row label="Email address">
        <span className="text-sm text-slate-800 dark:text-slate-200">
          {user?.email}
        </span>
      </Row>

      <Row label="Connected accounts">
        {user?.hasGoogle ? (
          <div className="flex items-center gap-2">
            <GoogleLogo />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Google
            </span>
            <span className="text-slate-300">&middot;</span>
            <span className="text-sm text-slate-500">{user?.email}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">
            No connected accounts
          </span>
        )}
      </Row>

      <Row label="Password">
        <p className="text-sm text-slate-800 dark:text-slate-200">
          {user?.hasPassword ? "Password set" : "No password set"}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {user?.hasPassword
            ? "Use your password to sign in alongside Google."
            : "Add a password as a backup sign-in method."}
        </p>
      </Row>

      {/* Delete account */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.10] dark:bg-white/[0.02]">
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Are you sure?
            </p>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              This will permanently delete your account, cards, and all data.
              This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs text-red-500">{deleteError}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => void handleDeleteAccount()}
                disabled={deleting}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400 dark:hover:bg-red-500/[0.14]"
              >
                {deleting ? "Deleting\u2026" : "Yes, delete my account"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/[0.10] dark:text-slate-300 dark:hover:bg-white/[0.06]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Delete account
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Permanently delete your account and all data.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400 dark:hover:bg-red-500/[0.14]"
            >
              Delete account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subscription Section ────────────────────────────────────────

interface BillingInfo {
  plan: string | null;
  stripeStatus: string;
  currentPeriodEnd: string | null;
  limits: Record<string, unknown>;
}

function formatRenewalDate(iso: string): string {
  const date = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (date.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return date.toLocaleDateString("en-US", opts);
}

const PLAN_CARDS = [
  {
    plan: "pro" as const,
    label: "Pro",
    price: 9,
    features: [
      "Up to 25 cards",
      "10 media files per card",
      "Password protection",
      "Scheduled delivery"
    ]
  },
  {
    plan: "business" as const,
    label: "Business",
    price: 19,
    features: [
      "Unlimited cards",
      "50 media files per card",
      "Custom templates",
      "Remove Cardly branding"
    ],
    highlighted: true
  }
];

function SubscriptionSection() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const plan = user?.plan ?? "free";

  useEffect(() => {
    if (plan !== "free" && !cancelled) {
      apiFetch<BillingInfo>("/billing/subscription")
        .then((b) => {
          setBilling(b);
          setBillingLoaded(true);
        })
        .catch(() => setBillingLoaded(true));
    } else {
      setBillingLoaded(true);
    }
  }, [plan, cancelled]);

  const handleUpgrade = async (p: "pro" | "business") => {
    setError("");
    setLoading(p);
    try {
      const res = await apiFetch<{ url?: string; changed?: boolean }>(
        "/billing/checkout",
        { method: "POST", body: { plan: p } }
      );
      if (res.url) {
        window.location.href = res.url;
      } else if (res.changed) {
        await refresh();
        setLoading(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setError("");
    setLoading("portal");
    try {
      const res = await apiFetch<{ url: string }>("/billing/portal");
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  // Loading skeleton
  if (plan !== "free" && !billingLoaded) {
    return (
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 p-5 dark:border-white/[0.10]"
            >
              <div className="mb-3 h-4 w-16 rounded bg-slate-100 dark:bg-white/[0.06]" />
              <div className="mb-5 h-7 w-24 rounded bg-slate-100 dark:bg-white/[0.06]" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-3 rounded bg-slate-100 dark:bg-white/[0.06]"
                    style={{ width: `${70 + j * 8}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Paid user view
  if (plan !== "free") {
    const visiblePlans = PLAN_CARDS.filter(
      (c) =>
        c.plan === plan ||
        (plan === "pro" && c.plan === "business")
    );

    return (
      <div className="mt-6 space-y-4">
        <div
          className={`grid grid-cols-1 gap-4 ${visiblePlans.length === 2 ? "sm:grid-cols-2" : "max-w-xs"}`}
        >
          {visiblePlans.map(({ plan: p, label, price, features }) => {
            const isCurrent = p === plan;
            return (
              <div
                key={p}
                className={`relative flex flex-col rounded-2xl border p-5 ${
                  isCurrent
                    ? "border-teal-400 bg-teal-50/40 ring-1 ring-teal-400/50 dark:border-teal-500/40 dark:bg-teal-500/[0.06] dark:ring-teal-500/30"
                    : "border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.02]"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Current
                  </span>
                )}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    ${price}
                    <span className="text-sm font-normal text-slate-400">
                      /mo
                    </span>
                  </p>
                </div>
                <ul className="mb-5 flex-1 space-y-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-400"
                    >
                      <Check
                        size={14}
                        className={`mt-0.5 shrink-0 ${isCurrent ? "text-teal-500" : "text-slate-400 dark:text-slate-500"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="space-y-1 text-center">
                    {billing?.currentPeriodEnd && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Renews {formatRenewalDate(billing.currentPeriodEnd)}
                      </p>
                    )}
                    <button
                      onClick={() => void handlePortal()}
                      disabled={loading !== null}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.06]"
                    >
                      {loading === "portal"
                        ? "Opening\u2026"
                        : "Manage billing"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => void handleUpgrade(p)}
                    disabled={loading !== null}
                    className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading === p ? "Redirecting\u2026" : "Upgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <CancelSubscription
          billing={billing}
          onDone={async (cancelledImmediately) => {
            setCancelled(true);
            await refresh();
            if (!cancelledImmediately && billing) {
              setBilling(billing);
            }
          }}
        />
      </div>
    );
  }

  // Free user view — show upgrade options
  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          Start your 7-day free trial
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Choose a plan. Cancel any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLAN_CARDS.map(({ plan: p, label, price, features, highlighted }) => (
          <div
            key={p}
            className={`relative flex flex-col rounded-2xl border p-5 ${
              highlighted
                ? "border-teal-400 bg-teal-50/40 ring-1 ring-teal-400/50 dark:border-teal-500/40 dark:bg-teal-500/[0.06] dark:ring-teal-500/30"
                : "border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.02]"
            }`}
          >
            {highlighted && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Popular
              </span>
            )}
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                ${price}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
            </div>
            <ul className="mb-6 flex-1 space-y-2.5">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-400"
                >
                  <Check
                    size={14}
                    className={`mt-0.5 shrink-0 ${highlighted ? "text-teal-500" : "text-slate-400 dark:text-slate-500"}`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => void handleUpgrade(p)}
              disabled={loading !== null}
              className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                highlighted
                  ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/[0.10] dark:text-slate-300 dark:hover:bg-white/[0.06]"
              }`}
            >
              {loading === p ? "Redirecting\u2026" : "Start 7-day trial"}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Cancel Subscription ─────────────────────────────────────────

function CancelSubscription({
  billing,
  onDone
}: {
  billing: BillingInfo | null;
  onDone: (cancelledImmediately: boolean) => Promise<void>;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<{
    cancelledImmediately: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      await apiFetch<{ ok: boolean }>("/billing/cancel", {
        method: "POST"
      });
      const cancelledImmediately = true; // simplified
      setResult({ cancelledImmediately });
      setShowConfirm(false);
      await onDone(cancelledImmediately);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (result) {
    return (
      <p className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        {result.cancelledImmediately
          ? "Your subscription has been cancelled."
          : `Your subscription will end on ${billing?.currentPeriodEnd ? formatRenewalDate(billing.currentPeriodEnd) : "the end of the billing period"}.`}
      </p>
    );
  }

  if (showConfirm) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.10] dark:bg-white/[0.02]">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          Are you sure?
        </p>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          You&apos;ll lose access to paid features and your plan will revert to
          Free.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleCancel()}
            disabled={cancelling}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400 dark:hover:bg-red-500/[0.14]"
          >
            {cancelling ? "Cancelling\u2026" : "Yes, cancel subscription"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={cancelling}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/[0.10] dark:text-slate-300 dark:hover:bg-white/[0.06]"
          >
            Keep subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1 text-center">
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
      >
        Cancel subscription
      </button>
    </div>
  );
}
