"use client";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

// 3 columns layout - left & right equal size, center slightly taller
// Portrait cards (height > width)
const col1 = [
  { id: 1, image: "https://framerusercontent.com/images/GkhJfmw17Q5eehve51WR25Ijjnk.png", height: 420 },
  { id: 2, image: "https://framerusercontent.com/images/bed888CTflXNK3KFX1R7VhRMtE.png", height: 420 },
  { id: 3, image: "https://framerusercontent.com/images/RYRvZnstUexQMOl8zRyrvDfDT0.png", height: 420 },
];

const col2 = [
  { id: 4, image: "https://framerusercontent.com/images/En1SV0rP485Zf5WOrpnHl3Nz658.png", height: 480 },
  { id: 5, image: "https://framerusercontent.com/images/roWFLkzHAotwSx5UxGPxpxMeA.jpg", height: 480 },
  { id: 6, image: "https://framerusercontent.com/images/jlIAaI4caPj3oVLaxetMd2RvY.png", height: 480 },
];

const col3 = [
  { id: 7, image: "https://framerusercontent.com/images/QqqmFNIdzb0HbOiMSHvqZXkwT7w.png", height: 420 },
  { id: 8, image: "https://framerusercontent.com/images/MM7F7DNjn9gGQjHqbiowegENsRY.png", height: 420 },
  { id: 9, image: "https://framerusercontent.com/images/W7bXB4tsou7l5mHYU8sze3sBeg.png", height: 420 },
];

const columns = [col1, col2, col3];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="relative pt-32 pb-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-row items-start justify-center gap-2.5 w-full">
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              className={`flex flex-col gap-2.5 flex-1 ${colIndex === 1 ? '-mt-24' : ''}`}
            >
              {column.map((project, index) => (
                <motion.a
                  key={project.id}
                  href="https://www.behance.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: colIndex * 0.1 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-[4px] cursor-pointer block"
                  style={{ height: project.height }}
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
                    <div className="w-full flex items-center justify-center gap-2 text-white text-[11px] font-medium backdrop-blur-md bg-white/20 border !border-white shadow-lg hover:bg-white/30 transition-all duration-300 px-4 py-2 rounded-full">
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
