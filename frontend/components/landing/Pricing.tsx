"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";
import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with the basics",
    cta: "Start free",
    features: [
      { text: "Up to 3 cards", included: true },
      { text: "2 media files per card", included: true },
      { text: "Share via link", included: true },
      { text: "Basic templates", included: true },
      { text: "Password protection", included: false },
      { text: "Scheduled delivery", included: false },
      { text: "Custom templates", included: false },
      { text: "Remove Cardly branding", included: false }
    ]
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For people who send cards often",
    cta: "Get Pro",
    popular: true,
    features: [
      { text: "Up to 25 cards", included: true },
      { text: "10 media files per card", included: true },
      { text: "Share via link, QR & embed", included: true },
      { text: "All templates", included: true },
      { text: "Password protection", included: true },
      { text: "Scheduled delivery", included: true },
      { text: "Custom templates", included: false },
      { text: "Remove Cardly branding", included: false }
    ]
  },
  {
    name: "Business",
    price: "$19",
    period: "/month",
    description: "For teams and professionals",
    cta: "Get Business",
    features: [
      { text: "Unlimited cards", included: true },
      { text: "50 media files per card", included: true },
      { text: "Share via link, QR & embed", included: true },
      { text: "All templates", included: true },
      { text: "Password protection", included: true },
      { text: "Scheduled delivery", included: true },
      { text: "Custom templates", included: true },
      { text: "Remove Cardly branding", included: true }
    ]
  }
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-20 px-6 py-24 sm:py-32"
    >
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(148 163 184 / 0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Section header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Start for free. Upgrade when you need more.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 100}>
              <div
                className={`relative rounded-2xl border bg-white p-6 dark:bg-[#0a0a0a] sm:p-7 ${
                  tier.popular
                    ? "border-teal-500/40 ring-2 ring-teal-500/20 shadow-[0_4px_24px_-8px_rgba(20,184,166,0.15)]"
                    : "border-slate-200 dark:border-white/[0.10]"
                }`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-teal-600 px-3 py-1 text-xs text-white">
                    Most Popular
                  </Badge>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {tier.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link href="/register" className="block">
                  {tier.popular ? (
                    <Button className="w-full bg-teal-600 text-white shadow-[0_0_20px_-4px_rgba(20,184,166,0.4)] transition-transform hover:scale-[1.02] hover:bg-teal-700">
                      {tier.cta}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      {tier.cta}
                    </Button>
                  )}
                </Link>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${tier.popular ? "text-teal-600" : "text-slate-400"}`}
                        />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Footer text */}
        <p className="mt-10 text-center text-sm text-slate-400">
          Cancel anytime. No contracts. All plans include a 7-day free trial.
        </p>
      </div>
    </section>
  );
}
