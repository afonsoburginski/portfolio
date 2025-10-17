"use client";

import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Image from "next/image";
import { 
  Smartphone,
  Globe,
  Server,
  Code,
  Shield,
  Key,
  Database as Db,
  GitBranch,
  Rocket,
  Cloud,
  CloudLightning,
  Zap,
  Cpu,
  Gauge,
  Bell,
  Link,
  Flag,
  Activity,
  BarChart3,
} from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiGo, SiTypescript, SiSupabase, SiPostgresql, SiDocker, SiGraphql, SiAmazons3, SiCloudflare } from "react-icons/si";

const tags = [
  "AI Project Consulting",
  "Mobile App Development", 
  "Web App Development",
  "Full‑Stack Engineering",
  "Technical Consulting",
];

const services = [
  {
    title: "AI-Generated Project Consulting",
    desc: "Specialized consulting for projects created with V0, Bolt.new, Lovable, and similar AI tools. I optimize performance, enhance functionality, implement best practices, and guide your AI-generated prototype to production-ready standards with enterprise-grade reliability.",
    icon: Rocket
  },
  {
    title: "Mobile Apps",
    desc: "Cross‑platform React Native apps with native performance and polished UX: offline‑first data, deep links, push notifications, secure auth, and smooth 60fps interactions. Release automation, crash analytics, and feature flags included for fast, safe iteration.",
    icon: Smartphone
  },
  {
    title: "Web Applications", 
    desc: "Modern Next.js experiences with SSR/ISR, accessibility by default, and Core Web Vitals in the green. Scalable component systems, robust routing/data‑fetching, and SEO‑ready foundations that load fast and convert.",
    icon: Globe
  },
  {
    title: "Full‑Stack Solutions",
    desc: "End‑to‑end delivery—from product discovery and data modeling to deployment. Supabase + PostgreSQL, Dockerized pipelines, CI/CD, and zero‑downtime releases. Documentation and handoff that teams can build on.",
    icon: Code
  },
];

const bottomTags = [
  // Core stacks
  { name: "React Native", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs }, 
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Golang", icon: SiGo },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Supabase", icon: SiSupabase },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Docker", icon: SiDocker },
  { name: "GraphQL", icon: SiGraphql },
  // Capabilities
  { name: "Edge Functions", icon: CloudLightning },
  { name: "Serverless", icon: Cloud },
  { name: "Real‑time", icon: Zap },
  { name: "Offline‑first", icon: Db },
  { name: "WebSockets", icon: Link },
  { name: "Push Notifications", icon: Bell },
  { name: "Deep Links", icon: Link },
  { name: "OAuth / JWT", icon: Key },
  { name: "RBAC Security", icon: Shield },
  { name: "Caching", icon: Cpu },
  { name: "Rate Limiting", icon: Gauge },
  { name: "Observability", icon: Activity },
  { name: "Analytics", icon: BarChart3 },
  { name: "Feature Flags", icon: Flag },
  { name: "CI/CD", icon: GitBranch },
  { name: "App Store Releases", icon: Rocket },
  // Storage & delivery
  { name: "Cloudflare R2", icon: SiCloudflare },
  { name: "AWS S3", icon: SiAmazons3 },
  { name: "CDN / Edge Cache", icon: Cloud },
  // Themes
  { name: "Mobile Development", icon: Smartphone },
  { name: "Web Development", icon: Globe },
  { name: "Full‑Stack", icon: Code },
  { name: "REST APIs", icon: Server },
];

// Split into two alternating rows to reduce visible repetition
const row1 = bottomTags.filter((_, i) => i % 2 === 0);
const row2 = bottomTags.filter((_, i) => i % 2 !== 0);

export function ServicesShowcase() {
  return (
    <section id="services" className="relative py-20 px-4 md:px-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: "url('/services-background.jpg')"
        }}
      />
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
                Transforming ideas into powerful digital solutions with modern technologies and best practices for mobile and web development.
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


