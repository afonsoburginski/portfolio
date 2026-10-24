import type { MasonryItem } from "@/components/ui/masonry";
import type { Project } from "@/lib/schema";

// Masonry renders plain <img>, so route sources through the Next optimizer
// (resized WebP/AVIF, cached for a year) instead of the multi-MB originals.
// `width` must be one of Next's configured deviceSizes (640, 750, 828, 1080, ...).
const optimized = (src: string, width: number) =>
  src.startsWith("http") ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : src;

export const toMasonryItems = (projects: Project[], width = 828): MasonryItem[] =>
  projects.flatMap((project) =>
    project.image
      ? [{
          id: project.slug,
          img: optimized(project.image, width),
          title: project.title,
          description: project.description,
          url: project.link ?? "#",
          alt: project.title,
        }]
      : []
  );
