"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CardElement = {
  id?: string;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  x?: number;
  y?: number;
};

type CardResponse = {
  id: string;
  content?: {
    background?: string;
    backgroundImageUrl?: string;
    elements?: CardElement[];
  };
};

type PublicStatusResponse = {
  id: string;
  isPublic: boolean;
  scheduledAt: string | null;
  requiresPassword: boolean;
  available: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type PublicCardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

export default function PublicCardPage({ params }: PublicCardPageProps) {
  const [cardId, setCardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PublicStatusResponse | null>(null);
  const [card, setCard] = useState<CardResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    params.then(({ id }) => setCardId(id));
  }, [params]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadPublicState = useCallback(async () => {
    if (!cardId) return;

    setLoading(true);
    setError("");

    const statusRes = await fetch(`${API_BASE_URL}/cards/${cardId}/public-status`, {
      cache: "no-store"
    });

    if (!statusRes.ok) {
      setStatus(null);
      setCard(null);
      setLoading(false);
      setError("Card unavailable");
      return;
    }

    const publicStatus = (await statusRes.json()) as PublicStatusResponse;
    setStatus(publicStatus);

    if (!publicStatus.available || publicStatus.requiresPassword) {
      setCard(null);
      setLoading(false);
      return;
    }

    const cardRes = await fetch(`${API_BASE_URL}/cards/${cardId}/public`, {
      cache: "no-store"
    });

    if (!cardRes.ok) {
      setCard(null);
      setLoading(false);
      setError("Card unavailable");
      return;
    }

    setCard((await cardRes.json()) as CardResponse);
    setLoading(false);
  }, [cardId]);

  useEffect(() => {
    loadPublicState().catch(() => {
      setError("Card unavailable");
      setLoading(false);
    });
  }, [loadPublicState]);

  const remainingMs = useMemo(() => {
    if (!status?.scheduledAt || status.available) return 0;
    return new Date(status.scheduledAt).getTime() - now;
  }, [status, now]);

  useEffect(() => {
    if (!status?.scheduledAt || status.available) return;
    if (remainingMs <= 0) {
      loadPublicState().catch(() => {
        setError("Card unavailable");
      });
    }
  }, [remainingMs, status, loadPublicState]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-sm text-slate-500">Loading card...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Card unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </main>
    );
  }

  if (status && !status.available && status.scheduledAt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Card unlocks soon</h1>
          <p className="mt-2 text-sm text-slate-500">
            Reveals at {new Date(status.scheduledAt).toLocaleString()}
          </p>
          <p className="mt-4 text-2xl font-semibold text-teal-600">{formatCountdown(remainingMs)}</p>
        </div>
      </main>
    );
  }

  if (status?.requiresPassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Password protected</h1>
          <p className="mt-2 text-sm text-slate-500">This card requires a password to view.</p>
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Card unavailable</h1>
        </div>
      </main>
    );
  }

  const elements = card.content?.elements ?? [];
  const background = card.content?.background ?? "#ffffff";
  const backgroundImageUrl = card.content?.backgroundImageUrl;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            className="relative mx-auto h-[400px] w-[600px] overflow-hidden rounded-lg border border-slate-200"
            style={{
              background,
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
              backgroundSize: backgroundImageUrl ? "cover" : undefined,
              backgroundPosition: backgroundImageUrl ? "center" : undefined,
              backgroundRepeat: backgroundImageUrl ? "no-repeat" : undefined
            }}
          >
            {elements.map((element, index) => (
              <div
                key={element.id ?? `element-${index}`}
                className="absolute whitespace-pre-wrap"
                style={{
                  left: element.x ?? 0,
                  top: element.y ?? 0,
                  fontFamily: element.fontFamily ?? "Arial",
                  fontSize: `${element.fontSize ?? 24}px`,
                  color: element.color ?? "#111827",
                  lineHeight: 1.15
                }}
              >
                {element.content ?? ""}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
