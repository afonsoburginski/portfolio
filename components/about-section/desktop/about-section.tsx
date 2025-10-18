"use client";

import { motion } from "motion/react";
import { Trophy, Zap, Star, Code, Shield, TrendingUp, FileCode } from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiGo, SiTypescript, SiSupabase, SiPostgresql, SiDocker, SiGithub, SiFigma, SiVercel } from "react-icons/si";
import Image from "next/image";

const skills = [
  { name: "React Native", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Golang", icon: SiGo },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Supabase", icon: SiSupabase },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Docker", icon: SiDocker },
];

const tools = [
  { name: "VSCode", icon: FileCode },
  { name: "Figma", icon: SiFigma },
  { name: "Git", icon: SiGithub },
  { name: "GitHub", icon: SiGithub },
  { name: "Docker", icon: SiDocker },
  { name: "Vercel", icon: SiVercel }
];

const experiences = [
  {
    role: "Full Stack Engineer",
    company: "JHONROB Silos e Secadores",
    period: "Nov 2023 - Present",
    description: "Current full-time position. Built the GEM ERP system - a comprehensive enterprise solution for production management, Kanban workflows, and expedition tracking.",
    highlights: [
      { text: "GEM ERP System", icon: Star },
      { text: "80% error reduction", icon: TrendingUp },
      { text: "Enterprise solution", icon: Shield }
    ]
  },
  {
    role: "Senior Mobile Developer", 
    company: "afonsodev.com",
    period: "Jan 2020 - Present",
    description: "Independent software consultant delivering enterprise-grade mobile and web applications for multiple companies using React Native and Next.js.",
    highlights: [
      { text: "Enterprise clients", icon: Trophy },
      { text: "React Native & Next.js", icon: Code },
      { text: "Custom solutions", icon: Zap }
    ]
  },
  {
    role: "Mobile Developer",
    company: "Centro America Tecnologia", 
    period: "Sep 2022 - Apr 2023",
    description: "Contract work developing mobile applications and high-fidelity interfaces for Hospital Management system. Full development lifecycle participation.",
    highlights: [
      { text: "Hospital Management", icon: Code },
      { text: "Mobile development", icon: TrendingUp },
      { text: "React Native", icon: Star }
    ]
  },
  {
    role: "Full Stack Engineer",
    company: "TopSapp - Gestão de Provedores",
    period: "Jan 2021 - Sep 2022",
    description: "Full-time position developing high fidelity interfaces with Next.js, rebuilding legacy systems, and implementing CI/CD automation with agile methodologies.",
    highlights: [
      { text: "Legacy system rebuild", icon: Code },
      { text: "CI/CD automation", icon: Zap },
      { text: "Scrum & Kanban", icon: Shield }
    ]
  },
  {
    role: "System Programmer",
    company: "Ecocentauro Sistemas Inteligentes",
    period: "Jan 2019 - Oct 2020",
    description: "Full-time role managing PostgreSQL and Access databases, developing system scripts, and creating layouts for reports and forms in desktop applications.",
    highlights: [
      { text: "PostgreSQL & Access", icon: Shield },
      { text: "Database modeling", icon: Code },
      { text: "Desktop systems", icon: Trophy }
    ]
  }
];

