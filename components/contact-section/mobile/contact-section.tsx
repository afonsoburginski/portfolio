"use client";

import { motion } from "motion/react";
import { Spotlight } from "../../ui/spotlight-new";
import { SiLinkedin, SiGithub, SiInstagram } from "react-icons/si";
import { getCalApi } from "@calcom/embed-react";

export function ContactSectionMobile() {

  return (
    <section id="social" className="relative min-h-[60vh] flex items-center justify-center py-20 px-4 overflow-visible">
      {/* Spotlight background */}
      <div className="absolute -top-8 left-0 right-0 h-[140%] w-full pointer-events-none">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 30%, 90%, .15) 0, hsla(210, 20%, 70%, .08) 50%, hsla(210, 15%, 60%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 25%, 88%, .12) 0, hsla(210, 15%, 75%, .06) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 20%, 85%, .08) 0, hsla(210, 10%, 70%, .04) 80%, transparent 100%)"
        />
      </div>
      <div className="w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-6"
        >
          {/* Available for Work Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="mb-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
              <span className="relative inline-flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
              </span>
              <span className="text-white text-xs">Available For Work</span>
            </div>
          </motion.div>
          
          <h3 className="text-white font-satoshi text-[24px] font-normal leading-snug px-4">
            Let&apos;s build something amazing together. I&apos;m ready to turn your ideas into powerful solutions.
          </h3>
          
          <button
            onClick={async () => {
              const cal = await getCalApi();
              cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
            }}
            className="w-full max-w-[280px] backdrop-blur-md bg-white/20 text-white font-medium text-sm font-sans px-6 py-3 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
          >
            Book a Free Call
          </button>

          {/* Social Row */}
          <div className="flex items-center gap-5 mt-2 text-white/80">
            <a href="https://www.linkedin.com/in/afonsoburginski/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
              <SiLinkedin size={18} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://github.com/afonsoburginski" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors">
              <SiGithub size={18} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://www.instagram.com/afonso_burginski?igsh=MWVhYXF0am9jNzIwMw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <SiInstagram size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

