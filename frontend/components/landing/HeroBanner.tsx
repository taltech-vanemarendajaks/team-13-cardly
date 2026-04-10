"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "./ContainerScroll";
import { CardPreviewMock } from "./CardPreviewMock";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36">
      {/* Background glow */}
      <div className="glow-light pointer-events-none absolute inset-0 h-[600px]" />

      {/* Desktop: ContainerScroll parallax */}
      <div className="hidden md:block">
        <ContainerScroll
          header={
            <div className="mx-auto max-w-3xl px-6 text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-500/[0.08] px-4 py-1.5 text-sm text-teal-700 dark:border-teal-500/20 dark:text-teal-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                </span>
                Create cards that come alive
              </div>

              {/* Heading */}
              <h1 className="text-gradient-hero text-5xl font-bold leading-[1.1] tracking-tight lg:text-[4.5rem]">
                Beautiful greeting cards,{" "}
                <span className="text-teal-600 dark:text-teal-400">
                  made personal
                </span>
              </h1>

              {/* Lead text */}
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Add photos, audio messages, and animations. Protect with passwords,
                schedule delivery, and share with a link or QR code.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Button className="bg-teal-600 px-6 py-2.5 text-white shadow-[0_0_24px_-4px_rgba(20,184,166,0.4)] transition-transform hover:scale-[1.03] hover:bg-teal-700">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started Free
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    See how it works
                  </Button>
                </a>
              </div>

              <p className="mt-4 text-sm text-slate-400">No credit card required</p>
            </div>
          }
        >
          <div className="mt-12 px-6">
            <CardPreviewMock />
          </div>
        </ContainerScroll>
      </div>

      {/* Mobile: static layout */}
      <div className="px-6 md:hidden">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-500/[0.08] px-3 py-1 text-xs text-teal-700 dark:border-teal-500/20 dark:text-teal-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
            </span>
            Create cards that come alive
          </div>

          <h1 className="text-gradient-hero text-[2.25rem] font-bold leading-[1.15] tracking-tight">
            Beautiful greeting cards,{" "}
            <span className="text-teal-600 dark:text-teal-400">made personal</span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Add photos, audio, and animations. Protect with passwords, schedule
            delivery, and share with a link or QR code.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link href="/register" className="w-full">
              <Button className="w-full bg-teal-600 text-white shadow-[0_0_24px_-4px_rgba(20,184,166,0.4)] hover:bg-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started Free
              </Button>
            </Link>
            <p className="text-xs text-slate-400">No credit card required</p>
          </div>
        </div>

        <div className="mt-8">
          <CardPreviewMock />
        </div>
      </div>
    </section>
  );
}