export function AboutSectionDesktop() {
  return (
    <section id="about-me" className="relative py-20 px-4 md:px-8">
      <div className="w-full">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8 flex justify-center"
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
                <Image
                  src="/avatar.png"
                  alt="Afonso Burginski"
                  fill
                  className="object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                  priority
                />
              </div>
            </motion.div>

            <h2 className="text-[56px] md:text-[80px] lg:text-[96px] font-normal text-white mb-8 leading-[1.03] tracking-[-0.02em] font-satoshi">
              Meet Afonso
            </h2>
            <p className="text-white/70 text-lg leading-relaxed font-sans max-w-3xl mx-auto">
              I&apos;m a Senior Mobile Developer with 6+ years of professional experience. Specialized in React Native and Next.js, I build scalable, high-performance mobile apps and web applications that solve real problems for startups and enterprises.
            </p>
          </motion.div>

          {/* Main Layout: Skills (Left) | Timeline (Center) | Tools (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr_1fr] gap-12 items-start">
            {/* LEFT COLUMN - Skills */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-6 text-opacity-60 text-white/60">Core Skills</h3>
                <div className="space-y-2.5">
                  {skills.map((skill, index) => {
                    const IconComponent = skill.icon;
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + index * 0.03 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        className="px-3 py-2 bg-[#0d0d0d] rounded-lg text-white text-sm font-sans hover:bg-white/10 transition-all duration-300 cursor-default group w-fit flex items-center gap-2"
                      >
                        <IconComponent size={14} className="text-white/60 group-hover:text-white/80" />
                        <span className="group-hover:text-white/80">{skill.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* CENTER COLUMN - Professional Journey Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-white text-sm font-semibold font-sans uppercase tracking-wider mb-8 text-center text-opacity-60 text-white/60"
              >
                Professional Journey
              </motion.h3>

              {/* Timeline Container */}
              <div className="relative">
                {/* Vertical gradient line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-white/15 to-transparent" />

                {/* Timeline Items */}
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + index * 0.08 }}
                      viewport={{ once: true }}
                      className="group relative"
                    >
                      {/* Alternating layout: odd left, even right */}
                      <div className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className="w-5/12">
                          <motion.div
                            whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(255,255,255,0.05)" }}
                            className="p-4 bg-gradient-to-r from-white/4 to-transparent rounded-lg border border-white/8 group-hover:border-white/15 transition-all duration-300 backdrop-blur-sm"
                          >
                            {/* Role & Company */}
                            <div className="mb-2.5">
                              <p className="text-white font-semibold text-sm font-satoshi mb-0.5">{exp.role}</p>
                              <p className="text-white/50 text-xs font-sans">{exp.company}</p>
                            </div>

                            {/* Description */}
                            <p className="text-white/60 text-xs font-sans leading-relaxed mb-3">
                              {exp.description}
                            </p>

                            {/* Highlights - Tight badges with icons */}
                            <div className="flex flex-wrap gap-1">
                              {exp.highlights.map((highlight, idx) => {
                                const IconComponent = highlight.icon;
                                return (
                                  <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    viewport={{ once: true }}
                                    className="text-white/60 text-xs font-sans px-1.5 py-1 bg-[#0d0d0d] rounded-sm hover:bg-white/8 transition-all duration-300 w-fit flex items-center gap-1"
                                  >
                                    <IconComponent size={12} className="text-white/50" />
                                    {highlight.text}
                                  </motion.span>
                                );
                              })}
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Timeline Dot - Center */}
                      <motion.div
                        whileHover={{ scale: 1.3 }}
                        className="absolute left-1/2 transform -translate-x-1/2 top-5 w-3.5 h-3.5 rounded-full bg-neutral-600 group-hover:bg-white/90 transition-all duration-300 border border-white/40 group-hover:border-white shadow-[0_0_0_4px_#000000] cursor-pointer z-10"
                      />

                      {/* Period Badge - Positioned at timeline dot */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                        viewport={{ once: true }}
                        className="absolute left-1/2 transform -translate-x-1/2 top-12 text-white/40 text-xs font-sans whitespace-nowrap"
                      >
                        {exp.period}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN - Tools */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-6 text-opacity-60 text-white/60">Tools & Platforms</h3>
                <div className="space-y-2.5">
                  {tools.map((tool, index) => {
                    const IconComponent = tool.icon;
                    return (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + index * 0.03 }}
                        viewport={{ once: true }}
                        whileHover={{ x: -8, transition: { duration: 0.2 } }}
                        className="px-3 py-2 bg-[#0d0d0d] rounded-lg text-white text-sm font-sans hover:bg-white/10 transition-all duration-300 cursor-default group w-fit ml-auto flex items-center gap-2"
                      >
                        <IconComponent size={14} className="text-white/60 group-hover:text-white/80" />
                        <span className="group-hover:text-white/80">{tool.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

