"use client";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/schema";

export const ProjectsSectionDesktop = ({ projects }: { projects: Project[] }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate blur amount based on scroll position
  // When at top (scrollY = 0), blur is maximum (20px)
  // As user scrolls down, blur decreases much faster
  const blurAmount = Math.max(0, 20 - (scrollY / 10));
  const opacity = Math.min(1, Math.max(0.3, 1 - (blurAmount / 20)));

  // Distribute projects round-robin into 3 columns by index % 3.
  // Middle column (idx 1) renders slightly taller to keep the original visual.
  const columns: Project[][] = [[], [], []];
  projects.forEach((p, i) => columns[i % 3].push(p));

  return (
    <section id="projects" className="relative pt-32 pb-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-row items-start justify-center gap-2.5 w-full">
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              className={`flex flex-col gap-2.5 flex-1 ${colIndex === 1 ? '-mt-22' : ''}`}
            >
              {column.map((project, index) => (
                <motion.a
                  key={project.id}
                  href={project.link ?? "#"}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: colIndex * 0.1 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-[4px] cursor-pointer block"
                  style={{
                    height: `clamp(${colIndex === 1 ? '512px' : '462.72px'}, ${colIndex === 1 ? '55vh' : '48vh'}, ${colIndex === 1 ? '585px' : '520px'})`,
                    transform: colIndex === 1 ? 'scale(1.05)' : 'scale(1)',
                    filter: `blur(${blurAmount}px)`,
                    opacity: opacity,
                    transition: 'filter 0.3s ease-out, opacity 0.3s ease-out'
                  }}
                >
                  {project.image && (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
                      priority={index === 0}
                    />
                  )}

                  {/* Bottom CTA bar — só aparece no hover */}
                  <div className="absolute left-2 right-2 bottom-2 z-30 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                    <div className="w-full flex items-center justify-center gap-2 text-white text-base font-normal font-sans backdrop-blur-md bg-white/20 border !border-white shadow-lg hover:bg-white/30 transition-all duration-300 px-5 py-3 rounded-full">
                      <span>View Casestudy</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
