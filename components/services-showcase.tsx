"use client";

import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";

const tags = [
  "Product Design",
  "Brand Identity Design",
  "Branding",
  "Packaging Design",
  "Mockup Design",
];

const services = [
  {
    title: "Brand Identity",
    desc:
      "Crafting unique, memorable brand identities that resonate with your audience — from logos to visual systems — ensuring every touchpoint reflects your brand's essence.",
  },
  {
    title: "Brand Design",
    desc:
      "Designing sleek, impactful packaging that not only looks stunning but also connects with your ideal customers — turning first impressions into lasting brand loyalty.",
  },
  {
    title: "Package Design",
    desc:
      "Bringing your brand to life through high‑fidelity product mockups, giving you a clear, realistic preview of how your packaging and visuals will stand out in the real world.",
  },
  {
    title: "Mockup Design",
    desc:
      "Tailored design mockups that align perfectly with your brand's aesthetic — because every detail matters when showcasing your product's true potential.",
  },
];

const bottomTags = [
  "Brand Migration",
  "Package Design",
  "Branding",
  "Slide Decks",
  "Copywriting",
  "Brand Graphics",
  "Brand Visibility",
  "Icons",
  "Brand Integrations",
  "Optimization",
  "Landing Pages",
  "Social Media",
];

export function ServicesShowcase() {
  return (
    <section id="services-showcase" className="relative py-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Top area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left - text */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10">•</span>
              <span>Design services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Services</h2>
            <p className="text-gray-400 max-w-xl">
              Helping businesses standout with brand identity packaging that captivates and converts effectively.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs text-gray-300 bg-white/5 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={async () => {
                  const cal = await getCalApi();
                  cal("modal", { calLink: "rick/get-rick-rolled" });
                }}
                className="px-5 py-2 rounded-lg backdrop-blur-md bg-white/[0.15] text-white border border-white shadow-lg hover:bg-white/25 transition"
              >
                Book a Free Call
              </button>
              <a
                href="#projects"
                className="px-5 py-2 rounded-lg backdrop-blur-md bg-white/[0.15] text-white border border-white shadow-lg hover:bg-white/25 transition"
              >
                See Projects
              </a>
            </div>
          </div>

          {/* Right - hero image placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08),_transparent_60%)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0" />
          </motion.div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              viewport={{ once: true }}
              className="rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/20 shadow-lg p-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-3 text-white font-semibold">
                <span className="inline-flex w-4 h-4 items-center justify-center rounded-sm bg-white/10">▢</span>
                {s.title}
              </div>
              <div className="mt-4 h-px bg-white/10" />
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom tags */}
        <div className="flex flex-wrap gap-3 mt-8">
          {bottomTags.map((t) => (
            <span
              key={t}
              className="px-4 py-2 rounded-full text-xs text-gray-300 bg-white/5 border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}


