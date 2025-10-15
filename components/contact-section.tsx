"use client";

import { motion } from "motion/react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { SiLinkedin, SiGithub, SiInstagram } from "react-icons/si";
import { getCalApi } from "@calcom/embed-react";

export function ContactSection() {

  return (
    <section id="contact" className="relative min-h-[70vh] flex items-center justify-center py-32 px-4 md:px-8 overflow-visible">
      {/* Spotlight background - slightly overlaps previous section */}
      <div className="absolute -top-16 md:-top-8 left-0 right-0 h-[160%] w-full pointer-events-none">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 30%, 90%, .15) 0, hsla(210, 20%, 70%, .08) 50%, hsla(210, 15%, 60%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(210, 25%, 88%, .12) 0, hsla(210, 15%, 75%, .06) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(210, 20%, 85%, .08) 0, hsla(210, 10%, 70%, .04) 80%, transparent 100%)"
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 text-center">
        {/* Bottom CTA - text + animated button like Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center gap-6 max-w-[840px] mx-auto"
        >
          {/* Available for Work Badge - right above title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
              <span className="relative inline-flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-white text-xs">Available For Work</span>
            </div>
          </motion.div>
                  <h3 className="text-white font-satoshi text-[36px] font-normal leading-snug">
                    Ready to build something amazing together? Let&apos;s turn your ideas into powerful mobile and web solutions!
                  </h3>
          <HoverBorderGradient
            as="button"
            onClick={async () => {
              const cal = await getCalApi();
              cal("modal", { calLink: "afonso-burginski-fyh9nv/30min" });
            }}
            containerClassName="rounded-xl"
            className="text-white font-medium text-base font-sans px-7 py-3"
            duration={1}
            clockwise={true}
          >
            Book a Free Call
          </HoverBorderGradient>

          {/* Social Row */}
          <div className="flex items-center gap-6 mt-2 text-white/80">
            <a href="https://www.linkedin.com/in/afonsoburginski/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors">
              <SiLinkedin size={20} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://github.com/afonsoburginski" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors">
              <SiGithub size={20} />
            </a>
            <div className="w-px h-4 bg-white/30" />
            <a href="https://www.instagram.com/afonso_burginski?igsh=MWVhYXF0am9jNzIwMw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <SiInstagram size={20} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

