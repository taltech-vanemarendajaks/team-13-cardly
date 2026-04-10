import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AppHeader } from "@/components/landing/AppHeader";
import { Button } from "@/components/ui/button";

const demoCards = [
  {
    id: "demo-card-1",
    title: "Thank You Demo Card",
    template: "Thank You",
    updatedAt: "just now",
    gradient: "from-rose-200 via-pink-100 to-rose-200 dark:from-rose-900/40 dark:via-pink-900/20 dark:to-rose-900/40"
  },
  {
    id: "demo-card-2",
    title: "Happy Birthday Sarah",
    template: "Birthday",
    updatedAt: "2 hours ago",
    gradient: "from-teal-200 via-cyan-100 to-sky-200 dark:from-teal-900/40 dark:via-cyan-900/20 dark:to-sky-900/40"
  },
  {
    id: "demo-card-3",
    title: "Holiday Greetings",
    template: "Holiday",
    updatedAt: "yesterday",
    gradient: "from-amber-200 via-orange-100 to-amber-200 dark:from-amber-900/40 dark:via-orange-900/20 dark:to-amber-900/40"
  }
];

export default function CardsPage() {
  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-slate-50/50 dark:bg-black">
        <main className="mx-auto max-w-5xl px-6 pb-12 pt-28">
          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Cards
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {demoCards.length} cards created
              </p>
            </div>
            <Link href="/editor/new">
              <Button className="gap-1.5 bg-teal-600 text-white shadow-[0_0_20px_-4px_rgba(20,184,166,0.3)] hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                New Card
              </Button>
            </Link>
          </div>

          {/* Card grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoCards.map((card) => (
              <div
                key={card.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-white/[0.10] dark:bg-white/[0.03]"
              >
                {/* Card preview / gradient thumbnail */}
                <div
                  className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${card.gradient}`}
                >
                  <p className="text-lg font-semibold text-slate-700/60 dark:text-white/40">
                    {card.template}
                  </p>
                  {/* Hover overlay */}
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-white hover:bg-white/20 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </div>
                </div>

                {/* Card info */}
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {card.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      Updated {card.updatedAt}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* New card placeholder */}
            <Link
              href="/editor/new"
              className="flex h-full min-h-[232px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 text-slate-400 transition-colors hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600 dark:border-white/[0.08] dark:bg-white/[0.01] dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5 dark:hover:text-teal-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Create new card</span>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
