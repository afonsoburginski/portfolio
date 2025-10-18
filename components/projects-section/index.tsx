"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ProjectsSectionDesktop } from "./desktop/projects-section";
import { ProjectsSectionMobile } from "./mobile/projects-section";

export const ProjectsSection = () => {
  const isMobile = useIsMobile();

  return isMobile ? <ProjectsSectionMobile /> : <ProjectsSectionDesktop />;
};

