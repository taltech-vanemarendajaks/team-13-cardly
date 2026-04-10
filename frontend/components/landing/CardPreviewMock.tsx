"use client";

import {
  Bold,
  Italic,
  Image as ImageIcon,
  Music,
  Play,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CardPreviewMock() {
  return (
    <div className="relative">
      {/* Browser window frame */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 dark:border-white/[0.10] dark:bg-[#0a0a0a] dark:shadow-black/30">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-2 flex-1 rounded-md bg-slate-100 px-3 py-1 text-center text-xs text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            cardly.app/editor
          </div>
        </div>

        {/* Editor content */}
        <div className="flex gap-0">
          {/* Sidebar - templates */}
          <div className="hidden w-48 border-r border-slate-100 p-3 dark:border-white/[0.06] sm:block">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Templates
            </p>
            <div className="space-y-2">
              {["Birthday", "Thank You", "Holiday"].map((t, i) => (
                <div
                  key={t}
                  className={`cursor-default rounded-lg border p-2 text-xs transition ${
                    i === 0
                      ? "border-teal-300 bg-teal-50/50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400"
                      : "border-slate-100 text-slate-500 dark:border-white/[0.06] dark:text-slate-400"
                  }`}
                >
                  <div className={`mb-1.5 h-8 rounded ${
                    i === 0
                      ? "bg-gradient-to-r from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800"
                      : i === 1
                        ? "bg-gradient-to-r from-rose-200 to-pink-200 dark:from-rose-800 dark:to-pink-800"
                        : "bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800"
                  }`} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Card canvas */}
          <div className="flex-1 bg-slate-50/50 p-4 dark:bg-white/[0.02] sm:p-6">
            {/* Toolbar */}
            <div className="mb-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-white/[0.10] dark:bg-white/[0.05]">
              <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <Italic className="h-3.5 w-3.5" />
              </button>
              <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-white/10" />
              <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <ImageIcon className="h-3.5 w-3.5" />
              </button>
              <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <Music className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                <Sparkles className="h-3 w-3" />
                AI Assist
              </div>
            </div>

            {/* The card itself */}
            <Card className="overflow-hidden rounded-xl border-slate-200 dark:border-white/[0.10]">
              {/* Card image area */}
              <div className="relative bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 p-6 dark:from-teal-900/40 dark:via-cyan-900/20 dark:to-sky-900/40">
                <div className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 dark:bg-black/40">
                  <ImageIcon className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-3xl">
                  Happy Birthday,
                  <br />
                  <span className="text-gradient-brand">Sarah!</span>
                </p>
              </div>

              {/* Card text content */}
              <div className="space-y-3 p-4">
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Wishing you the most wonderful birthday filled with joy, laughter,
                  and all the things that make you smile...
                </p>

                {/* Audio player mock */}
                <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <Button
                    size="sm"
                    className="h-7 w-7 rounded-full bg-teal-600 p-0 hover:bg-teal-700"
                  >
                    <Play className="h-3 w-3 text-white" />
                  </Button>
                  <div className="flex flex-1 items-center gap-1">
                    {[40, 65, 30, 80, 55, 70, 35, 60, 45, 75, 50, 65, 40, 55, 70, 45, 60, 35, 50, 65].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-teal-300 dark:bg-teal-600"
                          style={{ height: `${h * 0.2}px` }}
                        />
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">0:34</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Properties panel */}
          <div className="hidden w-44 border-l border-slate-100 p-3 dark:border-white/[0.06] lg:block">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Properties
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] text-slate-400">Background</label>
                <div className="flex gap-1.5">
                  {["bg-teal-400", "bg-rose-400", "bg-amber-400", "bg-sky-400", "bg-slate-400"].map(
                    (c) => (
                      <div
                        key={c}
                        className={`h-5 w-5 rounded-full ${c} ${c === "bg-teal-400" ? "ring-2 ring-teal-600 ring-offset-1 dark:ring-offset-black" : ""}`}
                      />
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-slate-400">Font size</label>
                <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-slate-300">
                  24px
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-slate-400">Password</label>
                <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 dark:border-white/[0.10] dark:bg-white/[0.05]">
                  Optional
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-slate-400">Schedule</label>
                <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 dark:border-white/[0.10] dark:bg-white/[0.05]">
                  Set date...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
