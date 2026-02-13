"use client";

import { motion } from "motion/react";
import { Trophy, Zap, Star, Code, Shield, TrendingUp } from "lucide-react";
import { SiReact, SiExpo, SiNextdotjs, SiNodedotjs, SiKotlin, SiSupabase, SiPostgresql } from "react-icons/si";
import Image from "next/image";

const skills = [
  { name: "React Native", icon: SiReact },
  { name: "Expo", icon: SiExpo },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Supabase", icon: SiSupabase },
  { name: "PostgreSQL", icon: SiPostgresql },
];

const experiences = [
  {
    role: "Full Stack Engineer",
    company: "JHONROB Silos",
    period: "Nov 2023 - Present",
    icon: Star
  },
  {
    role: "Senior Mobile Engineer",
    company: "afonsodev.com",
    period: "Jan 2020 - Present",
    icon: Trophy
  },
  {
    role: "Mobile Engineer",
    company: "Centro America Tecnologia",
    period: "Sep 2022 - Apr 2023",
    icon: Code
  },
  {
    role: "Mobile Developer",
    company: "TopSapp",
    period: "Jan 2021 - Sep 2022",
    icon: Zap
  },
  {
    role: "Systems Developer",
    company: "Ecocentauro",
    period: "Jan 2019 - Oct 2020",
    icon: Shield
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
            Senior Mobile Engineer with 6+ years shipping apps to the App Store and Google Play. I specialize in React Native and native (Kotlin, Swift)—performance, native modules, and release quality. Backend (Supabase, PostgreSQL) when the product needs full ownership.
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
            {skills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="px-3 py-2 bg-[#0d0d0d] rounded-lg text-white text-xs font-sans flex items-center gap-2"
                >
                  <IconComponent size={12} className="text-white/60" />
                  <span>{skill.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Experience - Simple List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-4 text-white/60">Experience</h3>
          <div className="space-y-3">
            {experiences.map((exp, index) => {
              const IconComponent = exp.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="p-3 bg-[#0d0d0d] rounded-lg border border-white/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent size={14} className="text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm font-satoshi mb-0.5">{exp.role}</p>
                      <p className="text-white/50 text-xs font-sans mb-1">{exp.company}</p>
                      <p className="text-white/40 text-xs font-sans">{exp.period}</p>
                    </div>
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

