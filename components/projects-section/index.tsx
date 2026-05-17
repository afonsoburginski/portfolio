"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ProjectsSectionDesktop } from "./desktop/projects-section";
import { ProjectsSectionMobile } from "./mobile/projects-section";
import type { Project } from "@/lib/schema";

export const ProjectsSection = ({ projects }: { projects: Project[] }) => {
  const isMobile = useIsMobile();

  return isMobile
    ? <ProjectsSectionMobile projects={projects} />
    : <ProjectsSectionDesktop projects={projects} />;
};
