"use client";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// 3 columns layout - left & right equal size, center slightly taller
// Portrait cards (height > width)
const col1 = [
  { id: 4, image: "/projects/orcanorte.png", height: 320, href: "/case-study/orcanorte" },
  { id: 2, image: "/projects/easydriver-admin.png", height: 320, href: "/case-study/easydriver" },
  { id: 3, image: "https://framerusercontent.com/images/RYRvZnstUexQMOl8zRyrvDfDT0.png", height: 320 },
];

const col2 = [
  { id: 1, image: "/projects/stormzplus.png", height: 360, href: "/case-study/stormzplus" },
  { id: 5, image: "/projects/nextjs-ffmpeg-transcoder-1.png", height: 360, href: "/case-study/nextjs-ffmpeg-transcoder" },
  { id: 6, image: "https://framerusercontent.com/images/jlIAaI4caPj3oVLaxetMd2RvY.png", height: 360 },
];

const col3 = [
  { id: 7, image: "/projects/gem-jhonrob-1.png", height: 320, href: "/case-study/gem-jhonrob" },
  { id: 8, image: "https://framerusercontent.com/images/MM7F7DNjn9gGQjHqbiowegENsRY.png", height: 320 },
  { id: 9, image: "https://framerusercontent.com/images/W7bXB4tsou7l5mHYU8sze3sBeg.png", height: 320 },
];

const columns = [col1, col2, col3];

export const ProjectsSection = () => {
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
  const blurAmount = Math.max(0, 20 - (scrollY / 10)); // Changed from 15 to 10 for even faster transition
  const opacity = Math.min(1, Math.max(0.3, 1 - (blurAmount / 20)));

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
                  href={project.href ?? "https://www.behance.net/"}
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
                  {/* Image */}
                  <Image
                    src={project.image}
                    alt="project img"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
                    priority={project.id <= 3}
                  />

                  {/* Bottom CTA bar */}
                  <div className="absolute left-2 right-2 bottom-2 z-30">
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
