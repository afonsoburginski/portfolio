"use client";
import { motion } from "motion/react";
import { Meteors } from "./ui/meteors";
import { getCalApi } from "@calcom/embed-react";
import { InfiniteLogos } from "./ui/infinite-logos";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

export const Hero = () => {
  return (
    <section className="relative flex flex-col items-center px-6 pt-32 pb-6">
      {/* Meteors effect */}
      <Meteors number={30} />
      <div className="max-w-[1600px] mx-auto text-center z-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/15 mb-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        >
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute opacity-60" />
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative" />
          <span className="text-gray-200 text-sm">Crafting Unique Brand Identities</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[56px] md:text-[80px] lg:text-[96px] font-light text-white mb-4 leading-[1.03] tracking-[-0.02em]"
        >
          Branding that you
          <br />
          need Indeed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/70 text-base md:text-lg max-w-[600px] mx-auto mb-6 font-normal leading-relaxed tracking-wide"
        >
          Elevate your brand with custom identity and package design. Showcase your story through bold visuals and strategic design solutions.
        </motion.p>

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
              cal("modal", { calLink: "rick/get-rick-rolled" });
            }}
            containerClassName="rounded-xl"
            className="backdrop-blur-md bg-white/20 text-white font-medium text-sm px-7 py-3"
            duration={1}
            clockwise={true}
          >
            Get Started Now
          </HoverBorderGradient>
          
          <HoverBorderGradient
            as="button"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            containerClassName="rounded-xl"
            className="backdrop-blur-sm bg-black/40 text-white font-medium text-sm px-7 py-3"
            duration={1}
            clockwise={false}
          >
            Ver Projetos
          </HoverBorderGradient>
        </motion.div>

        {/* Infinite logos carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-4xl mx-auto mt-8"
        >
          <InfiniteLogos
            items={[
              { name: "Opal" },
              { name: "Dune" },
              { name: "Oasis" },
              { name: "Asterisk" },
              { name: "Eooks" },
            ]}
            direction="left"
            speed="fast"
          />
        </motion.div>
      </div>
    </section>
  );
};

