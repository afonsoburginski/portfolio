"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "What is the typical project delivery timeline?",
    answer: "Timeline varies based on project complexity and scope. I provide detailed estimates after understanding your requirements. Most projects involve collaborative planning with clear milestones and regular updates so you're always aware of progress.",
  },
  {
    id: "faq-2",
    question: "Do you work on projects of any size?",
    answer: "Yes. I work with early-stage startups, MVPs, established companies, and enterprise-level systems. Each project is unique and I adapt my approach to fit your specific needs, timeline, and budget.",
  },
  {
    id: "faq-3",
    question: "What's your experience with mobile development?",
    answer: "I have 6+ years of professional experience building cross-platform mobile applications with React Native for iOS and Android. I focus on creating performant, user-friendly apps that follow platform best practices and deliver real business value.",
  },
  {
    id: "faq-4",
    question: "How does your development process work?",
    answer: "I start with a consultation to understand your goals and requirements. Then I create a detailed plan with clear deliverables and timelines. Work happens in iterative sprints with regular communication, allowing for feedback and adjustments throughout the project.",
  },
  {
    id: "faq-5",
    question: "What happens after project launch?",
    answer: "I offer post-launch support including bug fixes, performance optimization, and new feature development. I can work as a dedicated developer for your team or in a consulting capacity based on your needs.",
  },
  {
    id: "faq-6",
    question: "What's the typical cost for a project?",
    answer: "Pricing depends on scope, complexity, and timeline. I offer flexible models: fixed-price projects, dedicated team augmentation, or hourly consulting. Let's discuss your needs and I'll provide a custom proposal.",
  },
];

export function FaqSection() {
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
            Common questions about my services, process, and how I can help bring your project to life.</p>
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
