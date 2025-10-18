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
            Common questions about my services and process.
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

