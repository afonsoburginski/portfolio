"use client";
import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { InfiniteLogos } from "../../ui/infinite-logos";
import { HeroAsciiBackground } from "../ascii-background";
import { SiWebrtc, SiFfmpeg, SiApachekafka, SiKubernetes, SiPostgresql, SiDocker, SiTypescript, SiReact } from "react-icons/si";

export const HeroMobile = () => {
  return (
    <section className="relative flex flex-col items-center px-4 pt-24 pb-2 overflow-hidden bg-black/[0.96]">
      <HeroAsciiBackground variant="mobile" />
      <div className="w-full text-center relative z-10 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/15 mb-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute opacity-60" />
          <span className="w-2 h-2 bg-emerald-400 rounded-full relative" />
          <span className="text-gray-200 text-xs">Senior Software Engineer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[28px] font-normal text-white mb-4 leading-[1.1] tracking-[-0.02em] font-satoshi px-2"
        >
          Engineering real-time media and distributed platforms, from architecture to production.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/70 max-w-[420px] mx-auto mb-6 px-4"
        >
          <p className="text-sm leading-relaxed tracking-wide font-sans">
            Senior Software Engineer specializing in video streaming, real-time media, and distributed systems. I design, build, and operate software end to end, connecting backend architecture, platform engineering, and user-facing applications with a focus on reliability, performance, and sustainable complexity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-3 mb-8 px-4"
        >
          <button
            onClick={async () => {
              const cal = await getCalApi();
              cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
            }}
            className="w-full max-w-[280px] backdrop-blur-md bg-white/20 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
          >
            Get in Touch
          </button>
          
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full max-w-[280px] backdrop-blur-sm bg-black/40 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/50 transition-all duration-300"
          >
            Explore My Work
          </button>
        </motion.div>

        {/* Infinite logos carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full mt-12 mb-12"
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

