"use client";

import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import Image from "next/image";
import { 
  Smartphone,
  Globe,
  Server,
  Code,
  Database as Db,
  GitBranch,
  Rocket,
  Zap,
} from "lucide-react";
import { SiReact, SiApple, SiAndroid, SiKotlin, SiSwift, SiExpo, SiTypescript, SiNodedotjs, SiPostgresql, SiSupabase, SiDocker } from "react-icons/si";

const tags = [
  "AI Project Consulting",
  "Mobile Development", 
  "Web Development",
  "Full‑Stack",
];

const services = [
  {
    title: "AI Project Consulting",
    desc: "Specialized consulting for projects created with V0, Bolt.new, and similar AI tools. I optimize performance and guide your prototype to production-ready standards.",
    icon: Rocket
  },
  {
    title: "Mobile Apps",
    desc: "Cross‑platform React Native apps with native performance: offline‑first data, push notifications, secure auth, and smooth 60fps interactions.",
    icon: Smartphone
  },
  {
    title: "Web Applications", 
    desc: "Modern Next.js experiences with SSR/ISR and Core Web Vitals in the green. Scalable components and SEO‑ready foundations.",
    icon: Globe
  },
  {
    title: "Full‑Stack Solutions",
    desc: "End‑to‑end delivery—from discovery to deployment. Supabase + PostgreSQL, CI/CD, and zero‑downtime releases.",
    icon: Code
  },
];

const bottomTags = [
  // Mobile
  { name: "React Native", icon: SiReact },
  { name: "iOS", icon: SiApple },
  { name: "Android", icon: SiAndroid },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Swift", icon: SiSwift },
  { name: "Expo", icon: SiExpo },
  // Backend
  { name: "TypeScript", icon: SiTypescript },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Supabase", icon: SiSupabase },
  { name: "Docker", icon: SiDocker },
  { name: "REST APIs", icon: Server },
  // Key capabilities
  { name: "Real‑time", icon: Zap },
  { name: "Offline‑first", icon: Db },
  { name: "CI/CD", icon: GitBranch },
  { name: "App Store & Play Store", icon: Rocket },
];

// Split into two alternating rows to reduce visible repetition
const row1 = bottomTags.filter((_, i) => i % 2 === 0);
const row2 = bottomTags.filter((_, i) => i % 2 !== 0);

export function ServicesShowcaseMobile() {
  return (
    <section id="services" className="relative py-16 px-4">
      <div className="w-full relative z-10">
        {/* Header */}
        <div className="mb-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-full shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#0d0d0d] rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-white text-xs font-medium">Development services</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[36px] font-normal text-white mb-3 leading-[1.1] tracking-[-0.02em] font-satoshi">
              Services
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-white/70 text-sm leading-relaxed font-sans">
              Transforming ideas into powerful digital solutions with modern technologies for mobile and web.
            </p>
          </motion.div>

          {/* Skills Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-[#0d0d0d] rounded-lg text-white text-xs font-sans"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative aspect-[4/3] rounded-xl overflow-hidden mb-8"
        >
          <Image
            src="/services-background.png"
            alt="services background"
            fill
            sizes="100vw"
            className="object-contain filter grayscale"
            priority
          />
        </motion.div>

        {/* Services Cards */}
        <div className="space-y-4 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="p-4 bg-[#0d0d0d] rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-white/10 rounded-sm flex items-center justify-center">
                  <service.icon className="w-3 h-3 text-white" />
                </div>
                <h4 className="text-white font-semibold text-base font-satoshi">{service.title}</h4>
              </div>
              <div className="h-px bg-white/10 mb-3" />
              <p className="text-white/70 text-sm leading-relaxed font-sans">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* More Services - Scrolling Tags (Infinite) */}
        <div className="space-y-2 mb-8 -mx-4">
          {/* First Row */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12.5%,black_87.5%,transparent)]">
            <ul className="flex gap-2 py-2 w-max animate-scroll">
              {[...row1, ...row1, ...row1].map((tag, idx) => (
                <li key={tag.name + idx} className="h-[40px] flex items-center">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] rounded-full">
                    <div className="w-3 h-3 bg-white/10 rounded-sm flex items-center justify-center">
                      <tag.icon className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-white text-xs font-sans whitespace-nowrap">{tag.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Second Row */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12.5%,black_87.5%,transparent)]">
            <ul className="flex gap-2 py-2 w-max animate-scroll-reverse">
              {[...row2, ...row2, ...row2].map((tag, idx) => (
                <li key={tag.name + idx} className="h-[40px] flex items-center">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] rounded-full">
                    <div className="w-3 h-3 bg-white/10 rounded-sm flex items-center justify-center">
                      <tag.icon className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-white text-xs font-sans whitespace-nowrap">{tag.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={async () => {
              const cal = await getCalApi();
              cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
            }}
            className="w-full backdrop-blur-md bg-white/20 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
          >
            Book a Free Call
          </button>
          
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full backdrop-blur-sm bg-black/40 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/50 transition-all duration-300"
          >
            See Projects
          </button>
        </motion.div>
      </div>
    </section>
  );
}

