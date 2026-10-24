"use client";

import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { HoverBorderGradient } from "../../ui/hover-border-gradient";
import Image from "next/image";
import { 
  Server,
  Code,
  GitBranch,
  Rocket,
  Zap,
} from "lucide-react";
import { SiWebrtc, SiFfmpeg, SiApachekafka, SiKubernetes, SiRedis, SiPostgresql, SiDocker, SiTypescript, SiNodedotjs, SiReact } from "react-icons/si";

const tags = [
  "Video Streaming & Media Systems",
  "Distributed Systems & Backend",
  "Platform Engineering",
  "Product Engineering",
  "Technical Ownership",
];

const services = [
  {
    title: "Video Streaming & Media Systems",
    desc: "Architecture and engineering for WebRTC, HLS, LL-HLS, FFmpeg pipelines, custom players, and real-time video analytics.",
    icon: Rocket
  },
  {
    title: "Distributed Systems & Backend",
    desc: "Event-driven services and APIs with NestJS, Node.js, Kafka, Redis, BullMQ, PostgreSQL, WebSockets, and clear operational boundaries.",
    icon: Server
  },
  {
    title: "Platform Engineering",
    desc: "Delivery and infrastructure workflows with Kubernetes, Docker, GitOps, CI/CD, observability, and reliability-minded automation.",
    icon: Rocket
  },
  {
    title: "Product Engineering",
    desc: "End-to-end product work across backend, web, and mobile. React, TypeScript, and React Native remain practical strengths when the system requires them.",
    icon: Code
  },
];

const bottomTags = [
  { name: "WebRTC", icon: SiWebrtc },
  { name: "FFmpeg", icon: SiFfmpeg },
  { name: "Kafka", icon: SiApachekafka },
  { name: "Kubernetes", icon: SiKubernetes },
  { name: "Redis", icon: SiRedis },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Docker", icon: SiDocker },
  { name: "React Native", icon: SiReact },
  { name: "Real-time", icon: Zap },
  { name: "CI/CD", icon: GitBranch },
];

// Split into two alternating rows to reduce visible repetition
const row1 = bottomTags.filter((_, i) => i % 2 === 0);
const row2 = bottomTags.filter((_, i) => i % 2 !== 0);

export function ServicesShowcaseDesktop() {
  return (
    <section id="services" className="relative py-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Top Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Container */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0d0d0d] rounded-[20px] shadow-[16px_24px_20px_8px_rgba(0,0,0,0.4)]">
                <div className="w-4 h-4 bg-white rounded-[10px] flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#0d0d0d] rounded-[10px] flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-[10px]" />
                  </div>
                </div>
                <span className="text-white text-sm font-medium">Development services</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[56px] md:text-[80px] lg:text-[96px] font-normal text-white mb-6 leading-[1.03] tracking-[-0.02em] font-satoshi">
                Services
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <p className="text-white/70 text-lg leading-relaxed font-sans max-w-xl">
                I build and operate complex media systems, distributed backends, and platform infrastructure with end-to-end ownership.
              </p>
            </motion.div>

            {/* Skills Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-[#0d0d0d] rounded-lg text-white text-sm font-sans"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-8" />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <HoverBorderGradient
                as="button"
                onClick={async () => {
                  const cal = await getCalApi();
                  cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
                }}
                containerClassName="rounded-xl"
                className="backdrop-blur-md bg-white/20 text-white font-medium text-base font-sans px-7 py-3"
                duration={1}
                clockwise={true}
              >
                Book a Free Call
              </HoverBorderGradient>
              
              <HoverBorderGradient
                as="button"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                containerClassName="rounded-xl"
                className="backdrop-blur-sm bg-black/40 text-white font-medium text-base font-sans px-7 py-3"
                duration={1}
                clockwise={false}
              >
                See Projects
              </HoverBorderGradient>
            </motion.div>
          </div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
          >
            <Image
              src="/services-background.png"
              alt="services background"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain transition-all duration-500 transform-gpu will-change-transform filter grayscale group-hover:grayscale-0 group-hover:scale-[1.06]"
              priority
            />
          </motion.div>
        </div>

        {/* Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-[#0d0d0d] rounded-[20px] shadow-[16px_24px_20px_8px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center">
                  <service.icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-white font-semibold text-2xl font-satoshi">{service.title}</h4>
              </div>
              <div className="h-px bg-white/10 mb-4" />
              <p className="text-white/70 text-base leading-relaxed font-sans">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* More Services - Scrolling Tags */}
        <div className="space-y-2">
          {/* First Row */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12.5%,black_87.5%,transparent)]">
            <ul className="flex gap-3 py-2 w-max animate-scroll">
              {[...row1, ...row1, ...row1].map((tag, idx) => (
                <li key={tag.name + idx} className="h-[51px] flex items-center">
                  <div className="flex items-center gap-3 px-5 py-2 bg-[#0d0d0d] rounded-full">
                    <div className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center">
                      <tag.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-sm font-sans">{tag.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Second Row */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12.5%,black_87.5%,transparent)]">
            <ul className="flex gap-3 py-2 w-max animate-scroll-reverse">
              {[...row2, ...row2, ...row2].map((tag, idx) => (
                <li key={tag.name + idx} className="h-[51px] flex items-center">
                  <div className="flex items-center gap-3 px-5 py-2 bg-[#0d0d0d] rounded-full">
                    <div className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center">
                      <tag.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-sm font-sans">{tag.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

