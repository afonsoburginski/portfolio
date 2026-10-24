"use client";

import { motion } from "motion/react";
import { Database, Shield, TrendingUp, Zap } from "lucide-react";
import { coreSkills, stackIcons, toolsAndPlatforms } from "@/lib/stack-icons";
import Image from "next/image";
import type { CSSProperties } from "react";

const experiences = [
  {
    role: "Senior Software Engineer",
    company: "Atman Systems",
    period: "Mar 2026 - Present",
    description: "Architecture and delivery of real-time video streaming and distributed video analytics in a large-scale video monitoring platform: low-latency delivery with WebRTC and HLS / LL-HLS, event-driven analytics on Kafka, and NestJS, PostgreSQL, Redis / BullMQ and WebSocket services with integration testing and quality gates.",
    highlights: [
      { text: "WebRTC / LL-HLS streaming", ...stackIcons.webrtc },
      { text: "NestJS microservices", ...stackIcons.nestjs },
      { text: "Kafka analytics", ...stackIcons.kafka }
    ]
  },
  {
    role: "Senior Software Engineer",
    company: "JHONROB Silos e Secadores",
    period: "Nov 2023 - Mar 2026",
    description: "Designed and delivered business systems and mobile workflows with Next.js, React Native, PostgreSQL / Supabase and near-real-time operations, plus operational tooling for factory processes, including Kotlin Multiplatform components and automated CAD export.",
    highlights: [
      { text: "Next.js workflows", ...stackIcons.nextjs },
      { text: "React Native", ...stackIcons.reactNative },
      { text: "Kotlin Multiplatform", ...stackIcons.kotlin },
      { text: "PostgreSQL / Supabase", ...stackIcons.postgresql }
    ]
  },
  {
    role: "Senior Software Engineer",
    company: "afonsodev.com",
    period: "Jan 2020 - Mar 2026",
    description: "Designed and built Stormzplus, an independent video streaming product with a React Native mobile app, a Next.js web app and a Tauri / Vite desktop tool for administration and media processing, including the pipeline from chunked uploads and FFmpeg transcoding to multi-bitrate HLS on Cloudflare R2 and CDN. Also designed and delivered full-stack systems for external clients, with end-to-end technical ownership.",
    highlights: [
      { text: "Stormzplus streaming pipeline", ...stackIcons.ffmpeg },
      { text: "React Native mobile", ...stackIcons.reactNative },
      { text: "Next.js web", ...stackIcons.nextjs },
      { text: "Cloudflare R2 & CDN", ...stackIcons.cloudflare }
    ]
  },
  {
    role: "Mobile Engineer",
    company: "Centro America Tecnologia",
    period: "Sep 2022 - Apr 2023",
    description: "React Native app for hospital management: biometric auth, real-time dashboards, offline-first forms for medical records and scheduling. Performance focus — virtualized lists, memoization, efficient API usage.",
    highlights: [
      { text: "React Native", ...stackIcons.reactNative },
      { text: "Offline-first", icon: Zap, color: "#A1A1AA" },
      { text: "Hospital system", icon: Shield, color: "#A1A1AA" }
    ]
  },
  {
    role: "Mobile Developer",
    company: "TopSapp - Gestão de Provedores",
    period: "Jan 2021 - Sep 2022",
    description: "High-fidelity interfaces with Next.js and React for ISP management (customers, billing, support). Legacy system rebuild in TypeScript and REST API; backend in Laravel. CI/CD with Git/GitLab (Git Flow), agile (Scrum/Kanban).",
    highlights: [
      { text: "Next.js & React", ...stackIcons.nextjs },
      { text: "CI/CD", icon: Zap, color: "#A1A1AA" },
      { text: "Legacy rebuild", icon: TrendingUp, color: "#A1A1AA" }
    ]
  },
  {
    role: "Systems Developer",
    company: "Ecocentauro Sistemas Inteligentes",
    period: "Jan 2019 - Oct 2020",
    description: "PostgreSQL databases, schema design, query optimization. Report layouts for financial and operational reporting.",
    highlights: [
      { text: "PostgreSQL", ...stackIcons.postgresql },
      { text: "Database modeling", icon: Database, color: "#A1A1AA" },
      { text: "Reporting", icon: TrendingUp, color: "#A1A1AA" }
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
              I am a Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering. I work across architecture, backend, infrastructure, and product delivery, with mobile and frontend engineering as practical strengths when the system requires them.
            </p>
          </motion.div>

          {/* Main Layout: Skills (Left) | Timeline (Center) | Tools (Right) */}
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)_minmax(0,1fr)] gap-12 items-start">
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
                  {coreSkills.map((skill, index) => {
                    const IconComponent = skill.icon;
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + index * 0.03 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        style={{ "--brand-glow": `${skill.color}55` } as CSSProperties}
                        className="px-3 py-2 bg-[#0d0d0d] rounded-lg border border-white/10 text-white/80 text-sm font-sans hover:bg-white/10 hover:shadow-[0_0_14px_var(--brand-glow)] transition-[background-color,box-shadow] duration-200 cursor-default w-fit flex items-center gap-2"
                      >
                        <IconComponent size={14} style={{ color: skill.color }} aria-hidden="true" />
                        <span>{skill.name}</span>
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
                className="text-white text-sm font-semibold font-sans uppercase tracking-wider mb-8 text-left 2xl:text-center text-white/60"
              >
                Professional Journey
              </motion.h3>

              {/* Timeline Container */}
              <div className="relative">
                {/* Vertical gradient line */}
                <div className="absolute left-[7px] 2xl:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[#1f6feb] via-[#8957e5] to-[#1f6feb]/20" />

                {/* Timeline Items */}
                <div className="flex flex-col gap-6">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.company}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + index * 0.08 }}
                      viewport={{ once: true }}
                      className="group relative pl-9 2xl:pl-0"
                    >
                      <div className="2xl:grid 2xl:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] 2xl:items-start">
                        <div className={`min-w-0 ${index % 2 === 0 ? "2xl:col-start-1 2xl:row-start-1" : "2xl:col-start-3 2xl:row-start-1"}`}>
                          <motion.div
                            whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(255,255,255,0.05)" }}
                            className={`p-4 bg-gradient-to-r from-white/4 to-transparent rounded-lg border border-white/10 group-hover:border-white/20 transition-colors duration-200 backdrop-blur-sm ${index === 0 ? "border-[#1f6feb]/40" : ""}`}
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
                                    className="text-white/60 text-xs font-sans px-1.5 py-1 bg-[#0d0d0d] rounded-sm w-fit flex items-center gap-1"
                                  >
                                    <IconComponent size={12} style={{ color: highlight.color }} aria-hidden="true" />
                                    {highlight.text}
                                  </motion.span>
                                );
                              })}
                            </div>
                          </motion.div>
                        </div>
                        <div className={`mt-2.5 text-white/50 text-xs font-sans 2xl:row-start-1 2xl:mt-4 2xl:px-4 ${index % 2 === 0 ? "2xl:col-start-3" : "2xl:col-start-1 2xl:text-right"}`}>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 whitespace-nowrap ${index === 0 ? "border-[#1f6feb]/50 bg-[#1f6feb]/10 text-[#79adff]" : "border-white/10 bg-white/5"}`}>
                            {exp.period}
                          </span>
                        </div>
                      </div>

                      <span className={`absolute left-0 2xl:left-1/2 2xl:-translate-x-1/2 top-5 size-3.5 rounded-full border-2 border-black ring-[3px] ring-black ${index === 0 ? "bg-[#1f6feb] shadow-[0_0_0_4px_#1f6feb44] motion-safe:animate-pulse" : "bg-[#8957e5]"}`} aria-hidden="true" />
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
                <h3 className="text-white text-xs font-semibold font-sans uppercase tracking-wider mb-6 text-white/60 2xl:text-right">Tools & Platforms</h3>
                <div className="space-y-2.5">
                  {toolsAndPlatforms.map((tool, index) => {
                    const IconComponent = tool.icon;
                    return (
                      <motion.div
                        key={tool.name}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + index * 0.03 }}
                        viewport={{ once: true }}
                        whileHover={{ x: -8, transition: { duration: 0.2 } }}
                        style={{ "--brand-glow": `${tool.color}55` } as CSSProperties}
                        className="px-3 py-2 bg-[#0d0d0d] rounded-lg border border-white/10 text-white/80 text-sm font-sans hover:bg-white/10 hover:shadow-[0_0_14px_var(--brand-glow)] transition-[background-color,box-shadow] duration-200 cursor-default w-fit 2xl:ml-auto flex items-center gap-2"
                      >
                        <IconComponent size={14} style={{ color: tool.color }} aria-hidden="true" />
                        <span>{tool.name}</span>
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

