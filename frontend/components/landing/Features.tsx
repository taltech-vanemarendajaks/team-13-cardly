"use client";

import { Palette, ImagePlay, Share2, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { GlowingEffect } from "./GlowingEffect";

const features = [
  {
    icon: Palette,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-500/10",
    title: "Drag & Drop Editor",
    description:
      "Choose from beautiful templates and customize every detail. Move elements around, change fonts, colors, and layouts intuitively.",
    example: {
      label: "Template styles",
      text: "Birthday, Thank You, Holiday, Anniversary, and more"
    }
  },
  {
    icon: ImagePlay,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    title: "Rich Media Support",
    description:
      "Add personal photos and record audio messages. Your cards become interactive experiences, not just static images.",
    example: {
      label: "Supported media",
      text: "JPG, PNG, GIF images and MP3, WAV audio files"
    }
  },
  {
    icon: Share2,
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    title: "Share Anywhere",
    description:
      "Send via a direct link, generate a QR code, or embed cards on any website. Recipients open and enjoy instantly — no account needed.",
    example: {
      label: "Share options",
      text: "Link, QR code, iframe embed, social media"
    }
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    title: "Password & Scheduling",
    description:
      "Protect private cards with a password. Schedule delivery with an automatic countdown so your card arrives at the perfect moment.",
    example: {
      label: "Security",
      text: "Password-protected access with encrypted storage"
    }
  }
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Everything you need to create
              <br className="hidden sm:block" /> unforgettable cards
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
              From personal touches to secure delivery — Cardly gives you all the tools
              to make every greeting special.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <div className="group relative rounded-[1.25rem] border border-slate-200 p-px dark:border-white/[0.10]">
                <GlowingEffect spread={50} blur={24} />
                <div className="relative rounded-[1.2rem] bg-white p-6 dark:bg-[rgba(255,255,255,0.03)]">
                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 dark:border-white/[0.06] ${feature.bg}`}
                  >
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>

                  {/* Title & description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>

                  {/* Example snippet */}
                  <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {feature.example.label}
                    </p>
                    <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                      {feature.example.text}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
