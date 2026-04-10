import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";

export function FooterCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(20,184,166,0.06), transparent 70%)"
        }}
      />

      <ScrollReveal>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Start creating cards that people{" "}
            <span className="text-teal-600 dark:text-teal-400">
              actually love
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
            Join thousands of people who use Cardly to make every occasion
            unforgettable. Free to get started — no credit card required.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button className="bg-teal-600 px-8 py-2.5 text-white shadow-[0_0_24px_-4px_rgba(20,184,166,0.4)] transition-transform hover:scale-[1.03] hover:bg-teal-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started Free
              </Button>
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              No credit card required
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
