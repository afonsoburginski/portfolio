"use client";

import { motion } from "motion/react";
import { coreSkills, toolsAndPlatforms } from "@/lib/stack-icons";
import Image from "next/image";
import type { CSSProperties } from "react";

const experiences = [
  {
    role: "Senior Software Engineer",
    company: "Atman Systems",
    period: "Mar 2026 - Present",
    color: "#1f6feb"
  },
  {
    role: "Senior Software Engineer",
    company: "JHONROB Silos",
    period: "Nov 2023 - Mar 2026",
    color: "#2dd4bf"
  },
  {
    role: "Senior Software Engineer",
    company: "afonsodev.com",
    period: "Jan 2020 - Mar 2026",
    color: "#2dd4bf"
  },
  {
    role: "Mobile Engineer",
    company: "Centro America Tecnologia",
    period: "Sep 2022 - Apr 2023",
    color: "#2dd4bf"
  },
  {
    role: "Mobile Developer",
    company: "TopSapp",
    period: "Jan 2021 - Sep 2022",
    color: "#2dd4bf"
  },
  {
    role: "Systems Developer",
    company: "Ecocentauro",
    period: "Jan 2019 - Oct 2020",
    color: "#2dd4bf"
  }
];

export function AboutSectionMobile() {
  return (
    <section id="about-me" className="relative py-16 px-4">
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mb-6 flex justify-center"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
              <Image
                src="/avatar.png"
                alt="Afonso Burginski"
                fill
                className="object-cover filter grayscale"
                priority
              />
            </div>
          </motion.div>

          <h2 className="text-[36px] font-normal text-white mb-4 leading-[1.1] tracking-[-0.02em] font-satoshi">
            Meet Afonso
          </h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">
            I am a Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering. Mobile and frontend engineering are complementary strengths when the system requires them.
          </p>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-4 text-white/60">Core Skills</h3>
          <div className="flex flex-wrap gap-2">
            {coreSkills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  style={{ "--brand-glow": `${skill.color}55` } as CSSProperties}
                  className="px-3 py-2 bg-[#0d0d0d] rounded-lg border border-white/10 text-white/80 text-xs font-sans flex items-center gap-2 hover:shadow-[0_0_14px_var(--brand-glow)] transition-shadow duration-200"
                >
                  <IconComponent size={12} style={{ color: skill.color }} aria-hidden="true" />
                  <span>{skill.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="mb-4 text-xs font-semibold font-sans uppercase tracking-wider text-white/60">Tools & Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {toolsAndPlatforms.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.name}
                  style={{ "--brand-glow": `${tool.color}55` } as CSSProperties}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-2 text-xs font-sans text-white/80 hover:shadow-[0_0_14px_var(--brand-glow)] transition-shadow duration-200"
                >
                  <IconComponent size={12} style={{ color: tool.color }} aria-hidden="true" />
                  <span>{tool.name}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Experience timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-4 text-white/60">Experience</h3>
          <div className="relative flex flex-col gap-3 before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-[#1f6feb] before:via-[#2dd4bf] before:to-[#1f6feb]/20">
            {experiences.map((exp, index) => {
              return (
                <motion.div
                  key={exp.company}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="relative ml-9 p-3 bg-[#0d0d0d] rounded-lg border border-white/10"
                >
                  <span className={`absolute -left-9 top-5 size-3.5 rounded-full border-2 border-black ring-[3px] ring-black ${index === 0 ? "motion-safe:animate-pulse shadow-[0_0_0_4px_#1f6feb44]" : ""}`} style={{ backgroundColor: exp.color }} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm font-satoshi mb-0.5">{exp.role}</p>
                    <p className="text-white/50 text-xs font-sans mb-1">{exp.company}</p>
                    <p className={`text-xs font-sans ${index === 0 ? "text-[#79adff]" : "text-white/50"}`}>{exp.period}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

