"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "What makes you different as a mobile engineer?",
    answer: "6+ years, apps on App Store and Google Play. React Native plus native—Swift (PiP, AirPlay), Kotlin and Kotlin Multiplatform. Full cycle: architecture, performance, release (EAS, Fastlane), store submission. When the product needed backend or end-to-end, I've shipped that too—database, APIs, app in the store.",
  },
  {
    id: "faq-2",
    question: "What's your experience with React Native and native?",
    answer: "Production apps on both stores; native modules in Swift (PiP, AirPlay) and Kotlin; Kotlin Multiplatform. Offline-first, real-time, HLS streaming, full release pipelines. I own the mobile lifecycle from architecture to store submission.",
  },
  {
    id: "faq-3",
    question: "Mobile only or full-stack?",
    answer: "Mobile is my specialty—where I have the most depth. I'm also strong in fullstack: React, Next.js, Supabase, PostgreSQL, APIs, real-time. I've shipped whole products end-to-end. You get a senior mobile engineer who can own the full stack—no handoffs, no gaps.",
  },
  {
    id: "faq-4",
    question: "What teams and products have you worked with?",
    answer: "Startups to enterprise: hospital systems, streaming apps in production, ERPs with real-time Kanban and chat, factory tooling (Kotlin Multiplatform). I adapt to agile and async; I care about maintainability and quality.",
  },
  {
    id: "faq-5",
    question: "How do you approach architecture and quality?",
    answer: "Scalable components, clear state, performance (virtualized lists, memoization). Documented decisions, handoff teams can build on. CI/CD, store compliance, and iteration without breaking production.",
  },
  {
    id: "faq-6",
    question: "How can we start a conversation?",
    answer: "Book a call above or reach out on LinkedIn or email. Open to full-time, long-term contract, or project-based. Tell me what you're building and what you need—I'd be glad to talk.",
  },
];

export function FaqSectionMobile() {
  return (
    <section id="faq" className="relative py-16 px-4">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-full shadow-lg mb-6">
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#0d0d0d] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-white rounded-full" />
              </div>
            </div>
            <span className="text-white text-xs font-medium">FAQ</span>
          </div>

          <h2 className="text-[36px] font-normal text-white mb-3 leading-[1.1] tracking-[-0.02em] font-satoshi">
            FAQ
          </h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">
            Questions about my background, how I work, and how I can add value to your team or product.
          </p>
        </motion.div>

        {/* FAQ List */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                value={faq.id}
                className="p-4 bg-[#0d0d0d] rounded-xl shadow-lg border-0 data-[state=open]:bg-[#0d0d0d]"
              >
                <AccordionTrigger className="hover:no-underline text-left py-0 [&>svg]:text-white/60">
                  <h3 className="text-white font-semibold text-sm font-satoshi leading-[1.3] pr-2">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <div className="h-px bg-white/10 my-3" />
                <AccordionContent className="text-white/70 text-sm leading-relaxed font-sans py-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

