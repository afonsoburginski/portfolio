"use client";
import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { InfiniteLogos } from "../../ui/infinite-logos";
import { HoverBorderGradient } from "../../ui/hover-border-gradient";
import { HeroAsciiBackground } from "../ascii-background";
import { SiWebrtc, SiFfmpeg, SiApachekafka, SiKubernetes, SiPostgresql, SiDocker, SiTypescript, SiReact } from "react-icons/si";

export const HeroDesktop = () => {
  return (
    <section className="relative flex flex-col items-center px-6 pt-32 pb-6 overflow-hidden bg-black/[0.96]">
      <HeroAsciiBackground variant="desktop" />
      <div className="max-w-[1600px] mx-auto text-center relative z-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/15 mb-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        >
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute opacity-60" />
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative" />
          <span className="text-gray-200 text-sm">Senior Software Engineer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[40px] md:text-[52px] lg:text-[64px] font-normal text-white mb-4 leading-[1.03] tracking-[-0.02em] font-satoshi"
        >
          Real-time video and distributed systems, built to run in production.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/70 max-w-[600px] mx-auto mb-6"
        >
          <p className="text-base md:text-lg leading-relaxed tracking-wide font-sans">
            Senior Software Engineer specializing in video streaming, real-time media, and distributed systems. I design, build, and operate software end to end, connecting backend architecture, platform engineering, and user-facing applications with a focus on reliability, performance, and sustainable complexity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
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
            Get in Touch
          </HoverBorderGradient>
          
          <HoverBorderGradient
            as="button"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            containerClassName="rounded-xl"
            className="backdrop-blur-sm bg-black/40 text-white font-medium text-base font-sans px-7 py-3"
            duration={1}
            clockwise={false}
          >
            Explore My Work
          </HoverBorderGradient>
        </motion.div>

        {/* Infinite logos carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-4xl mx-auto mt-16 mb-16"
        >
          <InfiniteLogos
            items={[
              { name: "WebRTC", icon: SiWebrtc },
              { name: "FFmpeg", icon: SiFfmpeg },
              { name: "Kafka", icon: SiApachekafka },
              { name: "Kubernetes", icon: SiKubernetes },
              { name: "TypeScript", icon: SiTypescript },
              { name: "PostgreSQL", icon: SiPostgresql },
              { name: "Docker", icon: SiDocker },
              { name: "React Native", icon: SiReact },
            ]}
            direction="left"
            speed="normal"
          />
        </motion.div>
      </div>
    </section>
  );
};

