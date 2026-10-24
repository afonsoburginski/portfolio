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
    question: "What is your main engineering focus?",
    answer: "Video streaming, distributed systems, and platform engineering, with mobile and frontend as complementary strengths.",
  },
  {
    id: "faq-2",
    question: "What is your hands-on video experience?",
    answer: "WebRTC, HLS and LL-HLS, FFmpeg pipelines, custom players, real-time video analytics, and edge-device integrations.",
  },
  {
    id: "faq-3",
    question: "How do distributed systems and platforms fit together?",
    answer: "I connect event-driven services, queues, data stores, Kubernetes, GitOps, CI/CD, observability, and application architecture into systems that can be operated in production.",
  },
  {
    id: "faq-4",
    question: "What products have you worked on?",
    answer: "Video-monitoring and real-time systems, streaming products, internal platforms, and products spanning backend, web, and mobile. Orbit is delivered; Studio and Stormz are in development.",
  },
  {
    id: "faq-5",
    question: "How do you approach architecture and quality?",
    answer: "Explicit trade-offs, clear boundaries, tests, observability, and attention to latency, failure modes, consistency, idempotency, and safe delivery.",
  },
  {
    id: "faq-6",
    question: "How can we start a conversation?",
    answer: "Book a call above or reach out on LinkedIn or email. Tell me what you are building and where you need technical ownership.",
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

