"use client";

import { useIsMobile } from "@/lib/hooks/use-mobile";
import { AboutSectionDesktop } from "./desktop/about-section";
import { AboutSectionMobile } from "./mobile/about-section";

export const AboutSection = () => {
  const isMobile = useIsMobile();

  return isMobile ? <AboutSectionMobile /> : <AboutSectionDesktop />;
};

