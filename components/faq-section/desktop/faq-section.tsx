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
    answer: "6+ years with apps in production on the App Store and Google Play. React Native plus custom native code—Swift for PiP, AirPlay, advanced playback; Kotlin and Kotlin Multiplatform for shared logic and tooling. I own the full cycle: architecture and state management, performance (virtualized lists, memoization), release pipelines (EAS Build, Fastlane), and store submission. When the product needed backend or end-to-end ownership, I've built and shipped that too—from database and APIs to the app in the store.",
  },
  {
    id: "faq-2",
    question: "What's your hands-on experience with React Native and native code?",
    answer: "Production apps on both stores; custom native modules in Swift (PiP, AirPlay, advanced playback) and Kotlin; Kotlin Multiplatform for shared tooling. I've worked with offline-first flows, real-time (LiveKit, Supabase), HLS streaming, and full release pipelines. I own the full mobile lifecycle—from architecture decisions to store submission.",
  },
  {
    id: "faq-3",
    question: "Do you only do mobile or full-stack?",
    answer: "Mobile is my specialty—that's where I have the most depth and where I bring the most value. I'm also strong in fullstack: frontend (React, Next.js) and backend (Supabase, PostgreSQL, REST APIs, real-time) are part of my daily work. I've shipped entire products end-to-end, from database and APIs to the app in the store. So you get a senior mobile engineer who can own the whole stack when the product needs it—no handoffs, no gaps.",
  },
  {
    id: "faq-4",
    question: "What kind of teams and products have you worked with?",
    answer: "From startup MVPs to enterprise: hospital management systems, subscription streaming (iOS & Android in production), internal ERPs with real-time Kanban and chat, factory tooling (Kotlin Multiplatform, CAD export). I adapt to agile, milestones, and async—and I care about long-term maintainability, not just shipping features.",
  },
  {
    id: "faq-5",
    question: "How do you approach architecture and quality?",
    answer: "I focus on scalable component design, clear state management, and performance (virtualized lists, memoization, sensible re-renders). I prefer documented decisions and handoff that teams can build on. Release quality matters: CI/CD, store compliance, and iteration without breaking production.",
  },
  {
    id: "faq-6",
    question: "How can we start a conversation?",
    answer: "Book a call via the button above or reach out on LinkedIn or email. I'm open to full-time, long-term contract, or project-based work. Tell me what you're building and what you need—I'd be glad to talk.",
  },
];

export function FaqSectionDesktop() {
  return (
    <section id="faq" className="relative py-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0d0d0d] rounded-[20px] shadow-[16px_24px_20px_8px_rgba(0,0,0,0.4)] mb-8">
            <div className="w-4 h-4 bg-white rounded-[10px] flex items-center justify-center">
              <div className="w-2 h-2 bg-[#0d0d0d] rounded-[10px] flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-[10px]" />
              </div>
            </div>
            <span className="text-white text-sm font-medium">Frequently asked questions</span>
          </div>

          <h2 className="text-[56px] md:text-[80px] lg:text-[96px] font-normal text-white mb-6 leading-[1.03] tracking-[-0.02em] font-satoshi">
            FAQ
          </h2>
          <p className="text-white/70 text-lg leading-relaxed font-sans max-w-2xl">
            Questions about my background, how I work, and how I can add value to your team or product.</p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Accordion type="single" collapsible className="md:col-span-2 w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={faq.id}
                  className="p-6 bg-[#0d0d0d] rounded-[20px] shadow-[16px_24px_20px_8px_rgba(0,0,0,0.4)] border-0 data-[state=open]:bg-[#0d0d0d] hover:shadow-[16px_24px_20px_8px_rgba(0,0,0,0.6)] transition-all duration-300"
                >
                  <AccordionTrigger className="hover:no-underline text-left py-0 [&>svg]:text-white/60">
                    <h3 className="text-white font-semibold text-xl font-satoshi leading-[1.3]">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <div className="h-px bg-white/10 my-4" />
                  <AccordionContent className="text-white/70 text-base leading-relaxed font-sans py-0">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

