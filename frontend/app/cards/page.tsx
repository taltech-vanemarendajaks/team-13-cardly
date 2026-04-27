"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Link2,
  QrCode,
  Code2
} from "lucide-react";
import { AppHeader } from "@/components/landing/AppHeader";
import { Button } from "@/components/ui/button";
import { CheckoutSuccess } from "@/components/CheckoutSuccess";
import { apiFetch } from "@/lib/api";

interface Card {
  id: string;
  title: string;
  template: string | null;
  content: unknown;
  thumbnailUrl: string | null;
  isPublic: boolean;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type CardContent = {
  background?: string;
  backgroundImageUrl?: string;
};

interface ShareLinkResponse {
  url: string;
}

interface EmbedResponse {
  url: string;
  code: string;
}

interface QrResponse {
  url: string;
  qrImageUrl: string;
}

const gradients = [
  "from-rose-200 via-pink-100 to-rose-200 dark:from-rose-900/40 dark:via-pink-900/20 dark:to-rose-900/40",
  "from-teal-200 via-cyan-100 to-sky-200 dark:from-teal-900/40 dark:via-cyan-900/20 dark:to-sky-900/40",
  "from-amber-200 via-orange-100 to-amber-200 dark:from-amber-900/40 dark:via-orange-900/20 dark:to-amber-900/40",
  "from-violet-200 via-purple-100 to-violet-200 dark:from-violet-900/40 dark:via-purple-900/20 dark:to-violet-900/40",
  "from-emerald-200 via-green-100 to-emerald-200 dark:from-emerald-900/40 dark:via-green-900/20 dark:to-emerald-900/40"
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCardContent(content: unknown): CardContent {
  if (!content || typeof content !== "object") return {};
  return content as CardContent;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusByCardId, setStatusByCardId] = useState<
    Record<string, string>
  >({});
  const [qrByCardId, setQrByCardId] = useState<Record<string, QrResponse>>(
    {}
  );

  useEffect(() => {
    apiFetch<Card[]>("/cards")
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function deleteCard(id: string) {
    await apiFetch(`/cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function copyToClipboard(
    cardId: string,
    text: string,
    successMessage: string
  ) {
    if (!navigator?.clipboard) {
      setStatusByCardId((prev) => ({
        ...prev,
        [cardId]: "Clipboard unavailable"
      }));
      return;
    }
    await navigator.clipboard.writeText(text);
    setStatusByCardId((prev) => ({ ...prev, [cardId]: successMessage }));
  }

  async function copyShareLink(card: Card) {
    try {
      const result = await apiFetch<ShareLinkResponse>(
        `/cards/${card.id}/share-link`
      );
      await copyToClipboard(card.id, result.url, "Link copied");
    } catch {
      setStatusByCardId((prev) => ({
        ...prev,
        [card.id]: "Failed to copy link"
      }));
    }
  }

  async function copyEmbedCode(card: Card) {
    try {
      const result = await apiFetch<EmbedResponse>(
        `/cards/${card.id}/embed`
      );
      await copyToClipboard(card.id, result.code, "Embed code copied");
    } catch {
      setStatusByCardId((prev) => ({
        ...prev,
        [card.id]: "Failed to copy embed code"
      }));
    }
  }

  async function openQr(card: Card) {
    try {
      if (qrByCardId[card.id]) {
        setQrByCardId((prev) => {
          const next = { ...prev };
          delete next[card.id];
          return next;
        });
        return;
      }
      const result = await apiFetch<QrResponse>(`/cards/${card.id}/qr`);
      setQrByCardId((prev) => ({ ...prev, [card.id]: result }));
    } catch {
      setStatusByCardId((prev) => ({
        ...prev,
        [card.id]: "Failed to load QR"
      }));
    }
  }

  return (
    <>
      <AppHeader />
      <Suspense>
        <CheckoutSuccess />
      </Suspense>
      <div className="relative min-h-screen bg-slate-50/50 dark:bg-black">
        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgb(148 163 184 / 0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        <main className="relative mx-auto max-w-5xl px-6 pb-12 pt-28">
          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Cards
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {cards.length} card{cards.length !== 1 ? "s" : ""} created
              </p>
            </div>
            <Link href="/editor/new">
              <Button className="gap-1.5 bg-teal-600 text-white shadow-[0_0_20px_-4px_rgba(20,184,166,0.3)] hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                New Card
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.03]"
                >
                  <div className="h-44 bg-slate-100 dark:bg-white/[0.06]" />
                  <div className="p-4">
                    <div className="h-4 w-32 rounded bg-slate-100 dark:bg-white/[0.06]" />
                    <div className="mt-2 h-3 w-20 rounded bg-slate-100 dark:bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, i) => {
                const content = getCardContent(card.content);
                const hasCustomImage = Boolean(content.backgroundImageUrl);
                const fallbackGradient = gradients[i % gradients.length];

                return (
                  <div
                    key={card.id}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-white/[0.10] dark:bg-white/[0.03]"
                  >
                    <div
                      className={`relative flex h-44 flex-col items-center justify-center ${
                        hasCustomImage
                          ? "bg-slate-100"
                          : `bg-gradient-to-br ${fallbackGradient}`
                      }`}
                      style={{
                        background: !hasCustomImage
                          ? content.background
                          : undefined,
                        backgroundImage: content.backgroundImageUrl
                          ? `url(${content.backgroundImageUrl})`
                          : undefined,
                        backgroundSize: content.backgroundImageUrl
                          ? "cover"
                          : undefined,
                        backgroundPosition: content.backgroundImageUrl
                          ? "center"
                          : undefined,
                        backgroundRepeat: content.backgroundImageUrl
                          ? "no-repeat"
                          : undefined
                      }}
                    >
                      {!hasCustomImage && (
                        <>
                          <p className="text-lg font-bold text-slate-700/50 dark:text-white/30">
                            {card.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500/50 dark:text-white/20">
                            {card.template ?? "Custom"}
                          </p>
                        </>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                        <Link href={`/editor/${card.id}`}>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-white text-slate-900 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/cards/${card.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-white hover:bg-white/20 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {card.title}
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            Updated {timeAgo(card.updatedAt)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                          onClick={() => deleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareLink(card)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openQr(card)}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          {qrByCardId[card.id] ? "Hide QR" : "QR"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyEmbedCode(card)}
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Embed
                        </Button>
                      </div>
                      {qrByCardId[card.id] && (
                        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrByCardId[card.id].qrImageUrl}
                              alt={`QR code for ${card.title}`}
                              className="h-24 w-24 rounded-md border border-slate-200 bg-white p-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  qrByCardId[card.id].qrImageUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              Open image
                            </Button>
                          </div>
                        </div>
                      )}
                      {statusByCardId[card.id] && (
                        <p className="mt-2 text-xs text-teal-600 dark:text-teal-400">
                          {statusByCardId[card.id]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* New card placeholder */}
              <Link
                href="/editor/new"
                className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 text-slate-400 transition-colors hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600 dark:border-white/[0.08] dark:bg-white/[0.01] dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5 dark:hover:text-teal-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Create new card</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
