import type { MasonryItem } from "@/components/ui/masonry";
import type { Project } from "@/lib/schema";

export const toMasonryItems = (projects: Project[]): MasonryItem[] =>
  projects.flatMap((project) =>
    project.image
      ? [{
          id: project.slug,
          img: project.image,
          title: project.title,
          description: project.description,
          url: project.link ?? "#",
          alt: project.title,
        }]
      : []
  );
