"use client";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const projects = [
  { id: 1, image: "/projects/stormzplus.png", href: "/case-study/stormzplus", title: "Stormz+ Web" },
  { id: 10, image: "/projects/stormzplus-app.png", href: "/case-study/stormzplus-mobile", title: "Stormz+ Mobile" },
  { id: 4, image: "/projects/orcanorte.png", href: "/case-study/orcanorte", title: "Orcanorte" },
  { id: 2, image: "/projects/easydriver-admin.png", href: "/case-study/easydriver", title: "EasyDriver" },
  { id: 5, image: "/projects/nextjs-ffmpeg-transcoder-1.png", href: "/case-study/nextjs-ffmpeg-transcoder", title: "FFmpeg Transcoder" },
  { id: 7, image: "/projects/gem-jhonrob-1.png", href: "/case-study/gem-jhonrob", title: "GEM JHONROB" },
];

const ProjectCard = ({ project, index }: { project: typeof projects[0], index: number }) => {
  const [isInFocus, setIsInFocus] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Considera em foco se estiver 60% ou mais visível
          setIsInFocus(entry.isIntersecting && entry.intersectionRatio >= 0.6);
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
        rootMargin: "-20% 0px -20% 0px", // Foco no centro vertical da tela
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <motion.a
      ref={cardRef}
      href={project.href ?? "https://www.behance.net/"}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg cursor-pointer block"
      style={{ 
        height: '400px',
      }}
    >
      {/* Image with zoom when in focus */}
      <motion.div 
        className="absolute inset-0"
        animate={{ scale: isInFocus ? 1.05 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="100vw"
          className="object-contain"
          priority={project.id <= 2}
          style={{ filter: 'grayscale(0)' }}
        />
      </motion.div>

      {/* Gradient overlay for better text visibility - appears when in focus */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"
        animate={{ opacity: isInFocus ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Top shadow for title legibility - always visible */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 via-black/20 to-transparent z-10" />

      {/* Project Title - Top - appears when in focus */}
      <motion.div 
        className="absolute top-4 left-4 right-4 z-20"
        animate={{ opacity: isInFocus ? 1 : 0, y: isInFocus ? 0 : 10 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-white text-2xl font-medium font-satoshi drop-shadow-2xl">
          {project.title}
        </h3>
      </motion.div>

      {/* Bottom CTA bar */}
      <div className="absolute left-2 right-2 bottom-2 z-30">
        <div className="w-full flex items-center justify-center gap-2 text-white text-sm font-normal font-sans backdrop-blur-md bg-white/20 border !border-white shadow-lg transition-all duration-300 px-4 py-2.5 rounded-full">
          <span>View Casestudy</span>
          <ArrowUpRight size={14} />
        </div>
      </div>
    </motion.a>
  );
};

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
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

