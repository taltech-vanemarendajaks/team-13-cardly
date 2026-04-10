import { Heart } from "lucide-react";
import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact", href: "mailto:hello@cardly.app" }
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 px-6 py-12 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Cardly
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create beautiful, interactive greeting cards and share them with the
            people who matter most.
          </p>
        </div>

        {/* Product links */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product
          </p>
          <ul className="space-y-2">
            {productLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal links */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal
          </p>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-5xl border-t border-slate-200 pt-6 dark:border-white/[0.06]">
        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Cardly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
