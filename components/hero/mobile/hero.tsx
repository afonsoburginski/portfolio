"use client";
import { motion } from "motion/react";
import { getCalApi } from "@calcom/embed-react";
import { InfiniteLogos } from "../../ui/infinite-logos";
import { Spotlight } from "../../ui/spotlight-new";
import { SiReact, SiApple, SiAndroid, SiKotlin, SiSwift, SiTypescript, SiPostgresql, SiSupabase, SiDocker } from "react-icons/si";

export const HeroMobile = () => {
  return (
    <section className="relative flex flex-col items-center px-4 pt-24 pb-2 overflow-hidden bg-black/[0.96]">
      {/* Spotlight effect */}
      <div className="absolute inset-0 w-full h-full">
        <Spotlight 
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 30%, 90%, .15) 0, hsla(210, 20%, 70%, .08) 50%, hsla(210, 15%, 60%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 25%, 88%, .12) 0, hsla(210, 15%, 75%, .06) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 20%, 85%, .08) 0, hsla(210, 10%, 70%, .04) 80%, transparent 100%)"
        />
      </div>
      <div className="w-full text-center relative z-10 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/15 mb-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute opacity-60" />
          <span className="w-2 h-2 bg-emerald-400 rounded-full relative" />
          <span className="text-gray-200 text-xs">Senior Mobile Developer</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[32px] font-normal text-white mb-4 leading-[1.1] tracking-[-0.02em] font-satoshi px-2"
        >
          Apps that users love indeed
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/70 max-w-[420px] mx-auto mb-6 px-4"
        >
          <p className="text-sm leading-relaxed tracking-wide font-sans">
            React Native and native (Kotlin, Swift) for iOS and Android. 6+ years shipping apps to the App Store and Google Play.
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
            Let&apos;s Build Together
          </button>
          
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full max-w-[280px] backdrop-blur-sm bg-black/40 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/50 transition-all duration-300"
          >
            View Projects
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
              { name: "React Native", icon: SiReact },
              { name: "iOS", icon: SiApple },
              { name: "Android", icon: SiAndroid },
              { name: "Kotlin", icon: SiKotlin },
              { name: "Swift", icon: SiSwift },
              { name: "TypeScript", icon: SiTypescript },
              { name: "PostgreSQL", icon: SiPostgresql },
              { name: "Supabase", icon: SiSupabase },
              { name: "Docker", icon: SiDocker },
            ]}
            direction="left"
            speed="normal"
          />
        </motion.div>
      </div>
    </section>
  );
};

