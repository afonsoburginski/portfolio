"use client";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

const projects = [
  { id: 1, image: "/projects/stormzplus.png", href: "/case-study/stormzplus", title: "Stormz+ Web" },
  { id: 10, image: "/projects/stormzplus-app.png", href: "/case-study/stormzplus-mobile", title: "Stormz+ Mobile" },
  { id: 4, image: "/projects/orcanorte.png", href: "/case-study/orcanorte", title: "Orcanorte" },
  { id: 2, image: "/projects/easydriver-admin.png", href: "/case-study/easydriver", title: "EasyDriver" },
  { id: 5, image: "/projects/nextjs-ffmpeg-transcoder-1.png", href: "/case-study/nextjs-ffmpeg-transcoder", title: "FFmpeg Transcoder" },
  { id: 7, image: "/projects/gem-jhonrob-1.png", href: "/case-study/gem-jhonrob", title: "GEM JHONROB" },
];

export const ProjectsSectionMobile = () => {
  return (
    <section id="projects" className="relative pt-8 pb-12 px-4">
      <div className="w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-[36px] font-normal text-white mb-3 leading-[1.1] tracking-[-0.02em] font-satoshi">
            Featured Projects
          </h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">
            Selected work from recent years
          </p>
        </motion.div>

        {/* Single column stack */}
        <div className="flex flex-col gap-4">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.href ?? "https://www.behance.net/"}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg cursor-pointer block"
              style={{ 
                height: '280px',
              }}
            >
              {/* Image */}
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="100vw"
                className="object-cover transition-all duration-500 filter grayscale group-hover:grayscale-0"
                priority={project.id <= 2}
              />

              {/* Bottom CTA bar */}
              <div className="absolute left-2 right-2 bottom-2 z-30">
                <div className="w-full flex items-center justify-center gap-2 text-white text-sm font-normal font-sans backdrop-blur-md bg-white/20 border !border-white shadow-lg transition-all duration-300 px-4 py-2.5 rounded-full">
                  <span>View Casestudy</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

