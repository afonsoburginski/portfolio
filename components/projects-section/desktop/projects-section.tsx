"use client";
import { useRouter } from "next/navigation";
import Masonry, { type MasonryItem } from "@/components/ui/masonry";
import type { Project } from "@/lib/schema";
import { toMasonryItems } from "../to-masonry-items";

export const ProjectsSectionDesktop = ({ projects }: { projects: Project[] }) => {
  const router = useRouter();

  const openCaseStudy = (item: MasonryItem, _index: number, event: React.MouseEvent<HTMLElement>) => {
    if (!item.url?.startsWith("/")) return;
    event.preventDefault();
    router.push(item.url);
  };

  return (
    <section id="projects" className="relative pt-32 pb-12 px-6">
      <div className="max-w-[1600px] mx-auto">
        <Masonry
          items={toMasonryItems(projects)}
          columns={3}
          gap={10}
          radius={4}
          hoverEffect="lift"
          captions="hover"
          revealOnScroll
          lightbox={false}
          draggable={false}
          onItemClick={openCaseStudy}
        />
      </div>
    </section>
  );
};
