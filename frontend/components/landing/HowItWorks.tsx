"use client";

import {
  Copy,
  Check,
  QrCode,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
  Type,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";

function TemplateGridMock() {
  const templates = [
    {
      label: "Birthday",
      gradient: "from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800",
      selected: true
    },
    {
      label: "Thank You",
      gradient: "from-rose-200 to-pink-200 dark:from-rose-800 dark:to-pink-800",
      selected: false
    },
    {
      label: "Anniversary",
      gradient: "from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800",
      selected: false
    },
    {
      label: "Holiday",
      gradient: "from-sky-200 to-blue-200 dark:from-sky-800 dark:to-blue-800",
      selected: false
    },
    {
      label: "Get Well",
      gradient: "from-emerald-200 to-green-200 dark:from-emerald-800 dark:to-green-800",
      selected: false
    },
    {
      label: "Congrats",
      gradient: "from-fuchsia-200 to-pink-200 dark:from-fuchsia-800 dark:to-pink-800",
      selected: false
    }
  ];

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/[0.10]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Choose a template to get started
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        {templates.map((t) => (
          <div
            key={t.label}
            className={`rounded-xl border p-2 transition ${
              t.selected
                ? "border-teal-300 bg-teal-50/50 ring-1 ring-teal-300/50 dark:border-teal-500/30 dark:bg-teal-500/10"
                : "border-slate-100 hover:border-slate-200 dark:border-white/[0.06] dark:hover:border-white/[0.12]"
            }`}
          >
            <div
              className={`mb-2 h-16 rounded-lg bg-gradient-to-br ${t.gradient}`}
            />
            <p className="text-center text-[10px] font-medium text-slate-600 dark:text-slate-400">
              {t.label}
            </p>
            {t.selected && (
              <div className="mt-1 flex justify-center">
                <Check className="h-3 w-3 text-teal-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EditorMock() {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/[0.10]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Card Editor
          </p>
          <Badge className="border-0 bg-teal-50 text-[10px] text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
            <Sparkles className="mr-1 h-2.5 w-2.5" />
            Auto-save on
          </Badge>
        </div>
      </div>
      <div className="p-4">
        {/* Quick add toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
          >
            <Type className="h-3 w-3" />
            Text
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
          >
            <ImageIcon className="h-3 w-3" />
            Image
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
          >
            <Music className="h-3 w-3" />
            Audio
          </Button>
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Card title
            </label>
            <Input
              className="h-8 text-xs"
              defaultValue="Happy Birthday, Sarah!"
              readOnly
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Personal message
            </label>
            <div className="rounded-md border border-input bg-transparent px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
              Wishing you the most wonderful birthday filled with joy and
              laughter...
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-teal-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Font
              </label>
              <div className="rounded-md border border-input bg-transparent px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                Geist Sans
              </div>
            </div>
            <div className="w-20">
              <label className="mb-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Size
              </label>
              <div className="rounded-md border border-input bg-transparent px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                24px
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ShareMock() {
  return (
    <Card className="overflow-hidden border-slate-200 dark:border-white/[0.10]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Share your card
        </p>
      </div>
      <div className="p-4">
        {/* Share link */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Card link
          </label>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:bg-white/[0.03]">
              <LinkIcon className="h-3 w-3 shrink-0 text-slate-400" />
              cardly.app/cards/8f2k...
            </div>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-teal-600 text-xs text-white hover:bg-teal-700"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white dark:border-white/[0.10] dark:bg-white/[0.05]">
            <QrCode className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              QR Code
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Download or print to share your card offline
            </p>
            <Button size="sm" variant="outline" className="mt-2 h-7 text-[10px]">
              Download PNG
            </Button>
          </div>
        </div>

        {/* Embed */}
        <div>
          <label className="mb-1.5 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Embed code
          </label>
          <div className="rounded-md border border-input bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-400 dark:bg-white/[0.03]">
            {'<iframe src="cardly.app/embed/8f2k..." />'}
          </div>
        </div>
      </div>
    </Card>
  );
}

const steps = [
  {
    number: "01",
    title: "Choose a template",
    description:
      "Browse our collection of beautifully designed templates for every occasion — birthdays, holidays, thank yous, and more. Pick one that fits your style.",
    visual: <TemplateGridMock />,
    direction: "right" as const
  },
  {
    number: "02",
    title: "Make it yours",
    description:
      "Personalize with your own text, photos, and even audio messages. Our intuitive editor makes it easy to create something truly special in minutes.",
    visual: <EditorMock />,
    direction: "left" as const
  },
  {
    number: "03",
    title: "Share instantly",
    description:
      "Send your card via a direct link, QR code, or embed it on any website. Add a password for privacy or schedule delivery for the perfect moment.",
    visual: <ShareMock />,
    direction: "right" as const
  }
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-slate-50/80 px-6 py-24 dark:bg-white/[0.03] sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Three steps to a{" "}
              <span className="text-teal-600 dark:text-teal-400">
                perfect card
              </span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="mt-20 space-y-24">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="grid items-center gap-12 md:grid-cols-2 md:gap-16"
            >
              {/* Text */}
              <ScrollReveal
                direction={step.direction === "right" ? "left" : "right"}
                delay={100}
                className={i % 2 === 1 ? "md:order-2" : ""}
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold text-white dark:bg-white/[0.08] dark:text-teal-400">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>

              {/* Visual */}
              <ScrollReveal
                direction={step.direction}
                delay={200}
                className={i % 2 === 1 ? "md:order-1" : ""}
              >
                {step.visual}
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
