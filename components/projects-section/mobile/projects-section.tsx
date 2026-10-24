"use client";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Masonry, { type MasonryItem } from "@/components/ui/masonry";
import type { Project } from "@/lib/schema";
import { toMasonryItems } from "../to-masonry-items";

export const ProjectsSectionMobile = ({ projects }: { projects: Project[] }) => {
  const router = useRouter();

  const openCaseStudy = (item: MasonryItem, _index: number, event: React.MouseEvent<HTMLElement>) => {
    if (!item.url?.startsWith("/")) return;
    event.preventDefault();
    router.push(item.url);
  };

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
            Selected Systems
          </h2>
          <p className="text-white/70 text-sm leading-relaxed font-sans">
            Engineering work across streaming, platforms, and product systems
          </p>
        </motion.div>

        <Masonry
          items={toMasonryItems(projects)}
          columns={1}
          gap={12}
          radius={8}
          hoverEffect="none"
          captions="always"
          revealOnScroll
          lightbox={false}
          draggable={false}
          onItemClick={openCaseStudy}
        />
      </div>
    </section>
  );
};
