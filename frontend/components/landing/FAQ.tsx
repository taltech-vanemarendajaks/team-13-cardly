"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Cardly?",
    answer:
      "Cardly is a web application that lets you create beautiful, interactive greeting cards. You can add personal photos, audio messages, animations, and more — then share them instantly via a link, QR code, or embedded on any website."
  },
  {
    question: "How do recipients view my card?",
    answer:
      "Recipients click on the link you share with them (or scan a QR code) and the card opens directly in their browser. No account or app download is needed to view a card."
  },
  {
    question: "Can I password-protect a card?",
    answer:
      "Yes! On the Pro and Business plans, you can set a password on any card. Recipients will need to enter the password before they can view the card content. Passwords are securely encrypted."
  },
  {
    question: "What media files can I upload?",
    answer:
      "You can upload images (JPG, PNG, GIF) and audio files (MP3, WAV). The number of media files per card depends on your plan — from 2 files on Free to 50 on Business."
  },
  {
    question: "Can I schedule a card for later?",
    answer:
      "Absolutely! With Pro and Business plans, you can set a delivery date and time. Before that time, visitors will see a countdown timer. The card automatically reveals when the scheduled time arrives."
  },
  {
    question: "Can I change or cancel my plan anytime?",
    answer:
      "Yes, you can upgrade, downgrade, or cancel your subscription at any time from your dashboard. If you cancel, you keep access until the end of your current billing period. All plans include a 7-day free trial."
  }
];

function FAQItem({
  question,
  answer,
  index
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="border-slate-200 dark:border-white/[0.10]">
        <button
          className="flex w-full items-center justify-between p-5 text-left"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            {question}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
        <div
          className="grid transition-all duration-200 ease-out"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr"
          }}
        >
          <div className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {answer}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
              Everything you need to know about Cardly.
            </p>
          </div>
        </ScrollReveal>

        {/* FAQ items */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
