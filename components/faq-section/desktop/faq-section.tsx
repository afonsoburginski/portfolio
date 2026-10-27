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
    answer: "Video streaming, distributed systems, and platform engineering. I work across media pipelines, real-time services, backend architecture, infrastructure, and production operations, with mobile and frontend engineering as complementary strengths.",
  },
  {
    id: "faq-2",
    question: "What hands-on experience do you have with video systems?",
    answer: "I work with WebRTC, HLS and LL-HLS streaming, FFmpeg pipelines, custom players, codec-aware delivery, real-time video analytics, and edge-device integrations. The goal is dependable media infrastructure from ingest and processing through playback.",
  },
  {
    id: "faq-3",
    question: "How do distributed systems and platform engineering fit together?",
    answer: "I connect application architecture with the platform that runs it: event-driven services, queues, data stores, containers, Kubernetes, GitOps, CI/CD, observability, and operational safeguards. I care about clear boundaries, idempotency, reliability, and decisions that hold up in production.",
  },
  {
    id: "faq-4",
    question: "What kinds of products have you worked on?",
    answer: "Video-monitoring and real-time systems, streaming products, internal operational platforms, and product experiences spanning backend, web, and mobile. Studio and Stormz are in-development media infrastructure projects.",
  },
  {
    id: "faq-5",
    question: "How do you approach architecture and quality?",
    answer: "I make trade-offs explicit, keep boundaries understandable, and validate behavior with tests and observability. I look at latency, throughput, failure modes, consistency, idempotency, deployment safety, and the operational experience—not just whether a feature works locally.",
  },
  {
    id: "faq-6",
    question: "How can we start a conversation?",
    answer: "Book a call via the button above or reach out on LinkedIn or email. Tell me what you are building, the constraints you are working with, and where you need technical ownership.",
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

