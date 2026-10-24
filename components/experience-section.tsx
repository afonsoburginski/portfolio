"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    id: 1,
    role: "Senior Software Engineer",
    company: "Atman Systems",
    period: "Mar 2026 - Present",
    description: "Architecture and delivery of real-time video streaming and distributed video analytics in a large-scale video monitoring platform: low-latency delivery with WebRTC and HLS / LL-HLS, event-driven analytics on Kafka, and NestJS, PostgreSQL, Redis / BullMQ and WebSocket services with integration testing and quality gates.",
    achievements: [
      "Low-latency delivery with WebRTC and HLS / LL-HLS",
      "Event-driven analytics with Kafka, idempotency and reliable state",
      "Kubernetes / GitOps improvements validated in a development environment"
    ]
  },
  {
    id: 2,
    role: "Senior Software Engineer",
    company: "JHONROB Silos e Secadores",
    period: "Nov 2023 - Mar 2026",
    description: "Designed and delivered business systems and mobile workflows with Next.js, React Native, PostgreSQL / Supabase and near-real-time operations, plus operational tooling for factory processes, including Kotlin Multiplatform components and automated CAD export.",
    achievements: [
      "Business systems with Next.js, React Native and PostgreSQL / Supabase",
      "Kotlin Multiplatform components for factory processes",
      "Automated CAD export workflows"
    ]
  },
  {
    id: 3,
    role: "Senior Software Engineer",
    company: "afonsodev.com",
    period: "Jan 2020 - Mar 2026",
    description: "Designed and built Stormzplus, an independent video streaming product with a React Native mobile app, a Next.js web app and a Tauri / Vite desktop tool for administration and media processing, including the pipeline from chunked uploads and FFmpeg transcoding to multi-bitrate HLS on Cloudflare R2 and CDN. Also designed and delivered full-stack systems for external clients, with end-to-end technical ownership.",
    achievements: [
      "Stormzplus: React Native, Next.js and Tauri / Vite desktop tool",
      "FFmpeg transcoding to multi-bitrate HLS on Cloudflare R2 and CDN",
      "Full-stack systems for external clients, end-to-end ownership"
    ]
  }
];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative py-20 px-4 md:px-8 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">
            Experience
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Engineering in production
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ownership across streaming systems, distributed services, and platform infrastructure
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-400 to-blue-500" />

          {/* Experience Items */}
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                  <div className="p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm hover:bg-white/5 transition-all group">
                    <div className="mb-4">
                      <span className="text-blue-400 text-sm font-semibold">
                        {exp.period}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {exp.role}
                      </h3>
                      <p className="text-cyan-300 font-medium">
                        {exp.company}
                      </p>
                    </div>
                    
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>

                    <div className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 border-4 border-black z-10" />

                {/* Spacer for alternate layout */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

