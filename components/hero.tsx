"use client";
import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { InfiniteLogos } from "./ui/infinite-logos";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { Spotlight } from "./ui/spotlight-new";
import { SiReact, SiNextdotjs, SiNodedotjs, SiGo, SiSupabase } from "react-icons/si";

export const Hero = () => {
  return (
    <section className="relative flex flex-col items-center px-6 pt-32 pb-6 overflow-hidden bg-black/[0.96]">
      {/* Spotlight effect */}
      <div className="absolute inset-0 w-full h-full">
        <Spotlight 
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 30%, 90%, .15) 0, hsla(210, 20%, 70%, .08) 50%, hsla(210, 15%, 60%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 25%, 88%, .12) 0, hsla(210, 15%, 75%, .06) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 20%, 85%, .08) 0, hsla(210, 10%, 70%, .04) 80%, transparent 100%)"
        />
      </div>
      <div className="max-w-[1600px] mx-auto text-center relative z-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/15 mb-8 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        >
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute opacity-60" />
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full relative" />
          <span className="text-gray-200 text-sm">Senior Mobile Developer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[56px] md:text-[80px] lg:text-[96px] font-normal text-white mb-4 leading-[1.03] tracking-[-0.02em] font-satoshi"
        >
          Mobile Apps that
          <br />
          users love Indeed
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/70 max-w-[600px] mx-auto mb-6"
        >
          <p className="text-base md:text-lg leading-relaxed tracking-wide font-sans">
            Transforming ideas into powerful mobile experiences with React Native and Next.js. 6+ years building scalable apps that users love.
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
            Let's Build Together
          </HoverBorderGradient>
          
          <HoverBorderGradient
            as="button"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            containerClassName="rounded-xl"
            className="backdrop-blur-sm bg-black/40 text-white font-medium text-base font-sans px-7 py-3"
            duration={1}
            clockwise={false}
          >
            View Projects
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
              { name: "React Native", icon: SiReact },
              { name: "Next.js", icon: SiNextdotjs },
              { name: "Node.js", icon: SiNodedotjs },
              { name: "Golang", icon: SiGo },
              { name: "Supabase", icon: SiSupabase },
            ]}
            direction="left"
            speed="fast"
          />
        </motion.div>
      </div>
    </section>
  );
};

